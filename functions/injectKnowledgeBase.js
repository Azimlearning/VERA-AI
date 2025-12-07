/**
 * Inject Knowledge Base Entry
 * 
 * Cloud Function to add a single knowledge base entry manually
 * Enhanced with semantic category inference and flexible category management
 * 
 * Now includes:
 * - Structural/semantic chunking for large documents
 * - Chunk metadata (heading, position, overlap)
 * - Per-chunk embeddings for better retrieval
 */

const admin = require('firebase-admin');
const cors = require('cors')({ origin: true });
const { generateEmbedding, cosineSimilarity } = require('./embeddingsHelper');
const { chunkDocument, estimateTokens } = require('./documentChunker');

// Lazy getter for Firestore (initialized in index.js)
function getDb() {
  return admin.firestore();
}

const EMBEDDING_MODEL = 'openai/text-embedding-3-large'; // 3,072 dimensions per presentation requirements (OpenRouter format)
const EMBEDDING_TEXT_LIMIT = 8000; // stay within embedding token limits
const MAX_TITLE_LENGTH = 200;
const MAX_CONTENT_LENGTH = 20000;
const MAX_TAG_LENGTH = 50;

// Known categories with descriptions for semantic matching
// These are suggestions, not hard restrictions
const KNOWN_CATEGORIES = {
  'systemic-shifts': {
    description: 'Systemic shifts, organizational transformation, portfolio high-grading, advantaged barrels strategy',
    keywords: ['systemic shift', 'shift #', 'portfolio high-grading', 'advantaged barrels', 'transformation'],
    aliases: ['systemic-shift', 'shifts', 'strategic-shift']
  },
  'mindset-behaviour': {
    description: 'Mindset changes, behavioral transformation, culture, ways of working, risk tolerance, commercial savvy',
    keywords: ['mindset', 'behaviour', 'behavior', 'culture', 'ways of working', 'risk tolerant', 'commercial savvy', 'growth mindset'],
    aliases: ['mindset', 'behaviour', 'behavior', 'culture']
  },
  'upstream-target': {
    description: 'Production targets, barrel production, reservoir management, well operations, field development',
    keywords: ['production', 'barrels', 'reservoir', 'well', 'field development', 'target', 'kboed'],
    aliases: ['production', 'targets', 'upstream-production']
  },
  'petronas-info': {
    description: 'PETRONAS corporate information, LNG operations, gas business, company overview, organizational structure',
    keywords: ['petronas', 'lng', 'gas', 'corporate', 'malaysia petroleum', 'mpm', 'carigali'],
    aliases: ['petronas', 'corporate', 'company-info']
  },
  'upstream': {
    description: 'Upstream operations, subsurface activities, platform operations, facility management, exploration',
    keywords: ['upstream', 'subsurface', 'platform', 'facility', 'exploration', 'drilling', 'offshore'],
    aliases: ['operations', 'upstream-ops']
  },
  'articles': {
    description: 'Articles, stories, publications, write-ups, news, announcements',
    keywords: ['article', 'story', 'publication', 'write-up', 'news', 'announcement'],
    aliases: ['news', 'publications', 'stories']
  },
  'general': {
    description: 'General information that does not fit other categories',
    keywords: [],
    aliases: ['other', 'misc', 'miscellaneous']
  }
};

// Cache for category embeddings (lazy-loaded)
let categoryEmbeddingsCache = null;

function sanitizeContent(text = '') {
  return text.replace(/<script.*?>.*?<\/script>/gim, '')
    .replace(/[\u0000-\u001F]+/g, ' ')
    .trim();
}

function isValidUrl(value) {
  if (!value) return true;
  try {
    const url = new URL(value);
    return ['http:', 'https:'].includes(url.protocol);
  } catch (err) {
    return false;
  }
}

/**
 * Normalize category string - handles aliases and common variations
 */
function normalizeCategory(category) {
  if (!category || typeof category !== 'string') return 'general';
  
  const normalized = category.trim().toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
  
  // Check if it's a known category
  if (KNOWN_CATEGORIES[normalized]) {
    return normalized;
  }
  
  // Check aliases
  for (const [catKey, catData] of Object.entries(KNOWN_CATEGORIES)) {
    if (catData.aliases && catData.aliases.includes(normalized)) {
      return catKey;
    }
  }
  
  return normalized; // Return as-is if not a known category (flexible)
}

