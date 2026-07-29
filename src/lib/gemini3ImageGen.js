// src/lib/gemini3ImageGen.js
// Gemini 3 Pro Image Generation Helper
// Uses gemini-3-pro-image-preview for high-quality infographic generation

/**
 * Generate an image using Gemini 3 Pro Image API
 * @param {string} prompt - The image generation prompt
 * @param {Object} options - Generation options
 * @param {string} options.aspectRatio - Aspect ratio (e.g., "16:9", "1:1", "9:16")
 * @param {string} options.imageSize - Image size ("2K" or "4K")
 * @param {string} options.apiKey - Gemini API key (defaults to env)
 * @returns {Promise<{imageBase64: string, mimeType: string} | null>}
 */
export async function generateImageWithGemini3(prompt, options = {}) {
  const {
    aspectRatio = '1:1',
    imageSize = '2K',
    apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY,
  } = options;

  if (!apiKey) {
    throw new Error('Gemini API key not configured');
  }

  const model = 'gemini-3-pro-image-preview';
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

  console.log('[Gemini3ImageGen] Generating image with prompt:', prompt.substring(0, 100) + '...');

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          imageConfig: {
            aspectRatio: aspectRatio,
            imageSize: imageSize
          }
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Gemini3ImageGen] API error:', response.status, errorText);
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    // Extract image from response
    const candidates = data.candidates || [];
    if (candidates.length === 0) {
      throw new Error('No candidates returned from Gemini');
    }

    const parts = candidates[0]?.content?.parts || [];
    const imagePart = parts.find(p => p.inlineData);
    
    if (!imagePart || !imagePart.inlineData) {
      console.error('[Gemini3ImageGen] No image in response:', JSON.stringify(data).substring(0, 500));
      throw new Error('No image returned from Gemini');
    }

    console.log('[Gemini3ImageGen] Image generated successfully');
    
    return {
      imageBase64: imagePart.inlineData.data,
      mimeType: imagePart.inlineData.mimeType || 'image/png',
    };
  } catch (error) {
    console.error('[Gemini3ImageGen] Error:', error.message);
    throw error;
  }
}

/**
 * Build an optimized infographic prompt for Gemini 3
 * @param {Object} concept - The infographic concept from AI analysis
 * @param {string} title - The story title
 * @returns {string} - Optimized prompt
 */
export function buildInfographicPrompt(concept, title) {
  const conceptTitle = concept?.title || title || 'Corporate Story';
  const visualStyle = concept?.visualStyle || 'flat design, minimal icons, professional';
  const colorPalette = concept?.colorPalette || 'teal (#008080), white, light gray';
  
  // Build key metrics section
  let metricsText = '';
  if (concept?.keyMetrics && Array.isArray(concept.keyMetrics)) {
    const metricsArr = concept.keyMetrics
      .filter(m => m && typeof m === 'object')
      .slice(0, 4)
      .map(m => `${m.label || ''}: ${m.value || ''}`);
    if (metricsArr.length > 0) {
      metricsText = `Key metrics to visualize: ${metricsArr.join('; ')}.`;
    }
  }

  // Build sections summary
  let sectionsText = '';
  if (concept?.sections && Array.isArray(concept.sections)) {
    const sectionTitles = concept.sections
      .filter(s => s && s.title)
      .slice(0, 5)
      .map(s => s.title);
    if (sectionTitles.length > 0) {
      sectionsText = `Include sections: ${sectionTitles.join(', ')}.`;
    }
  }

  const prompt = `Create a professional corporate infographic for PETRONAS Upstream.

Title: "${conceptTitle}"

Requirements:
- Vertical layout (portrait orientation)
- Color palette: ${colorPalette}
- Visual style: ${visualStyle}
- Modern, clean design with clear visual hierarchy
- Use icons and data visualizations, minimal text
- Professional corporate aesthetic
${metricsText ? `- ${metricsText}` : ''}
${sectionsText ? `- ${sectionsText}` : ''}

DO NOT include dense text blocks. Focus on visual representation of data and concepts.
The infographic should be suitable for internal corporate communications.`;

  return prompt;
}

