// functions/ai_models.js

/**
 * Defines the models and fallbacks for text generation (Summarizer/Write-up/Chatbot).
 * The chain attempts models in order until one succeeds.
 * Built from shared constants for consistency.
 */

// Model constants (inline to avoid requiring from src directory which isn't available in Cloud Functions)
const TEXT_GENERATION_MODELS_CONFIG = {
  PRIMARY: 'openai/gpt-4o-mini',
  FALLBACKS: [
    'google/gemini-3-pro-preview',
    'gemini-pro',
    'gemini-2.5-flash',
    'gemini-2.5-flash-lite',
    'gemini-2.0-flash-exp',
    'gemini-2.0-flash-lite',
    'gemini-2.0-flash-preview-image-generation',
    'gemini-2.0-flash',
    'mistralai/mistral-7b-instruct:free',
    'openai/gpt-3.5-turbo',
    'z-ai/glm-4-32b',
    'openai/gpt-oss-20b:free',
    'openai/gpt-oss-120b',
    'z-ai/glm-4.5-air:free',
    'openai/gpt-5-nano'
  ]
};

const IMAGE_GENERATION_MODELS_CONFIG = {
  PRIMARY: 'openai/gpt-5-image-mini',
  FALLBACKS: [
    'google/gemini-2.5-flash-image-preview',
    'google/gemini-2.5-flash-image',
    'openai/gpt-5-image'
  ]
};

/**
 * Build TEXT_GENERATION_MODELS array from shared constants
 * Maintains the { type, model } structure required for fallback chain logic
 */
const TEXT_GENERATION_MODELS = [
  // Primary: GPT-4o-mini - Best balance of cost, performance, and reliability for chatbots
  // Cost: $0.15/M input, $0.60/M output tokens | Context: 128K | 82% MMLU score
  { type: 'openrouter', model: TEXT_GENERATION_MODELS_CONFIG.PRIMARY },
  // Fallback: Stable, reliable models
  ...TEXT_GENERATION_MODELS_CONFIG.FALLBACKS.map(modelName => {
    // Determine type based on model name
    if (modelName.startsWith('gemini')) {
      return { type: 'gemini', model: modelName };
    } else {
      return { type: 'openrouter', model: modelName };
    }
  })
];

/**
 * Defines the models for image generation tasks (using OpenRouter's /images/generations endpoint).
 * Built from shared constants for consistency.
 */
const IMAGE_GENERATION_MODELS = [
  // Primary image model via OpenRouter
  { type: 'openrouter', model: IMAGE_GENERATION_MODELS_CONFIG.PRIMARY },
  // Backup: Multimodal Gemini via OpenRouter (Note: These often have specific pricing/availability)
  ...IMAGE_GENERATION_MODELS_CONFIG.FALLBACKS.map(modelName => ({
    type: 'openrouter',
    model: modelName
  }))
];

module.exports = {
  TEXT_GENERATION_MODELS,
  IMAGE_GENERATION_MODELS
};