/**
 * Keyword-based category inference (fallback)
 */
function inferCategoryByKeywords(title, content) {
  const combined = `${title} ${content}`.toLowerCase();
  
  for (const [category, catData] of Object.entries(KNOWN_CATEGORIES)) {
    if (catData.keywords && catData.keywords.length > 0) {
      const matchCount = catData.keywords.filter(kw => combined.includes(kw)).length;
      if (matchCount >= 2 || (matchCount === 1 && catData.keywords.some(kw => 
        combined.includes(kw) && kw.length > 8 // Strong single match for longer keywords
      ))) {
        return { category, confidence: 0.7 + (matchCount * 0.05), method: 'keyword' };
      }
    }
  }
  
  return { category: 'general', confidence: 0.3, method: 'default' };
}

/**
 * Get or generate category embeddings for semantic matching
 */
async function getCategoryEmbeddings(keys) {
  if (categoryEmbeddingsCache) {
    return categoryEmbeddingsCache;
  }
  
  const db = getDb();
  
  // Try to load from Firestore cache first
  try {
    const cacheDoc = await db.collection('systemConfig').doc('categoryEmbeddings').get();
    if (cacheDoc.exists) {
      const data = cacheDoc.data();
      if (data.embeddings && data.updatedAt) {
        const cacheAge = Date.now() - data.updatedAt.toDate().getTime();
        const ONE_WEEK = 7 * 24 * 60 * 60 * 1000;
        if (cacheAge < ONE_WEEK) {
          categoryEmbeddingsCache = data.embeddings;
          console.log('[Inject KB] Loaded category embeddings from cache');
          return categoryEmbeddingsCache;
        }
      }
    }
  } catch (err) {
    console.warn('[Inject KB] Failed to load category embeddings cache:', err.message);
  }
  
  // Generate embeddings for each category description
  console.log('[Inject KB] Generating category embeddings...');
  const embeddings = {};
  
  for (const [category, catData] of Object.entries(KNOWN_CATEGORIES)) {
    try {
      const text = `${category}: ${catData.description}. Keywords: ${catData.keywords.join(', ')}`;
      embeddings[category] = await generateEmbedding(text.substring(0, 500), keys, EMBEDDING_MODEL);
    } catch (err) {
      console.warn(`[Inject KB] Failed to generate embedding for category ${category}:`, err.message);
    }
  }
  
  // Cache to Firestore
  try {
    await db.collection('systemConfig').doc('categoryEmbeddings').set({
      embeddings,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      categories: Object.keys(KNOWN_CATEGORIES)
    });
    console.log('[Inject KB] Cached category embeddings to Firestore');
  } catch (err) {
    console.warn('[Inject KB] Failed to cache category embeddings:', err.message);
  }
  
  categoryEmbeddingsCache = embeddings;
  return embeddings;
}

/**
 * Semantic category inference using embeddings
 */
async function inferCategorySemantic(title, content, contentEmbedding, keys) {
  try {
    // If we don't have the content embedding, we can't do semantic matching
    if (!contentEmbedding || !Array.isArray(contentEmbedding)) {
      console.log('[Inject KB] No content embedding available for semantic category inference');
      return null;
    }
    
    const categoryEmbeddings = await getCategoryEmbeddings(keys);
    if (!categoryEmbeddings || Object.keys(categoryEmbeddings).length === 0) {
      console.log('[Inject KB] No category embeddings available');
      return null;
    }
    
    let bestMatch = { category: 'general', similarity: 0 };
    
    for (const [category, catEmbedding] of Object.entries(categoryEmbeddings)) {
      if (!catEmbedding || !Array.isArray(catEmbedding)) continue;
      
      try {
        const similarity = cosineSimilarity(contentEmbedding, catEmbedding);
        if (similarity > bestMatch.similarity) {
          bestMatch = { category, similarity };
        }
      } catch (err) {
        // Skip if vector dimensions don't match
      }
    }
    
    // Only return semantic match if confidence is reasonable
    if (bestMatch.similarity >= 0.35) {
      return {
        category: bestMatch.category,
        confidence: bestMatch.similarity,
        method: 'semantic'
      };
    }
    
    return null;
  } catch (err) {
    console.warn('[Inject KB] Semantic category inference failed:', err.message);
    return null;
  }
}

