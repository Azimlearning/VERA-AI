// src/lib/openRouterClient.js
// OpenRouter API Client for Try Pages
// Uses the models specified for different input/output modalities

import { AI_MODEL_CONSTANTS } from './aiModelConstants';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1';
// Alternative: Some models might use openrouter.co
// const OPENROUTER_API_URL_ALT = 'https://openrouter.co/api/v1';

/**
 * Get OpenRouter API key from environment
 */
function getApiKey() {
  if (typeof window === 'undefined') {
    // Server-side: use environment variable
    return process.env.OPENROUTER_API_KEY;
  }
  // Client-side: use public environment variable
  return process.env.NEXT_PUBLIC_OPENROUTER_API_KEY || 
         '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';
}

/**
 * Models for different input modalities
 * Built from shared constants for consistency
 */
export const OPENROUTER_MODELS = {
  // File input (text-based files)
  file: {
    primary: AI_MODEL_CONSTANTS.MODALITY_MODELS.FILE.PRIMARY,
    fallback: AI_MODEL_CONSTANTS.MODALITY_MODELS.FILE.FALLBACK
  },
  // Image input
  image: {
    primary: AI_MODEL_CONSTANTS.MODALITY_MODELS.IMAGE.PRIMARY,
    fallback: AI_MODEL_CONSTANTS.MODALITY_MODELS.IMAGE.FALLBACK,
    tertiary: AI_MODEL_CONSTANTS.MODALITY_MODELS.IMAGE.TERTIARY
  },
  // Image generation
  imageGeneration: {
    primary: AI_MODEL_CONSTANTS.MODALITY_MODELS.IMAGE_GENERATION.PRIMARY,
    fallback: AI_MODEL_CONSTANTS.MODALITY_MODELS.IMAGE_GENERATION.FALLBACK
  },
  // Text input
  text: {
    primary: AI_MODEL_CONSTANTS.MODALITY_MODELS.TEXT.PRIMARY,
    fallback: AI_MODEL_CONSTANTS.MODALITY_MODELS.TEXT.FALLBACK
  },
  // Audio input
  audio: {
    primary: AI_MODEL_CONSTANTS.MODALITY_MODELS.AUDIO.PRIMARY,
    fallback: AI_MODEL_CONSTANTS.MODALITY_MODELS.AUDIO.FALLBACK
  },
  // Text output
  textOutput: {
    primary: AI_MODEL_CONSTANTS.MODALITY_MODELS.TEXT_OUTPUT.PRIMARY,
    fallback: AI_MODEL_CONSTANTS.MODALITY_MODELS.TEXT_OUTPUT.FALLBACK
  },
  // Embeddings
  embeddings: {
    primary: AI_MODEL_CONSTANTS.MODALITY_MODELS.EMBEDDINGS.PRIMARY,
    fallback: AI_MODEL_CONSTANTS.MODALITY_MODELS.EMBEDDINGS.FALLBACK
  }
};

/**
 * Make a chat completion request to OpenRouter
 * @param {string} prompt - The prompt text
 * @param {string} model - Model to use (defaults to text output model)
 * @param {Array} messages - Optional message array (alternative to prompt)
 * @param {boolean} jsonMode - Whether to request JSON output
 * @param {Array} images - Optional array of image URLs for multimodal
 * @returns {Promise<string>} The generated text
 */
export async function generateText({
  prompt,
  model = OPENROUTER_MODELS.textOutput.primary,
  messages = null,
  jsonMode = false,
  images = []
}) {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('OpenRouter API key not found');
  }

  const headers = {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
    'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : 'https://systemicshifts.com',
    'X-Title': 'Systemic Shifts AI Try Pages'
  };

  // Build messages array
  let messageArray = messages;
  if (!messageArray && prompt) {
    const content = [];
    
    // Add text
    if (prompt) {
      content.push({ type: 'text', text: prompt });
    }
    
    // Add images if provided
    images.forEach(imageUrl => {
      content.push({
        type: 'image_url',
        image_url: { url: imageUrl }
      });
    });
    
    messageArray = [{
      role: 'user',
      content: content.length === 1 && content[0].type === 'text' 
        ? prompt  // Simple text-only case
        : content  // Multimodal case
    }];
  }

  const body = {
    model,
    messages: messageArray,
    ...(jsonMode && { response_format: { type: 'json_object' } })
  };

  try {
    const response = await fetch(`${OPENROUTER_API_URL}/chat/completions`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenRouter API error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid response format from OpenRouter');
    }

    return data.choices[0].message.content;
  } catch (error) {
    console.error('[OpenRouter] Error:', error);
    throw error;
  }
}

