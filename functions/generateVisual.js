// functions/generateVisual.js

const { analyzeImageWithAI } = require("./aiHelper");
const { ChatbotRAGRetriever } = require("./chatbotRAGRetriever");
const { sanitizePromptInput, detectPromptInjection, buildSecurityNotice } = require("./promptSecurity");

function createRequestId(prefix = 'vis') {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
}

/**
 * Analyzes an image using OCR to extract text
 * @param {string} imageUrl - URL of the image
 * @param {object} keys - API keys
 * @param {string} ragContext - Optional RAG context
 * @returns {Promise<object>} Object with extracted text
 */
async function extractOCRText(imageUrl, keys, ragContext = '') {
  const fetch = (await import('node-fetch')).default;
  const OPENROUTER_CHAT_URL = 'https://openrouter.ai/api/v1/chat/completions';
  
  const ocrPrompt = `Extract all text from this image. Return a JSON object with:
{
  "text": "All extracted text in order",
  "lines": ["line 1", "line 2", ...],
  "language": "detected language"
}

If no text is found, return {"text": "", "lines": [], "language": "unknown"}`;

  const prompt = ragContext 
    ? `${ocrPrompt}\n\n--- Context ---\n${ragContext}\n--- End Context ---\n\nUse context to better understand the image content.`
    : ocrPrompt;

  // Prefer direct OpenAI for vision OCR if available
  if (keys.openai) {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${keys.openai.trim()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
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

      if (response.ok) {
        const data = await response.json();
        const resultText = data.choices?.[0]?.message?.content || '';
        const jsonText = resultText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const ocrResult = JSON.parse(jsonText);
        return {
          text: ocrResult.text || '',
          lines: ocrResult.lines || [],
          language: ocrResult.language || 'unknown'
        };
      }
    } catch (error) {
      console.warn('[extractOCRText] OpenAI vision OCR failed, falling back:', error.message);
    }
  }

  // More reliable model list for OCR
  const modelsToTry = [
    'openai/gpt-4o-mini',
    'openai/gpt-4o',
    'google/gemini-2.0-flash-exp',
    'google/gemini-1.5-flash',
    'anthropic/claude-3-haiku'
  ];

  for (const model of modelsToTry) {
    try {
      const openRouterKey = (keys.openrouter || '').trim();
      if (!openRouterKey) {
        console.warn('[extractOCRText] OpenRouter API key is missing, skipping OpenRouter models');
        break;
      }

      console.log(`[extractOCRText] Trying model: ${model}`);
      
      const response = await fetch(OPENROUTER_CHAT_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openRouterKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': `https://console.firebase.google.com/project/${process.env.GCP_PROJECT || 'systemicshiftv2'}`,
          'X-Title': 'Systemic Shift AI OCR',
        },
        body: JSON.stringify({
          model: model,
          messages: [{
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              { type: 'image_url', image_url: { url: imageUrl } }
            ]
          }],
          response_format: { type: 'json_object' }
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        console.warn(`[extractOCRText] Model ${model} failed (${response.status}): ${errText.substring(0, 200)}`);
        continue;
      }

      const data = await response.json();
      if (data.choices?.[0]?.message?.content) {
        const resultText = data.choices[0].message.content.trim();
        const jsonText = resultText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const ocrResult = JSON.parse(jsonText);
        console.log(`[extractOCRText] Successfully extracted OCR with model: ${model}`);
        return {
          text: ocrResult.text || '',
          lines: ocrResult.lines || [],
          language: ocrResult.language || 'unknown'
        };
      }
    } catch (error) {
      console.warn(`[extractOCRText] Error with model ${model}:`, error.message);
      if (model === modelsToTry[modelsToTry.length - 1]) {
        console.error('[extractOCRText] All models failed for OCR');
      }
    }
  }

  return { text: '', lines: [], language: 'unknown' };
}

/**
 * Compares two images
 * @param {string} imageUrl1 - First image URL
 * @param {string} imageUrl2 - Second image URL
 * @param {object} keys - API keys
 * @returns {Promise<object>} Comparison results
 */
