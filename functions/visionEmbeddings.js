/**
 * Vision Embeddings
 * 
 * Generate and store vision embeddings for images using OpenAI or CLIP-like models.
 * Enables image similarity search in the knowledge base.
 * 
 * Based on best practices from ChatGPT, Claude, and Gemini vision systems.
 */

const nodeFetch = require('node-fetch');
const { cosineSimilarity } = require('./embeddingsHelper');

// OpenAI embedding endpoint (supports images in newer models)
const OPENAI_EMBEDDINGS_URL = 'https://api.openai.com/v1/embeddings';

// Vision embedding dimensions
const VISION_EMBEDDING_DIM = 1536; // OpenAI vision embedding dimension

/**
 * Generate vision embedding for an image using OpenAI's multimodal capabilities
 * Uses text description as a proxy for image embedding when direct image embedding isn't available
 * 
 * @param {string} imageUrl - URL of the image or base64 data URL
 * @param {object} keys - API keys { openai, openrouter }
 * @param {object} imageAnalysis - Pre-computed image analysis (tags, category, description)
 * @returns {Promise<number[]>} Vision embedding vector
 */
async function generateVisionEmbedding(imageUrl, keys, imageAnalysis = null) {
  // Strategy: Create a rich text description of the image and embed that
  // This is the approach used by production systems when direct image embeddings aren't available
  
  let textDescription = '';
  
  if (imageAnalysis) {
    // Use pre-computed analysis
    const parts = [];
    
    if (imageAnalysis.description) {
      parts.push(imageAnalysis.description);
    }
    
    if (imageAnalysis.caption) {
      parts.push(imageAnalysis.caption);
    }
    
    if (imageAnalysis.tags && Array.isArray(imageAnalysis.tags)) {
      parts.push(`Visual elements: ${imageAnalysis.tags.join(', ')}`);
    }
    
    if (imageAnalysis.category) {
      parts.push(`Category: ${imageAnalysis.category}`);
    }
    
    if (imageAnalysis.ocrText) {
      parts.push(`Text in image: ${imageAnalysis.ocrText.substring(0, 500)}`);
    }
    
    textDescription = parts.join('\n');
  } else {
    // Need to analyze the image first
    const { analyzeImageWithAI } = require('./aiHelper');
    
    try {
      const analysis = await analyzeImageWithAI(imageUrl, keys, '');
      
      const parts = [
        analysis.description || '',
        `Visual elements: ${(analysis.tags || []).join(', ')}`,
        `Category: ${analysis.category || 'Unknown'}`
      ];
      
      textDescription = parts.filter(Boolean).join('\n');
    } catch (error) {
      console.error('[visionEmbeddings] Image analysis failed:', error.message);
      textDescription = 'Image content';
    }
  }

  if (!textDescription || textDescription.length < 10) {
    throw new Error('Unable to generate meaningful description for image embedding');
  }

  // Generate embedding from the text description
  const { generateEmbedding } = require('./embeddingsHelper');
  
  try {
    const embedding = await generateEmbedding(textDescription, keys, 'openai/text-embedding-3-large');
    
    return {
      embedding,
      embeddingType: 'vision_text_proxy',
      embeddingModel: 'text-embedding-3-large',
      textDescription,
      dimensions: embedding.length
    };
  } catch (error) {
    console.error('[visionEmbeddings] Embedding generation failed:', error.message);
    throw error;
  }
}

/**
 * Generate vision embedding with CLIP-like model via OpenRouter (if available)
 * Falls back to text-based embedding
 * 
 * @param {string} imageUrl - Image URL
 * @param {object} keys - API keys
 * @param {object} options - Options
 * @returns {Promise<object>} Vision embedding result
 */