/**
 * Generate embeddings using OpenRouter
 * @param {string} text - Text to generate embedding for
 * @param {string} model - Embedding model to use
 * @returns {Promise<number[]>} Embedding vector
 */
export async function generateEmbedding(
  text,
  model = OPENROUTER_MODELS.embeddings.primary
) {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('OpenRouter API key not found');
  }

  const headers = {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
    'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : 'https://systemicshifts.com',
    'X-Title': 'Systemic Shifts AI Embeddings'
  };

  const body = {
    model,
    input: text
  };

  try {
    const response = await fetch(`${OPENROUTER_API_URL}/embeddings`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenRouter embeddings error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    
    if (!data.data || !data.data[0] || !data.data[0].embedding) {
      throw new Error('Invalid embedding response format');
    }

    return data.data[0].embedding;
  } catch (error) {
    console.error('[OpenRouter Embeddings] Error:', error);
    throw error;
  }
}

/**
 * Generate image using OpenRouter
 * @param {string} prompt - Image generation prompt
 * @param {string} model - Model to use (defaults to flux.2-pro)
 * @param {object} options - Optional parameters (width, height, etc.)
 * @returns {Promise<string>} The generated image URL
 */
export async function generateImage(
  prompt,
  model = 'black-forest-labs/flux.2-pro',
  options = {}
) {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('OpenRouter API key not found');
  }

  const headers = {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
    'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : 'https://systemicshifts.com',
    'X-Title': 'Systemic Shifts AI Image Generation'
  };

  // OpenRouter image generation API format (OpenAI-compatible)
  // Match the exact format used in functions/aiHelper.js which works
  const body = {
    model,
    prompt,
    size: options.width && options.height ? `${options.width}x${options.height}` : "1024x1024",
    n: options.num_images || 1,
    response_format: "url"  // Request URL format instead of base64
  };

  // Log request for debugging
  console.log('[OpenRouter Image Generation] Request:', {
    endpoint: `${OPENROUTER_API_URL}/images/generations`,
    model,
    promptLength: prompt.length,
    body: { ...body, prompt: prompt.substring(0, 100) + '...' }
  });

  try {
    // OpenRouter uses /images/generations endpoint for image generation (OpenAI-compatible format)
    // This matches the format used in functions/aiHelper.js
    const response = await fetch(`${OPENROUTER_API_URL}/images/generations`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorText = await response.text();
      // Log the full error for debugging
      console.error('[OpenRouter Image Generation] Full error response:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
      throw new Error(`OpenRouter image generation error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    
    // OpenRouter returns image data in OpenAI-compatible format
    // Format: { data: [{ url: "..." }] } or { data: [{ b64_json: "..." }] }
    if (data.data && data.data.length > 0) {
      const imageData = data.data[0];
      
      // If it's a URL, return it directly
      if (imageData.url) {
        return imageData.url;
      }
      
      // If it's base64, convert to data URL
      if (imageData.b64_json) {
        return `data:image/png;base64,${imageData.b64_json}`;
      }
    }

    // If response format is different, try alternative formats
    if (data.url) {
      return data.url;
    }
    
    if (data.image) {
      return data.image;
    }

    throw new Error(`Invalid image generation response format from OpenRouter: ${JSON.stringify(data).substring(0, 200)}`);
  } catch (error) {
    console.error('[OpenRouter Image Generation] Error:', error);
    throw error;
  }
}