/**
 * Hybrid category inference - combines keyword and semantic methods
 */
async function inferCategoryHybrid(title, content, contentEmbedding, keys, providedCategory) {
  // If user provided a specific non-general category, respect it
  if (providedCategory && providedCategory !== 'general') {
    const normalized = normalizeCategory(providedCategory);
    return {
      category: normalized,
      confidence: 1.0,
      method: 'user-provided',
      isKnownCategory: !!KNOWN_CATEGORIES[normalized]
    };
  }
  
  // Try semantic inference first (more accurate)
  const semanticResult = await inferCategorySemantic(title, content, contentEmbedding, keys);
  
  // Try keyword inference
  const keywordResult = inferCategoryByKeywords(title, content);
  
  // Combine results
  if (semanticResult && semanticResult.confidence >= 0.45) {
    // High confidence semantic match
    return {
      ...semanticResult,
      keywordMatch: keywordResult.category !== 'general' ? keywordResult.category : null,
      isKnownCategory: true
    };
  }
  
  if (keywordResult.confidence >= 0.7) {
    // Strong keyword match
    return {
      ...keywordResult,
      semanticMatch: semanticResult?.category,
      isKnownCategory: true
    };
  }
  
  // If both methods agree, boost confidence
  if (semanticResult && semanticResult.category === keywordResult.category && semanticResult.category !== 'general') {
    return {
      category: semanticResult.category,
      confidence: Math.min((semanticResult.confidence + keywordResult.confidence) / 2 + 0.1, 1.0),
      method: 'hybrid',
      isKnownCategory: true
    };
  }
  
  // Return best available result
  if (semanticResult && semanticResult.confidence > keywordResult.confidence) {
    return { ...semanticResult, isKnownCategory: true };
  }
  
  return {
    ...keywordResult,
    isKnownCategory: keywordResult.category !== 'general' || !!KNOWN_CATEGORIES[keywordResult.category]
  };
}

function scoreContentQuality(text) {
  const lengthScore = Math.min(text.length / 800, 1);
  const structureScore = /\n\n|\d\./.test(text) ? 1 : 0.6;
  const dataScore = /\d/.test(text) ? 1 : 0.5;
  // Additional quality signals
  const headingScore = /^#+\s|^[A-Z][^.!?]*:$/m.test(text) ? 1 : 0.7;
  const linkScore = /https?:\/\//.test(text) ? 0.9 : 0.7;
  
  const score = Number(((lengthScore + structureScore + dataScore + headingScore + linkScore) / 5).toFixed(2));
  return {
    score,
    details: {
      lengthScore: Number(lengthScore.toFixed(2)),
      structureScore,
      dataScore,
      headingScore,
      linkScore
    }
  };
}

/**
 * Extract terms for BM25 indexing
 */
function extractTerms(text) {
  if (!text || typeof text !== 'string') return {};
  
  const terms = text.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter(term => term.length > 2 && term.length < 30);
  
  // Count term frequencies
  const termFreq = {};
  for (const term of terms) {
    termFreq[term] = (termFreq[term] || 0) + 1;
  }
  
  return termFreq;
}

function buildEmbeddingKeys() {
  const keys = {};
  if (process.env.OPENAI_API_KEY) {
    keys.openai = process.env.OPENAI_API_KEY;
  }
  if (process.env.OPENROUTER_API_KEY) {
    keys.openrouter = process.env.OPENROUTER_API_KEY;
  }
  return keys;
}

async function generateDocumentEmbedding(title, content) {
  const keys = buildEmbeddingKeys();
  if (!keys.openai && !keys.openrouter) {
    console.warn('[Inject Knowledge Base] Embedding skipped — no API keys configured');
    return { status: 'skipped', reason: 'missing_api_keys' };
  }

  const text = `${title}\n${content}`.substring(0, EMBEDDING_TEXT_LIMIT);
  const embedding = await generateEmbedding(text, keys, EMBEDDING_MODEL);
  return {
    status: 'ready',
    embedding,
    embeddingModel: EMBEDDING_MODEL,
  };
}

/**
 * Cloud Function to inject a single knowledge base entry
 */
