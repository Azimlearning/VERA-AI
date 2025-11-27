// functions/ai_models.js

/**
 * Defines the models and fallbacks for text generation (Summarizer/Write-up/Chatbot).
 * The chain attempts models in order until one succeeds.
 */
const TEXT_GENERATION_MODELS = [
  // Primary: GPT-4o-mini - Best balance of cost, performance, and reliability for chatbots
  // Cost: $0.15/M input, $0.60/M output tokens | Context: 128K | 82% MMLU score
  { type: 'openrouter', model: 'openai/gpt-4o-mini' },
  // Fallback: Stable, reliable models
  { type: 'openrouter', model: 'google/gemini-3-pro-preview' },
  { type: 'gemini', model: 'gemini-pro' },
  // Gemini 2.5 series
  { type: 'gemini', model: 'gemini-2.5-flash' },
  { type: 'gemini', model: 'gemini-2.5-flash-lite' }, 
  // Gemini 2.0 series (may require specific API access)
  { type: 'gemini', model: 'gemini-2.0-flash-exp' },
  { type: 'gemini', model: 'gemini-2.0-flash-lite' },
  { type: 'gemini', model: 'gemini-2.0-flash-preview-image-generation' },
  { type: 'gemini', model: 'gemini-2.0-flash' },
  // Additional OpenRouter Fallbacks
  { type: 'openrouter', model: 'mistralai/mistral-7b-instruct:free' },
  { type: 'openrouter', model: 'openai/gpt-3.5-turbo' }, 
  { type: 'openrouter', model: 'z-ai/glm-4-32b' },
  { type: 'openrouter', model: 'openai/gpt-oss-20b:free' },
  { type: 'openrouter', model: 'openai/gpt-oss-120b' },
  { type: 'openrouter', model: 'z-ai/glm-4.5-air:free' },
  { type: 'openrouter', model: 'openai/gpt-5-nano' }
];

/**
 * Defines the models for image generation tasks (using OpenRouter's /images/generations endpoint).
 */
const IMAGE_GENERATION_MODELS = [
  // Primary image model via OpenRouter. (Using stabilityai/stable-diffusion-xl as it's the standard for graphics)
  { type: 'openrouter', model: 'openai/gpt-5-image-mini' },
  // Backup: Multimodal Gemini via OpenRouter (Note: These often have specific pricing/availability)
  { type: 'openrouter', model: 'google/gemini-2.5-flash-image-preview' }, 
  { type: 'openrouter', model: 'google/gemini-2.5-flash-image' },
  { type: 'openrouter', model: 'openai/gpt-5-image' },
];

module.exports = {
  TEXT_GENERATION_MODELS,
  IMAGE_GENERATION_MODELS
};