async function compareImages(imageUrl1, imageUrl2, keys) {
  const fetch = (await import('node-fetch')).default;
  const OPENROUTER_CHAT_URL = 'https://openrouter.ai/api/v1/chat/completions';
  
  const comparePrompt = `Compare these two images and provide:
1. Similarity score (0-100)
2. Key differences
3. Similarities
4. Visual analysis

Return JSON:
{
  "similarityScore": 85,
  "differences": ["difference 1", "difference 2"],
  "similarities": ["similarity 1", "similarity 2"],
  "analysis": "Detailed comparison analysis"
}`;

  // Prefer OpenAI vision if available
  if (keys.openai) {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${keys.openai.trim()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{
            role: 'user',
            content: [
              { type: 'text', text: comparePrompt },
              { type: 'image_url', image_url: { url: imageUrl1, detail: 'auto' } },
              { type: 'image_url', image_url: { url: imageUrl2, detail: 'auto' } }
            ]
          }],
          response_format: { type: 'json_object' }
        })
      });

      if (response.ok) {
        const data = await response.json();
        const resultText = data.choices?.[0]?.message?.content || '';
        const jsonText = resultText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        return JSON.parse(jsonText);
      }
    } catch (error) {
      console.warn('[compareImages] OpenAI vision comparison failed, falling back:', error.message);
    }
  }

  // More reliable model list for image comparison
  const modelsToTry = [
    'openai/gpt-4o-mini',
    'openai/gpt-4o',
    'google/gemini-2.0-flash-exp',
    'google/gemini-1.5-flash',
    'anthropic/claude-3-haiku'
  ];

  for (const model of modelsToTry) {
    try {
      const openRouterKey = (keys.openrouter || '').trim();
      if (!openRouterKey) {
        console.warn('[compareImages] OpenRouter API key is missing');
        break;
      }

      console.log(`[compareImages] Trying model: ${model}`);

      const response = await fetch(OPENROUTER_CHAT_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openRouterKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': `https://console.firebase.google.com/project/${process.env.GCP_PROJECT || 'systemicshiftv2'}`,
          'X-Title': 'Systemic Shift AI Image Comparison',
        },
        body: JSON.stringify({
          model: model,
          messages: [{
            role: 'user',
            content: [
              { type: 'text', text: comparePrompt },
              { type: 'image_url', image_url: { url: imageUrl1 } },
              { type: 'image_url', image_url: { url: imageUrl2 } }
            ]
          }],
          response_format: { type: 'json_object' }
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        console.warn(`[compareImages] Model ${model} failed (${response.status}): ${errText.substring(0, 200)}`);
        continue;
      }

      const data = await response.json();
      if (data.choices?.[0]?.message?.content) {
        const resultText = data.choices[0].message.content.trim();
        const jsonText = resultText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        console.log(`[compareImages] Successfully compared images with model: ${model}`);
        return JSON.parse(jsonText);
      }
    } catch (error) {
      console.warn(`[compareImages] Error with model ${model}:`, error.message);
      if (model === modelsToTry[modelsToTry.length - 1]) {
        console.error('[compareImages] All models failed for comparison');
        throw error;
      }
    }
  }

  throw new Error('Failed to compare images with all models');
}

/**
 * Generates visual analysis based on mode and input.
 * Supports single image analysis, batch processing, comparison, OCR, and similarity search.
 * 
 * @param {Object} geminiApiKey - Secret object for Gemini API key
 * @param {Object} openRouterApiKey - Secret object for OpenRouter API key
 * @returns {Function} Handler function for the Cloud Function
 */
