// src/lib/aiModelConstants.js
// Shared AI model name constants for both client and server
// Exported in both ES6 and CommonJS formats for compatibility

/**
 * AI Model Constants
 * Single source of truth for all AI model names used across the application
 */

// Text Generation Models (for server-side fallback chains)
const TEXT_GENERATION_MODELS = {
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

// Image Generation Models (for server-side fallback chains)
const IMAGE_GENERATION_MODELS = {
  PRIMARY: 'openai/gpt-5-image-mini',
  FALLBACKS: [
    'google/gemini-2.5-flash-image-preview',
    'google/gemini-2.5-flash-image',
    'openai/gpt-5-image'
  ]
};

// Modality-specific Models (for client-side direct selection)
const MODALITY_MODELS = {
  // File input (text-based files)
  FILE: {
    PRIMARY: 'anthropic/claude-opus-4.5',
    FALLBACK: 'openai/gpt-5.1'
  },
  // Image input
  IMAGE: {
    PRIMARY: 'black-forest-labs/flux.2-flex',
    FALLBACK: 'google/gemini-3-pro-preview',
    TERTIARY: 'anthropic/claude-opus-4.5'
  },
  // Image generation
  IMAGE_GENERATION: {
    PRIMARY: 'black-forest-labs/flux.2-pro',
    FALLBACK: 'black-forest-labs/flux.2-flex'
  },
  // Text input
  TEXT: {
    PRIMARY: 'black-forest-labs/flux.2-flex',
    FALLBACK: 'openai/gpt-5.1'
  },
  // Audio input
  AUDIO: {
    PRIMARY: 'mistralai/voxtral-small-24b-2507',
    FALLBACK: 'openai/gpt-4o-audio-preview'
  },
  // Text output
  TEXT_OUTPUT: {
    PRIMARY: 'anthropic/claude-opus-4.5',
    FALLBACK: 'openai/gpt-5.1'
  },
  // Embeddings
  EMBEDDINGS: {
    PRIMARY: 'qwen/qwen3-embedding-8b',
    FALLBACK: 'openai/gpt-5.1'
  }
};

// Combined constants object
const AI_MODEL_CONSTANTS = {
  TEXT_GENERATION_MODELS,
  IMAGE_GENERATION_MODELS,
  MODALITY_MODELS
};

// CommonJS export (for server-side - must come first for compatibility)
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = {
    TEXT_GENERATION_MODELS,
    IMAGE_GENERATION_MODELS,
    MODALITY_MODELS,
    AI_MODEL_CONSTANTS
  };
}

// ES6 export (for client-side)
export { AI_MODEL_CONSTANTS, TEXT_GENERATION_MODELS, IMAGE_GENERATION_MODELS, MODALITY_MODELS };

