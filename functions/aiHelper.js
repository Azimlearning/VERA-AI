// functions/aiHelper.js

const { GoogleGenerativeAI } = require("@google/generative-ai");
const { getStorage } = require("firebase-admin/storage");
const pdf = require('pdf-parse');
const mammoth = require('mammoth');
const { createWorker } = require('tesseract.js');
const os = require('os');
const fs = require('fs');
const path = require('path');

// --- NEW: Import Model Definitions ---
const { TEXT_GENERATION_MODELS, IMAGE_GENERATION_MODELS } = require('./ai_models');
// --- END NEW ---

// Import prompt templates
const { buildPrompt, buildDomainContext, loadPromptFromFile } = require('./promptTemplates');
const { formatRAGContext, buildJSONSchemaSpec } = require('./promptHelpers');

const OPENROUTER_CHAT_URL = "https://openrouter.ai/api/v1/chat/completions";
const OPENROUTER_IMAGE_URL = "https://openrouter.ai/api/v1/images/generations";

/**
 * Tries to generate text content by iterating through a model chain.
 * Returns both the text and metadata about which model was used.
 * @param {string} prompt - The prompt to send to the model
 * @param {object} keys - API keys object
 * @param {boolean} outputJson - Whether to request JSON output
 * @returns {Promise<{text: string, metadata: object}>} Object with text and model metadata
 */
async function generateWithFallback(prompt, keys, outputJson = false) {
  // Use the text chain
  const AI_MODEL_CHAIN = TEXT_GENERATION_MODELS; 
  const fetch = (await import('node-fetch')).default;
  let lastError = null;
  const promptLength = prompt.length;
  const approxTokens = Math.ceil(promptLength / 4); // Rough estimate: ~4 chars per token

  console.log(`[generateWithFallback] Starting generation with ${AI_MODEL_CHAIN.length} models in chain`);
  console.log(`[generateWithFallback] Prompt length: ${promptLength} chars (~${approxTokens} tokens)`);

  for (let i = 0; i < AI_MODEL_CHAIN.length; i++) {
    const config = AI_MODEL_CHAIN[i];
    const modelStartTime = Date.now();
    
    try {
      console.log(`[generateWithFallback] [${i + 1}/${AI_MODEL_CHAIN.length}] Attempting model: ${config.model} (type: ${config.type})`);
      let resultText;
      let responseMetadata = {};

      if (config.type === 'gemini') {
        // --- Call Google Gemini API (using API Key) ---
        const genAI = new GoogleGenerativeAI(keys.gemini);
        const model = genAI.getGenerativeModel({ model: config.model });
        
        // Set max output tokens for longer responses (especially for podcast generation)
        // Default to 5000 tokens for comprehensive outputs, adjust based on prompt length
        const estimatedOutputTokens = Math.min(5000, Math.max(2000, Math.ceil(promptLength / 4) * 2));
        const generationConfig = outputJson 
          ? { responseMimeType: "application/json", maxOutputTokens: estimatedOutputTokens }
          : { maxOutputTokens: estimatedOutputTokens };
        const result = await model.generateContent(prompt, generationConfig);
        resultText = result.response.text();
        
        // Extract metadata if available
        if (result.response.usageMetadata) {
          responseMetadata = {
            promptTokenCount: result.response.usageMetadata.promptTokenCount,
            candidatesTokenCount: result.response.usageMetadata.candidatesTokenCount,
            totalTokenCount: result.response.usageMetadata.totalTokenCount
          };
        }

      } else if (config.type === 'openrouter') {
        // --- Call OpenRouter Chat API ---
        // Trim API key to remove any whitespace/newlines
        const openRouterKey = (keys.openrouter || '').trim();
        
        const headers = {
          'Authorization': `Bearer ${openRouterKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': `https://console.firebase.google.com/project/${process.env.GCP_PROJECT || 'systemicshiftv2'}`,
          'X-Title': 'Systemic Shift AI',
        };

        // Set max_tokens for longer responses (especially for podcast generation)
        // Default to 5000 tokens for comprehensive outputs, adjust based on prompt length
        const estimatedOutputTokens = Math.min(5000, Math.max(2000, Math.ceil(promptLength / 4) * 2));
        
        const body = {
          model: config.model,
          messages: [{ role: 'user', content: prompt }],
          response_format: outputJson ? { type: 'json_object' } : { type: 'text' },
          max_tokens: estimatedOutputTokens,
        };

        const response = await fetch(OPENROUTER_CHAT_URL, {
          method: 'POST',
          headers: headers,
          body: JSON.stringify(body),
        });

        if (!response.ok) {
          const errText = await response.text();
          throw new Error(`OpenRouter error (${response.status}) on ${config.model}: ${errText}`);
        }

        const data = await response.json();
        resultText = data.choices[0].message.content;
        
        // Extract metadata from OpenRouter response
        if (data.usage) {
          responseMetadata = {
            promptTokens: data.usage.prompt_tokens,
            completionTokens: data.usage.completion_tokens,
            totalTokens: data.usage.total_tokens
          };
        }
      }

      const modelLatency = Date.now() - modelStartTime;
      const responseLength = resultText.length;
      const cleanedText = resultText.replace(/```json\n?|\n?```/g, '').trim();

      // Build metadata object
      const metadata = {
        model: config.model,
        modelType: config.type,
        modelIndex: i,
        success: true,
        latencyMs: modelLatency,
        responseLength: responseLength,
        promptLength: promptLength,
        ...responseMetadata
      };

      console.log(`[generateWithFallback] ✅ Success with model: ${config.model}`);
      console.log(`[generateWithFallback]   - Latency: ${modelLatency}ms`);
      console.log(`[generateWithFallback]   - Response length: ${responseLength} chars`);
      if (responseMetadata.totalTokens || responseMetadata.totalTokenCount) {
        console.log(`[generateWithFallback]   - Tokens: ${responseMetadata.totalTokens || responseMetadata.totalTokenCount}`);
      }

      // Return object with both text and metadata
      return {
        text: cleanedText,
        metadata: metadata
      };

    } catch (error) {
      const modelLatency = Date.now() - modelStartTime;
      console.warn(`[generateWithFallback] ❌ Failed with model ${config.model} (${modelLatency}ms):`, error.message);
      lastError = error;
      
      // If this is not the last model, continue to next
      if (i < AI_MODEL_CHAIN.length - 1) {
        console.log(`[generateWithFallback]   → Falling back to next model...`);
      }
    }
  }

  // If all models in the chain failed
  console.error("[generateWithFallback] ❌ All AI models in the fallback chain failed.");
  console.error("[generateWithFallback] Last error:", lastError?.message);
  
  // Return error with metadata
  const errorMetadata = {
    success: false,
    error: lastError?.message || 'Unknown error',
    modelsAttempted: AI_MODEL_CHAIN.length
  };
  
  throw Object.assign(lastError || new Error('All models failed'), { metadata: errorMetadata });
}