function createGenerateVisualHandler(geminiApiKey, openRouterApiKey) {
  return async (req, res) => {
    const cors = require("cors")({ origin: true });
    
    cors(req, res, async () => {
      if (req.method !== "POST") {
        return res.status(405).send({ error: "Method Not Allowed" });
      }

      try {
        const { mode, imageUrl, imageUrls, imageUrl1, imageUrl2, context } = req.body;

        // Default to 'single' mode if not specified
        const analysisMode = mode || 'single';
        
        if (!['single', 'batch', 'compare', 'ocr', 'similarity'].includes(analysisMode)) {
          return res.status(400).send({ error: "mode must be one of: single, batch, compare, ocr, similarity" });
        }

        const requestId = createRequestId('vis');
        const logPrefix = `[generateVisual][${requestId}]`;

        const keys = {
          gemini: geminiApiKey.value(),
          openrouter: openRouterApiKey.value(),
          openai: process.env.OPENAI_API_KEY || ''
        };
        
        console.log(`${logPrefix} API keys available: gemini=${!!keys.gemini}, openrouter=${!!keys.openrouter}, openai=${!!keys.openai}`);

        if (!keys.gemini && !keys.openrouter && !keys.openai) {
          return res.status(500).send({ error: "AI API keys not configured." });
        }

        // Validate inputs based on mode
        if (analysisMode === 'single') {
          if (!imageUrl || typeof imageUrl !== 'string') {
            return res.status(400).send({ error: "imageUrl (string) is required for single mode." });
          }
        } else if (analysisMode === 'batch') {
          if (!imageUrls || !Array.isArray(imageUrls) || imageUrls.length === 0) {
            return res.status(400).send({ error: "imageUrls (array) is required for batch mode." });
          }
          if (imageUrls.length > 10) {
            return res.status(400).send({ error: "Maximum 10 images allowed for batch processing." });
          }
        } else if (analysisMode === 'compare') {
          if (!imageUrl1 || !imageUrl2 || typeof imageUrl1 !== 'string' || typeof imageUrl2 !== 'string') {
            return res.status(400).send({ error: "imageUrl1 and imageUrl2 (strings) are required for compare mode." });
          }
        } else if (analysisMode === 'ocr' || analysisMode === 'similarity') {
          if (!imageUrl || typeof imageUrl !== 'string') {
            return res.status(400).send({ error: "imageUrl (string) is required." });
          }
        }

        // Sanitize inputs
        const sanitizedContext = context ? sanitizePromptInput(context, 2000) : '';
        const injectionSignals = context ? detectPromptInjection(context) : [];
        if (injectionSignals.length) {
          console.warn(`${logPrefix} Potential prompt injection detected: ${injectionSignals.join(', ')}`);
        }
        const securityNotice = buildSecurityNotice(injectionSignals);

        console.log(`${logPrefix} Processing ${analysisMode} mode`);

        // RAG context retrieval
        let ragContext = '';
        let ragMetadata = {
          query: '',
          documentsFound: 0,
          topDocuments: [],
          contextLength: 0,
          error: null
        };

        try {
          const ragRetriever = new ChatbotRAGRetriever();
          const ragQuery = sanitizedContext 
            ? sanitizedContext 
            : 'image analysis context for PETRONAS Upstream operations, visual content, infographics, and technical diagrams';
          
          ragMetadata.query = ragQuery;
          
          const retrievedDocs = await ragRetriever.retrieveRelevantDocuments(
            ragQuery,
            keys,
            3,
            null,
            {
              queryType: 'visual',
              minSimilarity: 0.25
            }
          );
          
          if (retrievedDocs && retrievedDocs.length > 0) {
            ragContext = ragRetriever.buildContextString(retrievedDocs, { maxTokens: 500 });
            ragMetadata.documentsFound = retrievedDocs.length;
            ragMetadata.topDocuments = retrievedDocs.slice(0, 3).map(doc => ({
              title: doc.title,
              similarity: doc.similarity,
              category: doc.category
            }));
            ragMetadata.contextLength = ragContext.length;
            console.log(`${logPrefix} Added RAG context from ${retrievedDocs.length} documents`);
          }
        } catch (ragError) {
          console.warn(`${logPrefix} RAG retrieval failed: ${ragError.message}`);
          ragMetadata.error = ragError.message;
        }

        let analysisResult;

        // Process based on mode
        if (analysisMode === 'single') {
          console.log(`${logPrefix} Analyzing single image: ${imageUrl.substring(0, 100)}...`);
          const result = await analyzeImageWithAI(imageUrl, keys, ragContext);
          analysisResult = {
            tags: result.tags,
            category: result.category,
            description: result.description,
            imageUrl: imageUrl
          };
        } else if (analysisMode === 'batch') {
          console.log(`${logPrefix} Processing batch of ${imageUrls.length} images`);
          const batchResults = await Promise.all(
            imageUrls.map(async (url, index) => {
              try {
                const result = await analyzeImageWithAI(url, keys, ragContext);
                return {
                  index: index + 1,
                  imageUrl: url,
                  tags: result.tags,
                  category: result.category,
                  description: result.description,
                  success: true
                };
              } catch (error) {
                console.error(`${logPrefix} Error processing image ${index + 1}:`, error.message);
                return {
                  index: index + 1,
                  imageUrl: url,
                  success: false,
                  error: error.message
                };
              }
            })
          );
          
          // Generate comparison insights
          const categories = batchResults.filter(r => r.success).map(r => r.category);
          const allTags = batchResults.filter(r => r.success).flatMap(r => r.tags);
          const uniqueTags = [...new Set(allTags)];
          
          analysisResult = {
            images: batchResults,
            summary: {
              totalImages: imageUrls.length,
              successful: batchResults.filter(r => r.success).length,
              failed: batchResults.filter(r => !r.success).length,
              categories: [...new Set(categories)],
              commonTags: uniqueTags.slice(0, 10)
            }
          };
        } else if (analysisMode === 'compare') {
          console.log(`${logPrefix} Comparing two images`);
          const comparison = await compareImages(imageUrl1, imageUrl2, keys);
          analysisResult = {
            comparison: comparison,
            imageUrl1: imageUrl1,
            imageUrl2: imageUrl2
          };
        } else if (analysisMode === 'ocr') {
          console.log(`${logPrefix} Extracting OCR text from image`);
          const ocrResult = await extractOCRText(imageUrl, keys, ragContext);
          const baseAnalysis = await analyzeImageWithAI(imageUrl, keys, ragContext);
          analysisResult = {
            ...baseAnalysis,
            ocrText: ocrResult.text,
            ocrLines: ocrResult.lines,
            ocrLanguage: ocrResult.language,
            imageUrl: imageUrl
          };
        } else if (analysisMode === 'similarity') {
          console.log(`${logPrefix} Finding similar images (similarity search not fully implemented - returning basic analysis)`);
          // For now, return basic analysis. Full similarity search would require image embeddings
          const result = await analyzeImageWithAI(imageUrl, keys, ragContext);
          analysisResult = {
            ...result,
            imageUrl: imageUrl,
            similarImages: [], // TODO: Implement image embedding search
            note: "Similarity search requires image embeddings in knowledge base"
          };
        }

        console.log(`${logPrefix} Analysis complete for ${analysisMode} mode`);

        const response = {
          success: true,
          mode: analysisMode,
          analysis: analysisResult,
          ragMetadata: {
            used: ragContext.length > 0,
            documentsFound: ragMetadata.documentsFound,
            topDocuments: ragMetadata.topDocuments,
            contextLength: ragMetadata.contextLength,
            error: ragMetadata.error
          }
        };

        res.status(200).send(response);

      } catch (error) {
        const requestId = createRequestId('vis');
        const logPrefix = `[generateVisual][${requestId}]`;
        console.error(`${logPrefix} Error:`, error);
        
        const errorMessage = error.message || "Unknown error occurred";
        const errorDetails = error.stack ? error.stack.substring(0, 500) : '';
        
        // Check if it's an OpenRouter authentication error
        if (errorMessage.includes('401') || errorMessage.includes('User not found')) {
          return res.status(500).send({
            error: "OpenRouter API authentication failed",
            message: "The OpenRouter API key is invalid or expired. Please check your API key configuration.",
            details: "OpenRouter returned: User not found (401)"
          });
        }
        
        res.status(500).send({
          error: "Failed to analyze image",
          message: errorMessage,
          details: errorDetails
        });
      }
    });
  };
}

module.exports = { createGenerateVisualHandler };