exports.injectKnowledgeBase = async (req, res) => {
  cors(req, res, async () => {
    if (req.method !== 'POST') {
      return res.status(405).send({ error: 'Method Not Allowed' });
    }

    try {
      const { title, content, category, tags, source, sourceUrl } = req.body;

      // Validation
      if (!title || typeof title !== 'string' || !title.trim()) {
        return res.status(400).send({ error: 'Title is required and must be a non-empty string' });
      }

      if (!content || typeof content !== 'string' || !content.trim()) {
        return res.status(400).send({ error: 'Content is required and must be a non-empty string' });
      }

      const trimmedTitle = sanitizeContent(title).substring(0, MAX_TITLE_LENGTH);
      const trimmedContentRaw = sanitizeContent(content);
      if (trimmedContentRaw.length > MAX_CONTENT_LENGTH) {
        return res.status(400).send({ error: `Content exceeds maximum length of ${MAX_CONTENT_LENGTH} characters.` });
      }

      // Normalize category - flexible, not restrictive
      const normalizedCategory = category ? normalizeCategory(category) : 'general';
      const isKnownCategory = !!KNOWN_CATEGORIES[normalizedCategory];

      if (sourceUrl && !isValidUrl(sourceUrl)) {
        return res.status(400).send({ error: 'sourceUrl must be a valid HTTP/HTTPS URL.' });
      }

      // Validate tags array
      const tagsArray = Array.isArray(tags) 
        ? tags
            .filter(tag => typeof tag === 'string' && tag.trim().length > 0)
            .map(tag => tag.trim().substring(0, MAX_TAG_LENGTH))
        : [];

      const trimmedContent = trimmedContentRaw;
      
      const db = getDb();
      const duplicateSnap = await db.collection('knowledgeBase')
        .where('titleLower', '==', trimmedTitle.toLowerCase())
        .limit(1)
        .get();
      if (!duplicateSnap.empty) {
        return res.status(409).send({ error: 'A knowledge base entry with this title already exists.' });
      }

      // Generate embedding first (needed for semantic category inference)
      let embeddingResult = { status: 'pending' };
      const keys = buildEmbeddingKeys();
      
      try {
        embeddingResult = await generateDocumentEmbedding(trimmedTitle, trimmedContent);
      } catch (embeddingError) {
        console.error('[Inject Knowledge Base] Embedding generation failed:', embeddingError);
        embeddingResult = {
          status: 'error',
          reason: embeddingError.message?.substring(0, 200) || 'unknown_error'
        };
      }

      // Hybrid category inference using both keywords and semantics
      const categoryInference = await inferCategoryHybrid(
        trimmedTitle,
        trimmedContent,
        embeddingResult.embedding,
        keys,
        normalizedCategory
      );

      // Extract terms for BM25 indexing
      const termFrequencies = extractTerms(`${trimmedTitle} ${trimmedContent}`);

      // Check if content should be chunked (> 800 tokens)
      const contentTokens = estimateTokens(trimmedContent);
      const shouldChunk = contentTokens > 800;
      let chunks = [];
      
      if (shouldChunk) {
        chunks = chunkDocument(trimmedContent, {
          chunkSize: 800,
          overlap: 100,
          source: source || 'manual',
          sourceUrl: sourceUrl ? sourceUrl.trim() : '',
          category: categoryInference.category
        });
        console.log(`[Inject Knowledge Base] Content is ${contentTokens} tokens, creating ${chunks.length} chunks`);
      }

      // Create document with enhanced metadata
      const knowledgeDoc = {
        title: trimmedTitle,
        content: trimmedContent,
        category: categoryInference.category,
        categoryInference: {
          method: categoryInference.method,
          confidence: categoryInference.confidence,
          isKnownCategory: categoryInference.isKnownCategory,
          providedCategory: normalizedCategory
        },
        titleLower: trimmedTitle.toLowerCase(),
        tags: tagsArray,
        source: source || 'manual',
        sourceUrl: sourceUrl ? sourceUrl.trim() : '',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        embeddingStatus: embeddingResult.status,
        contentQuality: scoreContentQuality(trimmedContent),
        // BM25 indexing metadata
        termFrequencies,
        termCount: Object.keys(termFrequencies).length,
        wordCount: trimmedContent.split(/\s+/).length,
        // Chunking metadata
        isChunked: shouldChunk,
        chunkCount: chunks.length,
        estimatedTokens: contentTokens
      };

      // Add embedding data if available
      if (embeddingResult.status === 'ready') {
        knowledgeDoc.embedding = embeddingResult.embedding;
        knowledgeDoc.embeddingModel = embeddingResult.embeddingModel;
        knowledgeDoc.embeddingGeneratedAt = admin.firestore.FieldValue.serverTimestamp();
      } else if (embeddingResult.reason) {
        knowledgeDoc.embeddingStatusReason = embeddingResult.reason;
      }

      // Add to Firestore
      const docRef = await db.collection('knowledgeBase').add(knowledgeDoc);
      
      // Store chunks if document was chunked
      let chunkIds = [];
      if (shouldChunk && chunks.length > 0) {
        const batch = db.batch();
        
        for (const chunk of chunks) {
          const chunkDoc = {
            parentId: docRef.id,
            parentTitle: trimmedTitle,
            content: chunk.text,
            chunkIndex: chunk.chunkIndex,
            totalChunks: chunk.totalChunks,
            heading: chunk.heading || null,
            contentType: chunk.contentType,
            estimatedTokens: chunk.estimatedTokens,
            hasOverlap: chunk.hasOverlap,
            source: chunk.source,
            sourceUrl: chunk.sourceUrl,
            category: categoryInference.category,
            tags: tagsArray,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
          };
          
          // Generate embedding for chunk if API keys available
          if (keys.openai || keys.openrouter) {
            try {
              const chunkEmbedding = await generateEmbedding(chunk.text.substring(0, EMBEDDING_TEXT_LIMIT), keys, EMBEDDING_MODEL);
              chunkDoc.embedding = chunkEmbedding;
              chunkDoc.embeddingModel = EMBEDDING_MODEL;
            } catch (err) {
              console.warn(`[Inject Knowledge Base] Failed to embed chunk ${chunk.chunkIndex}:`, err.message);
            }
          }
          
          const chunkRef = db.collection('knowledgeBaseChunks').doc();
          batch.set(chunkRef, chunkDoc);
          chunkIds.push(chunkRef.id);
        }
        
        await batch.commit();
        console.log(`[Inject Knowledge Base] Stored ${chunkIds.length} chunks with embeddings`);
        
        // Update parent with chunk references
        await docRef.update({ chunkIds });
      }

      // Log with category inference details
      console.log(`[Inject Knowledge Base] Added document: ${docRef.id} - "${trimmedTitle}"`);
      console.log(`[Inject Knowledge Base] Category: ${categoryInference.category} (${categoryInference.method}, confidence: ${categoryInference.confidence.toFixed(2)})`);
      if (!categoryInference.isKnownCategory) {
        console.log(`[Inject Knowledge Base] Note: "${categoryInference.category}" is a custom category (not in known categories)`);
      }

      // Build response
      const responseData = { ...knowledgeDoc };
      delete responseData.embedding; // Don't send embedding in response (too large)
      delete responseData.termFrequencies; // Don't send term frequencies in response

      res.status(200).send({
        success: true,
        message: 'Knowledge base entry added successfully',
        documentId: docRef.id,
        data: responseData,
        categoryDetails: {
          assigned: categoryInference.category,
          method: categoryInference.method,
          confidence: categoryInference.confidence,
          isKnownCategory: categoryInference.isKnownCategory,
          knownCategories: Object.keys(KNOWN_CATEGORIES)
        },
        chunking: {
          isChunked: shouldChunk,
          totalChunks: chunks.length,
          chunkIds: chunkIds.length > 0 ? chunkIds : null,
          estimatedTokens: contentTokens
        }
      });

    } catch (error) {
      console.error('[Inject Knowledge Base] Error:', error);
      res.status(500).send({
        success: false,
        error: error.message || 'Failed to add knowledge base entry',
      });
    }
  });
};

// Export utilities for use in other modules
exports.KNOWN_CATEGORIES = KNOWN_CATEGORIES;
exports.normalizeCategory = normalizeCategory;
exports.inferCategoryByKeywords = inferCategoryByKeywords;
exports.extractTerms = extractTerms;