async function generateCLIPEmbedding(imageUrl, keys, options = {}) {
  // Try OpenRouter's CLIP-like models if available
  const clipModels = [
    'openai/clip-vit-large-patch14',
    'huggingface/clip-vit-base-patch32'
  ];

  for (const model of clipModels) {
    try {
      console.log(`[visionEmbeddings] Attempting CLIP model: ${model}`);
      
      const openRouterKey = (keys.openrouter || '').trim();
      if (!openRouterKey) continue;

      const response = await nodeFetch('https://openrouter.ai/api/v1/embeddings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openRouterKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': `https://console.firebase.google.com/project/${process.env.GCP_PROJECT || 'systemicshiftv2'}`,
          'X-Title': 'Systemic Shift AI Vision Embeddings'
        },
        body: JSON.stringify({
          model,
          input: imageUrl,
          input_type: 'image'
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.warn(`[visionEmbeddings] CLIP model ${model} failed:`, errorText);
        continue;
      }

      const data = await response.json();
      if (data.data && data.data[0] && data.data[0].embedding) {
        return {
          embedding: data.data[0].embedding,
          embeddingType: 'clip_native',
          embeddingModel: model,
          dimensions: data.data[0].embedding.length
        };
      }
    } catch (error) {
      console.warn(`[visionEmbeddings] CLIP model ${model} error:`, error.message);
    }
  }

  // Fall back to text-based embedding
  console.log('[visionEmbeddings] Falling back to text-based vision embedding');
  return generateVisionEmbedding(imageUrl, keys, options.imageAnalysis);
}

/**
 * Store vision embedding in knowledge base
 * 
 * @param {string} imageUrl - Image URL
 * @param {object} visionData - Vision embedding data
 * @param {object} metadata - Additional metadata
 * @returns {Promise<object>} Stored document reference
 */
async function storeVisionEmbedding(imageUrl, visionData, metadata = {}) {
  const admin = require('firebase-admin');
  const db = admin.firestore();

  const doc = {
    // Image identification
    imageUrl,
    type: 'image_embedding',
    
    // Vision embedding
    visionEmbedding: visionData.embedding,
    embeddingType: visionData.embeddingType,
    embeddingModel: visionData.embeddingModel,
    embeddingDimensions: visionData.dimensions,
    
    // Image metadata
    tags: metadata.tags || [],
    category: metadata.category || 'Stock Images',
    description: metadata.description || visionData.textDescription || '',
    caption: metadata.caption || '',
    ocrText: metadata.ocrText || '',
    
    // Source metadata
    source: metadata.source || 'image',
    sourceUrl: metadata.sourceUrl || imageUrl,
    documentId: metadata.documentId || null,
    
    // Content for text search
    content: [
      metadata.description || '',
      metadata.caption || '',
      (metadata.tags || []).join(' '),
      metadata.ocrText || ''
    ].filter(Boolean).join('\n'),
    
    // Timestamps
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  };

  const docRef = await db.collection('visionEmbeddings').add(doc);
  
  console.log(`[visionEmbeddings] Stored vision embedding: ${docRef.id}`);
  
  return {
    id: docRef.id,
    ...doc
  };
}

/**
 * Search for similar images using vision embeddings
 * 
 * @param {number[]} queryEmbedding - Query embedding vector
 * @param {number} topK - Number of results to return
 * @param {number} minSimilarity - Minimum similarity threshold
 * @returns {Promise<Array>} Similar images
 */
async function searchSimilarImages(queryEmbedding, topK = 10, minSimilarity = 0.5) {
  const admin = require('firebase-admin');
  const db = admin.firestore();

  // Fetch all vision embeddings
  const snapshot = await db.collection('visionEmbeddings').get();
  
  if (snapshot.empty) {
    return [];
  }

  const results = [];

  for (const doc of snapshot.docs) {
    const data = doc.data();
    
    if (!data.visionEmbedding || !Array.isArray(data.visionEmbedding)) {
      continue;
    }

    try {
      const similarity = cosineSimilarity(queryEmbedding, data.visionEmbedding);
      
      if (similarity >= minSimilarity) {
        results.push({
          id: doc.id,
          imageUrl: data.imageUrl,
          similarity,
          category: data.category,
          tags: data.tags,
          description: data.description
        });
      }
    } catch (error) {
      // Skip if dimensions don't match
    }
  }

  // Sort by similarity descending
  results.sort((a, b) => b.similarity - a.similarity);

  return results.slice(0, topK);
}

/**
 * Find similar images given an image URL
 * 
 * @param {string} imageUrl - Query image URL
 * @param {object} keys - API keys
 * @param {object} options - Search options
 * @returns {Promise<Array>} Similar images
 */
async function findSimilarImages(imageUrl, keys, options = {}) {
  const { topK = 10, minSimilarity = 0.5 } = options;

  // Generate embedding for query image
  const queryResult = await generateVisionEmbedding(imageUrl, keys, null);
  
  // Search for similar images
  return searchSimilarImages(queryResult.embedding, topK, minSimilarity);
}

/**
 * Batch process images to generate and store vision embeddings
 * 
 * @param {Array<{imageUrl: string, metadata: object}>} images - Images to process
 * @param {object} keys - API keys
 * @returns {Promise<object>} Processing results
 */
async function batchProcessVisionEmbeddings(images, keys) {
  const results = {
    successful: [],
    failed: []
  };

  for (const { imageUrl, metadata } of images) {
    try {
      console.log(`[visionEmbeddings] Processing: ${imageUrl.substring(0, 50)}...`);
      
      // Generate embedding
      const visionData = await generateVisionEmbedding(imageUrl, keys, metadata);
      
      // Store in database
      const stored = await storeVisionEmbedding(imageUrl, visionData, metadata);
      
      results.successful.push({
        imageUrl,
        documentId: stored.id
      });

    } catch (error) {
      console.error(`[visionEmbeddings] Failed to process ${imageUrl}:`, error.message);
      results.failed.push({
        imageUrl,
        error: error.message
      });
    }

    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  return results;
}

module.exports = {
  generateVisionEmbedding,
  generateCLIPEmbedding,
  storeVisionEmbedding,
  searchSimilarImages,
  findSimilarImages,
  batchProcessVisionEmbeddings,
  VISION_EMBEDDING_DIM
};