/**
 * Generates an image using OpenRouter Image Models with fallback.
 */
async function generateImage(infographicConcept, keys) {
  const fetch = (await import('node-fetch')).default;
  const IMAGE_MODEL_CHAIN = IMAGE_GENERATION_MODELS;
  const concept = infographicConcept;

  const visualPrompt = `Create a professional, flat-design corporate infographic for PETRONAS Upstream. Use a vertical layout. Color palette MUST primarily use TEAL, WHITE, and LIGHT GRAY.\nTitle: "${concept.title || 'Optimizing Operations'}"\nSections: Describe the content using simple, clear icons and bold metrics.\nKey Metrics: ${concept.keyMetrics?.map(m => `${m.label}: ${m.value}`).join('; ') || 'N/A'};\nVisual Style: ${concept.visualStyle || 'Flat design, minimal icons, professional, modern.'}\n\nDo NOT include text directly on the image. Focus on visual representation of the data and corporate themes.`;

  let lastError = null;
  for (const config of IMAGE_MODEL_CHAIN) {
    try {
      console.log(`Image Gen: Attempting model ${config.model}`);
      
      // Trim API key to remove any whitespace/newlines
      const openRouterKey = (keys.openrouter || '').trim();
      
      const headers = {
        'Authorization': `Bearer ${openRouterKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': `https://console.firebase.google.com/project/${process.env.GCP_PROJECT || 'systemicshiftv2'}`,
        'X-Title': 'Systemic Shift AI Image',
      };

      const response = await fetch(OPENROUTER_IMAGE_URL, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
          model: config.model,
          prompt: visualPrompt,
          size: "1024x1024",
          n: 1,
          response_format: "url", 
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Image API Error (${response.status}) on ${config.model}: ${JSON.stringify(errorData)}`);
      }

      const data = await response.json();
      
      if (data.data && data.data.length > 0) {
        const tempImageUrl = data.data[0].url;
        console.log(`Image Gen: Successful URL received from ${config.model}.`);
        return tempImageUrl; // Success!
      }
      
      throw new Error("Image API did not return a valid URL in response data.");

    } catch (error) {
      console.warn(`Image Gen Failed (${config.model}): ${error.message}`);
      lastError = error;
    }
  }

  throw new Error(`All image models failed: ${lastError ? lastError.message : "Unknown error."}`);
}

/**
 * Downloads a file from Storage and extracts its text content.
 */
async function extractTextFromFiles(storyData) {
    const fileUrl = storyData.writeUpURL;
    if (!fileUrl) {
        console.log("No writeUpURL found, skipping text extraction.");
        return "";
    }

    const fileUrlObj = new URL(fileUrl);
    const filePath = decodeURIComponent(fileUrlObj.pathname).replace(/^\/v0\/b\/[^\/]+\/o\//, '');
    
    const fileExt = path.extname(filePath).toLowerCase();
    const allowedTextExt = ['.pdf', '.docx'];
    const allowedImageExt = ['.png', '.jpg', '.jpeg'];

    if (!allowedTextExt.includes(fileExt) && !allowedImageExt.includes(fileExt)) {
        console.log(`File type (${fileExt}) is not supported for text extraction.`);
        return "";
    }

    const bucket = getStorage().bucket("systemicshiftv2.firebasestorage.app");
    const tempFilePath = path.join(os.tmpdir(), path.basename(filePath));

    try {
        console.log(`Downloading file from Storage: ${filePath}`);
        await bucket.file(filePath).download({ destination: tempFilePath });
        console.log(`File downloaded to: ${tempFilePath}`);

        let extractedText = "";
        if (allowedTextExt.includes(fileExt)) {
            if (fileExt === '.pdf') {
                const dataBuffer = fs.readFileSync(tempFilePath);
                const data = await pdf(dataBuffer);
                extractedText = data.text;
            } else if (fileExt === '.docx') {
                const result = await mammoth.extractRawText({ path: tempFilePath });
                extractedText = result.value;
            }
        } else if (allowedImageExt.includes(fileExt)) {
            console.log("Starting OCR process for image...");
            const worker = await createWorker('eng');
            const { data: { text } } = await worker.recognize(tempFilePath);
            extractedText = text;
            await worker.terminate();
            console.log("OCR process finished.");
        }

        fs.unlinkSync(tempFilePath);
        console.log("File text extracted successfully.");
        return extractedText;

    } catch (error) {
        console.error("Error during file text extraction:", error);
        if (fs.existsSync(tempFilePath)) {
            fs.unlinkSync(tempFilePath);
        }
        return "";
    }
}

/**
 * Analyzes an image using OpenRouter with Gemini Vision model to generate tags and suggest category.
 * @param {string} imageUrl - Public URL of the image to analyze
 * @param {object} keys - Object containing API keys { gemini, openrouter }
 * @param {string} ragContext - Optional RAG context from knowledge base for domain-specific analysis
 * @returns {Promise<object>} Object with tags array, category string, and optional description
 */
async function analyzeImageWithAI(imageUrl, keys, ragContext = '') {
  const fetch = (await import('node-fetch')).default;
  
  // Use a SHORT, CONCISE prompt for vision models to avoid token limit issues
  // Vision models handle images natively - the prompt should only describe the task, not include the image
  const prompt = `Analyze this image and respond with ONLY valid JSON (no markdown, no extra text):
{
  "tags": ["tag1", "tag2", ...up to 10 tags describing content],
  "category": "ONE of: Stock Images, Events, Team Photos, Infographics, Operations, Facilities",
  "description": "1-2 sentence description"
}

Focus on: people, activities, equipment, locations, events. Context: PETRONAS Upstream oil & gas.${ragContext ? `\n\nDomain context: ${ragContext.substring(0, 500)}` : ''}`;

  // Prefer direct OpenAI vision if available (handles base64 data URLs reliably)
  if (keys.openai) {
    const openaiModels = ['gpt-4o-mini', 'gpt-4o'];
    for (const model of openaiModels) {
      try {
        console.log(`[analyzeImageWithAI] Attempting OpenAI vision model: ${model}`);
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${keys.openai.trim()}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model,
            messages: [{
              role: 'user',
              content: [
                { type: 'text', text: prompt },
                { type: 'image_url', image_url: { url: imageUrl, detail: 'auto' } }
              ]
            }],
            response_format: { type: 'json_object' }
          })
        });

        if (!response.ok) {
          const errText = await response.text();
          console.error(`[analyzeImageWithAI] OpenAI error (${response.status}) on ${model}: ${errText}`);
          continue;
        }

        const data = await response.json();
        const resultText = data.choices?.[0]?.message?.content || '';
        let jsonText = resultText.trim().replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const analysisResult = JSON.parse(jsonText);

        if (!analysisResult.tags || !Array.isArray(analysisResult.tags) || !analysisResult.category) {
          throw new Error('Invalid OpenAI response format for image analysis');
        }

        return {
          tags: analysisResult.tags.slice(0, 10),
          category: analysisResult.category,
          description: analysisResult.description || ''
        };
      } catch (error) {
        console.warn(`[analyzeImageWithAI] OpenAI vision attempt failed (${model}): ${error.message}`);
      }
    }
  }

  // Check if image is a large base64 and needs compression
  const isBase64Image = imageUrl.startsWith('data:image/');
  const imageSize = imageUrl.length;
  const isLargeImage = imageSize > 500000; // > 500KB base64
  
  console.log(`[analyzeImageWithAI] Image info: isBase64=${isBase64Image}, size=${imageSize} bytes, isLarge=${isLargeImage}`);

  // Model list with fallback - using CORRECT OpenRouter model IDs
  // Vision-capable models that handle images natively (not as text tokens)
  const modelsToTry = [
    'openai/gpt-4o-mini',                     // OpenAI vision (cost-effective, handles large images well)
    'openai/gpt-4o',                          // OpenAI vision via OpenRouter
    'google/gemini-flash-1.5',                // Correct ID: Google Gemini 1.5 Flash
    'google/gemini-pro-vision',               // Correct ID: Google Gemini Pro Vision
    'anthropic/claude-3-haiku',               // Claude Haiku (fast)
    'anthropic/claude-3-sonnet',              // Claude Sonnet
  ];

  let lastError = null;
  const MAX_RETRIES = 1;  // Reduce retries since 400 errors won't resolve with retry
  
  // Helper function to detect transient errors worth retrying
  const isRetryableError = (status, errorText) => {
    // Don't retry 400 errors (invalid model, token limit) - they won't succeed
    if (status === 400) return false;
    const retryableStatuses = [429, 500, 502, 503, 504];
    const retryableMessages = ['rate limit', 'overloaded', 'timeout', 'temporarily', 'server error'];
    return retryableStatuses.includes(status) || 
           retryableMessages.some(msg => errorText.toLowerCase().includes(msg));
  };

  for (const model of modelsToTry) {
    let retryCount = 0;
    
    while (retryCount <= MAX_RETRIES) {
      try {
        console.log(`[analyzeImageWithAI] Attempting to analyze image with model: ${model} (attempt ${retryCount + 1}/${MAX_RETRIES + 1})`);
        console.log(`[analyzeImageWithAI] Image URL: ${imageUrl.substring(0, 100)}...`);
        
        // Trim API key to remove any whitespace/newlines
        const openRouterKey = (keys.openrouter || '').trim();
        
        if (!openRouterKey) {
          throw new Error('OpenRouter API key is missing or empty');
        }
        
        const headers = {
          'Authorization': `Bearer ${openRouterKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': `https://console.firebase.google.com/project/${process.env.GCP_PROJECT || 'systemicshiftv2'}`,
          'X-Title': 'Systemic Shift AI Image Analysis',
        };

        // Build request body - use 'low' detail for large images to reduce token count
        const imageDetail = isLargeImage ? 'low' : 'auto';
        
        const body = {
          model: model,
          messages: [
            {
              role: 'user',
              content: [
                { type: 'text', text: prompt },
                { type: 'image_url', image_url: { url: imageUrl, detail: imageDetail } }
              ]
            }
          ],
          // Add transforms to handle large payloads automatically
          transforms: ['middle-out'],
          max_tokens: 1000  // Limit response size
        };

        // Log request details (sanitized - no API key)
        console.log(`[analyzeImageWithAI] Request details:`, {
          model: model,
          url: OPENROUTER_CHAT_URL,
          imageUrlLength: imageUrl.length,
          imageDetail: imageDetail,
          hasOpenRouterKey: !!keys.openrouter,
          promptLength: prompt.length
        });

        const response = await fetch(OPENROUTER_CHAT_URL, {
          method: 'POST',
          headers: headers,
          body: JSON.stringify(body),
        });

        console.log(`[analyzeImageWithAI] Response status: ${response.status} ${response.statusText}`);

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`[analyzeImageWithAI] OpenRouter API error (${response.status}):`, errorText);
          
          // Check if error is retryable
          if (isRetryableError(response.status, errorText) && retryCount < MAX_RETRIES) {
            retryCount++;
            const delay = Math.pow(2, retryCount) * 1000; // Exponential backoff: 2s, 4s
            console.log(`[analyzeImageWithAI] Retryable error, waiting ${delay}ms before retry...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          }
          
          throw new Error(`OpenRouter error (${response.status}): ${errorText}`);
        }

      const data = await response.json();
      console.log(`[analyzeImageWithAI] Response received, checking format...`);
      
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        console.error(`[analyzeImageWithAI] Invalid response format:`, JSON.stringify(data).substring(0, 500));
        throw new Error('Invalid response format from OpenRouter: missing choices or message');
      }
      
      const resultText = data.choices[0].message.content;
      console.log(`[analyzeImageWithAI] Response content length: ${resultText.length} characters`);
      
      // Parse JSON from response
      let jsonText = resultText.trim();
      // Remove markdown code blocks if present
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      let analysisResult;
      try {
        analysisResult = JSON.parse(jsonText);
        console.log(`[analyzeImageWithAI] Successfully parsed JSON response`);
      } catch (parseError) {
        console.error(`[analyzeImageWithAI] JSON parse error:`, parseError.message);
        console.error(`[analyzeImageWithAI] JSON text (first 500 chars):`, jsonText.substring(0, 500));
        throw new Error(`Failed to parse JSON response: ${parseError.message}`);
      }
      
      // Validate and normalize the response
      if (!analysisResult.tags || !Array.isArray(analysisResult.tags)) {
        console.error(`[analyzeImageWithAI] Invalid response: tags missing or not an array`);
        throw new Error('Invalid response format: tags missing or not an array');
      }
      
      if (!analysisResult.category) {
        console.error(`[analyzeImageWithAI] Invalid response: category missing`);
        throw new Error('Invalid response format: category missing');
      }
      
      // Ensure category is from the allowed list
      const allowedCategories = ['Stock Images', 'Events', 'Team Photos', 'Infographics', 'Operations', 'Facilities'];
      if (!allowedCategories.includes(analysisResult.category)) {
        // Try to match closest category
        const originalCategory = analysisResult.category;
        const categoryLower = analysisResult.category.toLowerCase();
        if (categoryLower.includes('event') || categoryLower.includes('meeting') || categoryLower.includes('gathering')) {
          analysisResult.category = 'Events';
        } else if (categoryLower.includes('team') || categoryLower.includes('people') || categoryLower.includes('staff')) {
          analysisResult.category = 'Team Photos';
        } else if (categoryLower.includes('infographic') || categoryLower.includes('graphic') || categoryLower.includes('chart')) {
          analysisResult.category = 'Infographics';
        } else if (categoryLower.includes('operation') || categoryLower.includes('field') || categoryLower.includes('production')) {
          analysisResult.category = 'Operations';
        } else if (categoryLower.includes('facility') || categoryLower.includes('plant') || categoryLower.includes('infrastructure')) {
          analysisResult.category = 'Facilities';
        } else {
          analysisResult.category = 'Stock Images'; // Default fallback
        }
        console.log(`[analyzeImageWithAI] Normalized category from "${originalCategory}" to "${analysisResult.category}"`);
      }
      
        console.log(`[analyzeImageWithAI] Successfully analyzed image with ${model}`, {
          category: analysisResult.category,
          tagsCount: analysisResult.tags.length,
          hasDescription: !!analysisResult.description
        });
        
        return {
          tags: analysisResult.tags.slice(0, 10), // Limit to 10 tags
          category: analysisResult.category,
          description: analysisResult.description || ''
        };

      } catch (error) {
        console.error(`[analyzeImageWithAI] Error with model ${model} (attempt ${retryCount + 1}):`, {
          message: error.message,
          name: error.name,
          stack: error.stack?.substring(0, 500)
        });
        lastError = error;
        
        // Break out of retry loop if we've exhausted retries
        retryCount++;
        if (retryCount > MAX_RETRIES) {
          break;
        }
      }
    } // End of while retry loop
    
    // If this is not the last model, try the next one
    if (model !== modelsToTry[modelsToTry.length - 1]) {
      console.log(`[analyzeImageWithAI] Attempting fallback to next model...`);
    }
  } // End of for model loop

  // If we get here, all models failed
  console.error('[analyzeImageWithAI] All models failed. Last error:', lastError?.message);
  throw new Error(`Failed to analyze image with all models: ${lastError?.message || 'Unknown error'}`);
}

module.exports = {
  generateWithFallback,
  extractTextFromFiles,
  generateImage,
  analyzeImageWithAI // Export the new image analysis function
};
