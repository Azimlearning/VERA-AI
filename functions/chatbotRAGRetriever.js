/**
 * Chatbot RAG Retriever - Advanced Hybrid Retrieval System
 * 
 * Production-grade RAG retrieval using:
 * - Vector similarity (semantic search)
 * - BM25 keyword search (exact term matching)
 * - Hybrid retrieval merge with configurable weights
 * - Multi-factor reranking
 * - Query preprocessing and enhancement
 * - Deduplication
 * 
 * Based on best practices from top AI agent systems (ChatGPT, Claude, Gemini)
 */

const admin = require('firebase-admin');
const crypto = require('crypto');
const { generateEmbedding, cosineSimilarity } = require('./embeddingsHelper');

// Lazy getter for Firestore (initialized in index.js)
function getDb() {
  return admin.firestore();
}

// ============================================================================
// CONFIGURATION
// ============================================================================

const DEFAULT_SIMILARITY_THRESHOLDS = {
  general: 0.45,  // Lowered for hybrid retrieval (BM25 compensates)
  chat: 0.45,     // Lowered for better recall in chat
  podcast: 0.27,
  writeup: 0.32,
  content: 0.32,
  analytics: 0.3,
  visual: 0.3,
  meeting: 0.3
};

const CACHE_COLLECTION = 'ragQueryCache';
const CACHE_TTL_MINUTES = 30;

// BM25 parameters (tuned for short documents)
const BM25_K1 = 1.5;  // Term frequency saturation
const BM25_B = 0.75;  // Document length normalization

// Hybrid retrieval default weights
const DEFAULT_HYBRID_WEIGHTS = {
  vector: 0.6,   // 60% weight for semantic similarity
  bm25: 0.4      // 40% weight for keyword matching
};

// Reranking weights
const RERANK_WEIGHTS = {
  similarity: 0.5,      // Combined similarity score
  recency: 0.15,        // Recent documents get boost
  quality: 0.15,        // Content quality score
  categoryMatch: 0.1,   // Category relevance
  titleMatch: 0.1       // Title keyword match
};

// Domain-specific stopwords to filter
const STOPWORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of',
  'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been', 'be',
  'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should',
  'may', 'might', 'must', 'shall', 'can', 'need', 'dare', 'ought', 'used',
  'this', 'that', 'these', 'those', 'what', 'which', 'who', 'whom', 'whose',
  'when', 'where', 'why', 'how', 'all', 'each', 'every', 'both', 'few', 'more',
  'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same',
  'so', 'than', 'too', 'very', 'just', 'also', 'now', 'here', 'there', 'then',
  'about', 'after', 'before', 'between', 'into', 'through', 'during', 'above',
  'below', 'up', 'down', 'out', 'off', 'over', 'under', 'again', 'further',
  'once', 'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'you', 'your',
  'he', 'him', 'his', 'she', 'her', 'it', 'its', 'they', 'them', 'their'
]);

// Domain-specific acronym expansions
const ACRONYM_EXPANSIONS = {
  'mpm': 'malaysia petroleum management',
  'petronas': 'petroliam nasional berhad',
  'lng': 'liquefied natural gas',
  'epc': 'engineering procurement construction',
  'fpso': 'floating production storage offloading',
  'kboed': 'thousand barrels of oil equivalent per day',
  'psc': 'production sharing contract',
  'jda': 'joint development area',
  'rag': 'retrieval augmented generation',
  'ai': 'artificial intelligence',
  'ml': 'machine learning'
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function getAdaptiveSimilarityThreshold(query = '', queryType = 'general', override = null) {
  if (typeof override === 'number' && !Number.isNaN(override)) {
    return Math.min(Math.max(override, 0), 1);
  }

  const base = DEFAULT_SIMILARITY_THRESHOLDS[queryType] ?? DEFAULT_SIMILARITY_THRESHOLDS.general;
  const queryLength = query.length;

  if (queryLength < 80) {
    return Math.min(base + 0.07, 0.5);
  }

  if (queryLength > 300) {
    return Math.max(base - 0.07, 0.2);
  }

  return base;
}

/**
 * Tokenize text for BM25
 */
function tokenize(text) {
  if (!text || typeof text !== 'string') return [];
  
  return text.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter(term => term.length > 2 && term.length < 30 && !STOPWORDS.has(term));
}

/**
 * Expand acronyms in query
 */
function expandAcronyms(text) {
  if (!text) return text;
  
  let expanded = text.toLowerCase();
  for (const [acronym, expansion] of Object.entries(ACRONYM_EXPANSIONS)) {
    const regex = new RegExp(`\\b${acronym}\\b`, 'gi');
    if (regex.test(expanded)) {
      expanded = expanded + ' ' + expansion;
    }
  }
  return expanded;
}

/**
 * Calculate term frequencies for a document
 */
function getTermFrequencies(tokens) {
  const freq = {};
  for (const token of tokens) {
    freq[token] = (freq[token] || 0) + 1;
  }
  return freq;
}

// ============================================================================
// BM25 IMPLEMENTATION
// ============================================================================

class BM25Index {
  constructor() {
    this.documents = [];  // Array of { id, tokens, termFreq, length }
    this.avgDocLength = 0;
    this.docFreq = {};    // Term -> number of documents containing term
    this.totalDocs = 0;
  }

  /**
   * Build BM25 index from documents
   */
  buildIndex(documents) {
    this.documents = [];
    this.docFreq = {};
    let totalLength = 0;

    for (const doc of documents) {
      const text = `${doc.title || ''} ${doc.content || ''}`;
      const tokens = tokenize(text);
      const termFreq = getTermFrequencies(tokens);
      
      // Track document frequencies
      const seenTerms = new Set(tokens);
      for (const term of seenTerms) {
        this.docFreq[term] = (this.docFreq[term] || 0) + 1;
      }

      this.documents.push({
        id: doc.id,
        originalDoc: doc,
        tokens,
        termFreq,
        length: tokens.length
      });

      totalLength += tokens.length;
    }

    this.totalDocs = this.documents.length;
    this.avgDocLength = this.totalDocs > 0 ? totalLength / this.totalDocs : 0;
  }

  /**
   * Calculate BM25 score for a query against a document
   */
  score(queryTokens, docIndex) {
    const doc = this.documents[docIndex];
    if (!doc) return 0;

    let score = 0;
    const docLength = doc.length;
    const avgDL = this.avgDocLength || 1;

    for (const term of queryTokens) {
      const tf = doc.termFreq[term] || 0;
      if (tf === 0) continue;

      const df = this.docFreq[term] || 0;
      // IDF with smoothing
      const idf = Math.log((this.totalDocs - df + 0.5) / (df + 0.5) + 1);
      
      // BM25 formula
      const numerator = tf * (BM25_K1 + 1);
      const denominator = tf + BM25_K1 * (1 - BM25_B + BM25_B * (docLength / avgDL));
      
      score += idf * (numerator / denominator);
    }

    return score;
  }

  /**
   * Search documents and return top K results
   */
  search(query, topK = 50) {
    const queryTokens = tokenize(expandAcronyms(query));
    if (queryTokens.length === 0) return [];

    const scores = [];
    for (let i = 0; i < this.documents.length; i++) {
      const score = this.score(queryTokens, i);
      if (score > 0) {
        scores.push({
          docIndex: i,
          doc: this.documents[i].originalDoc,
          bm25Score: score
        });
      }
    }

    // Sort by score descending
    scores.sort((a, b) => b.bm25Score - a.bm25Score);
    return scores.slice(0, topK);
  }
}

// ============================================================================
// MAIN RAG RETRIEVER CLASS
// ============================================================================

class ChatbotRAGRetriever {
  constructor() {
    this.cache = new Map();
    this.bm25Index = new BM25Index();
  }

  /**
   * Preprocess query for better retrieval
   */
  _preprocessQuery(query) {
    if (!query || typeof query !== 'string') return { original: '', processed: '', tokens: [] };

    // Basic cleaning
    let processed = query.trim()
      .replace(/\s+/g, ' ')
      .replace(/[^\w\s?!.,'-]/g, '');

    // Expand acronyms
    const expanded = expandAcronyms(processed);
    
    // Tokenize
    const tokens = tokenize(expanded);

    return {
      original: query,
      processed: expanded,
      tokens
    };
  }

  /**
   * Perform vector similarity search
   */
  async _vectorSearch(queryEmbedding, documents) {
    const results = [];

    for (const doc of documents) {
      const docData = doc.data;
      
      if (!docData.embedding || !Array.isArray(docData.embedding)) {
        continue;
      }

      try {
        const similarity = cosineSimilarity(queryEmbedding, docData.embedding);
        results.push({
          doc,
          vectorScore: similarity
        });
      } catch (err) {
        // Skip if vector dimensions don't match
      }
    }

    results.sort((a, b) => b.vectorScore - a.vectorScore);
    return results;
  }

  /**
   * Perform BM25 keyword search
   */
  _bm25Search(query, documents) {
    // Build index from documents
    const indexDocs = documents.map(doc => ({
      id: doc.id,
      title: doc.data.title || doc.data.meetingTitle || '',
      content: doc.data.content || doc.data.summary || doc.data.notes || '',
      originalDoc: doc
    }));

    this.bm25Index.buildIndex(indexDocs);
    return this.bm25Index.search(query, 50);
  }

  /**
   * Merge vector and BM25 results using Reciprocal Rank Fusion (RRF)
   */
  _mergeResults(vectorResults, bm25Results, weights = DEFAULT_HYBRID_WEIGHTS) {
    const k = 60; // RRF constant
    const scoreMap = new Map(); // docId -> { doc, vectorRank, bm25Rank, combinedScore }

    // Process vector results
    vectorResults.forEach((result, rank) => {
      const docId = result.doc.id;
      scoreMap.set(docId, {
        doc: result.doc,
        vectorScore: result.vectorScore,
        vectorRank: rank + 1,
        bm25Score: 0,
        bm25Rank: Infinity
      });
    });

    // Process BM25 results
    bm25Results.forEach((result, rank) => {
      const docId = result.doc.id;
      if (scoreMap.has(docId)) {
        const existing = scoreMap.get(docId);
        existing.bm25Score = result.bm25Score;
        existing.bm25Rank = rank + 1;
      } else {
        scoreMap.set(docId, {
          doc: result.doc.originalDoc || result.doc,
          vectorScore: 0,
          vectorRank: Infinity,
          bm25Score: result.bm25Score,
          bm25Rank: rank + 1
        });
      }
    });

    // Calculate RRF combined scores
    const results = [];
    for (const [docId, data] of scoreMap) {
      // RRF formula: sum of 1/(k + rank) for each method
      const vectorRRF = data.vectorRank < Infinity ? 1 / (k + data.vectorRank) : 0;
      const bm25RRF = data.bm25Rank < Infinity ? 1 / (k + data.bm25Rank) : 0;
      
      // Weighted combination
      const combinedRRF = (vectorRRF * weights.vector) + (bm25RRF * weights.bm25);
      
      // Also calculate a normalized similarity score for display
      const normalizedScore = (data.vectorScore * weights.vector) + 
        (data.bm25Score > 0 ? Math.min(data.bm25Score / 10, 1) * weights.bm25 : 0);

      results.push({
        ...data,
        combinedRRF,
        similarity: Math.max(data.vectorScore, normalizedScore),
        hybridScore: normalizedScore
      });
    }

    // Sort by combined RRF score
    results.sort((a, b) => b.combinedRRF - a.combinedRRF);
    return results;
  }

  /**
   * Apply multi-factor reranking
   */
  _rerank(results, query, options = {}) {
    const queryTokens = new Set(tokenize(query));
    const now = Date.now();

    return results.map(result => {
      const doc = result.doc;
      const docData = doc.data || {};

      // Factor 1: Combined similarity (already calculated)
      const similarityScore = result.similarity || 0;

      // Factor 2: Recency boost
      let recencyScore = 0.5; // Default for documents without date
      if (docData.createdAt || docData.updatedAt) {
        const docDate = (docData.updatedAt || docData.createdAt).toDate?.() || 
                       new Date(docData.updatedAt || docData.createdAt);
        const ageInDays = (now - docDate.getTime()) / (1000 * 60 * 60 * 24);
        // Decay: recent docs score higher
        recencyScore = Math.exp(-ageInDays / 180); // 180-day half-life
      }

      // Factor 3: Content quality
      const qualityScore = docData.contentQuality?.score || 0.5;

      // Factor 4: Category match
      let categoryScore = 0.5;
      if (options.preferredCategories && docData.category) {
        categoryScore = options.preferredCategories.includes(docData.category) ? 1.0 : 0.3;
      }

      // Factor 5: Title keyword match
      const titleTokens = new Set(tokenize(docData.title || ''));
      const titleOverlap = [...queryTokens].filter(t => titleTokens.has(t)).length;
      const titleScore = queryTokens.size > 0 ? 
        Math.min(titleOverlap / queryTokens.size, 1) : 0.5;

      // Calculate final rerank score
      const rerankScore = 
        (similarityScore * RERANK_WEIGHTS.similarity) +
        (recencyScore * RERANK_WEIGHTS.recency) +
        (qualityScore * RERANK_WEIGHTS.quality) +
        (categoryScore * RERANK_WEIGHTS.categoryMatch) +
        (titleScore * RERANK_WEIGHTS.titleMatch);

      return {
        ...result,
        rerankScore,
        rerankFactors: {
          similarity: similarityScore,
          recency: recencyScore,
          quality: qualityScore,
          category: categoryScore,
          titleMatch: titleScore
        }
      };
    }).sort((a, b) => b.rerankScore - a.rerankScore);
  }

  /**
   * Remove near-duplicate documents
   */
  _deduplicate(results, threshold = 0.92) {
    if (results.length <= 1) return results;

    const unique = [results[0]];
    
    for (let i = 1; i < results.length; i++) {
      const candidate = results[i];
      let isDuplicate = false;

      for (const kept of unique) {
        // Check if embeddings are too similar
        const keptData = kept.doc.data || {};
        const candData = candidate.doc.data || {};
        
        if (keptData.embedding && candData.embedding) {
          try {
            const sim = cosineSimilarity(keptData.embedding, candData.embedding);
            if (sim > threshold) {
              isDuplicate = true;
              break;
            }
          } catch (e) {
            // Skip if can't compare
          }
        }

        // Also check title similarity (fast string check)
        const keptTitle = (keptData.title || '').toLowerCase();
        const candTitle = (candData.title || '').toLowerCase();
        if (keptTitle && candTitle && keptTitle === candTitle) {
          isDuplicate = true;
          break;
        }
      }

      if (!isDuplicate) {
        unique.push(candidate);
      }
    }

    return unique;
  }

  /**
   * Main retrieval method - hybrid retrieval with all advanced features
   * 
   * @param {string} query - User's question/query
   * @param {object} keys - API keys for embeddings { openai, openrouter }
   * @param {number} topK - Number of documents to retrieve (default: 5)
   * @param {string[]} categories - Optional categories to filter by
   * @param {object} options - Optional configuration
   * @returns {Promise<Array>} Array of relevant documents with scores
   */
  async retrieveRelevantDocuments(query, keys, topK = 5, categories = null, options = {}) {
    try {
      const startTime = Date.now();
      console.log(`[ChatbotRAG] Starting hybrid retrieval for: "${query.substring(0, 100)}..."`);

      // Configuration
      const useCache = options.useCache !== false;
      const useHybrid = options.useHybridRetrieval !== false; // Default: enabled
      const useBM25 = options.useBM25 !== false; // Default: enabled
      const useReranking = options.useReranking !== false; // Default: enabled
      const deduplicate = options.deduplicate !== false; // Default: enabled
      const hybridWeights = options.hybridWeights || DEFAULT_HYBRID_WEIGHTS;
      const maxRetrieve = options.maxRetrieval || 50; // Get more initially for reranking
      const collections = options.collections || 'knowledgeBase';
      const collectionList = Array.isArray(collections) ? collections : [collections];

      // Check cache
      const cacheKey = useCache ? this._buildCacheKey(query, categories, options.queryType, collectionList) : null;
      if (useCache && cacheKey) {
        const cached = await this._getCachedDocuments(cacheKey);
        if (cached) {
          console.log('[ChatbotRAG] Cache hit for query');
          return cached;
        }
      }

      // Preprocess query
      const processedQuery = this._preprocessQuery(query);
      console.log(`[ChatbotRAG] Query tokens: ${processedQuery.tokens.slice(0, 10).join(', ')}...`);

      // Generate query embedding
      const queryEmbedding = await generateEmbedding(processedQuery.processed || query, keys);
      console.log(`[ChatbotRAG] Generated query embedding (${queryEmbedding.length} dimensions)`);

      // Fetch documents from Firestore
      const db = getDb();
      let allDocuments = [];

      for (const collectionName of collectionList) {
        console.log(`[ChatbotRAG] Searching collection: ${collectionName}`);
        let collectionQuery = db.collection(collectionName);
        
        if (collectionName === 'knowledgeBase' && categories && categories.length > 0) {
          collectionQuery = collectionQuery.where('category', 'in', categories);
        }

        const snapshot = await collectionQuery.get();
        
        if (snapshot.empty) {
          console.log(`[ChatbotRAG] No documents found in ${collectionName}`);
          continue;
        }

        console.log(`[ChatbotRAG] Found ${snapshot.size} documents in ${collectionName}`);
        const collectionDocs = snapshot.docs.map(doc => ({
          id: doc.id,
          ref: doc.ref,
          data: doc.data(),
          collection: collectionName
        }));
        
        allDocuments = allDocuments.concat(collectionDocs);
      }

      if (allDocuments.length === 0) {
        console.log('[ChatbotRAG] No documents found in any collection');
        return [];
      }

      console.log(`[ChatbotRAG] Total documents to search: ${allDocuments.length}`);

      // Populate missing embeddings
      const docsMissingEmbeddings = allDocuments.filter(doc => 
        !doc.data.embedding || !Array.isArray(doc.data.embedding)
      );
      if (docsMissingEmbeddings.length > 0) {
        console.log(`[ChatbotRAG] ${docsMissingEmbeddings.length} documents missing embeddings, generating...`);
        await this._populateMissingEmbeddings(docsMissingEmbeddings, keys);
      }

      // Perform retrieval
      let results;

      if (useHybrid && useBM25) {
        // Hybrid retrieval: Vector + BM25
        console.log('[ChatbotRAG] Using hybrid retrieval (vector + BM25)');
        
        const vectorResults = await this._vectorSearch(queryEmbedding, allDocuments);
        const bm25Results = this._bm25Search(processedQuery.processed || query, allDocuments);
        
        console.log(`[ChatbotRAG] Vector results: ${vectorResults.length}, BM25 results: ${bm25Results.length}`);
        
        results = this._mergeResults(
          vectorResults.slice(0, maxRetrieve),
          bm25Results.slice(0, maxRetrieve),
          hybridWeights
        );
      } else {
        // Vector-only retrieval (fallback)
        console.log('[ChatbotRAG] Using vector-only retrieval');
        const vectorResults = await this._vectorSearch(queryEmbedding, allDocuments);
        results = vectorResults.map(r => ({
          doc: r.doc,
          similarity: r.vectorScore,
          vectorScore: r.vectorScore,
          bm25Score: 0
        }));
      }

      // Apply reranking
      if (useReranking && results.length > 0) {
        console.log('[ChatbotRAG] Applying multi-factor reranking');
        results = this._rerank(results, query, {
          preferredCategories: categories
        });
      }

      // Deduplicate
      if (deduplicate && results.length > 1) {
        const beforeDedup = results.length;
        results = this._deduplicate(results);
        console.log(`[ChatbotRAG] Deduplication: ${beforeDedup} -> ${results.length} documents`);
      }

      // Apply similarity threshold
      const similarityThreshold = getAdaptiveSimilarityThreshold(
        query,
        options.queryType,
        options.minSimilarity
      );
      console.log(`[ChatbotRAG] Similarity threshold: ${similarityThreshold.toFixed(3)} (queryType=${options.queryType || 'general'})`);

      const filteredResults = results.filter(r => 
        r.similarity >= similarityThreshold || r.rerankScore >= similarityThreshold * 0.8
      );

      // Select top K
      const topResults = filteredResults.slice(0, topK);

      // Format output
      const outputDocs = topResults.map(result => {
        const docData = result.doc.data || {};
        return {
          id: result.doc.id,
          title: docData.title || docData.meetingTitle || 'Untitled',
          content: docData.content || docData.summary || docData.notes || '',
          category: docData.category || null,
          source: docData.source || result.doc.collection,
          sourceUrl: docData.sourceUrl || null,
          tags: docData.tags || [],
          similarity: result.similarity,
          collection: result.doc.collection || 'knowledgeBase',
          // Additional scoring info
          scores: {
            vector: result.vectorScore || 0,
            bm25: result.bm25Score || 0,
            rerank: result.rerankScore || result.similarity,
            hybrid: result.hybridScore || result.similarity
          }
        };
      });

      // Logging
      const duration = Date.now() - startTime;
      console.log(`[ChatbotRAG] Retrieved ${outputDocs.length} documents in ${duration}ms`);
      
      if (outputDocs.length > 0) {
        console.log(`[ChatbotRAG] Top match: "${outputDocs[0].title}" (similarity: ${outputDocs[0].similarity.toFixed(3)})`);
        outputDocs.forEach((doc, idx) => {
          console.log(`[ChatbotRAG]   ${idx + 1}. "${doc.title}" - sim: ${doc.similarity.toFixed(3)}, vec: ${doc.scores.vector.toFixed(3)}, bm25: ${doc.scores.bm25.toFixed(2)}`);
        });
      } else {
        const highestSim = results.length > 0 ? results[0].similarity?.toFixed(3) : 'N/A';
        console.warn(`[ChatbotRAG] No documents met threshold ${similarityThreshold.toFixed(3)}. Highest: ${highestSim}`);
      }

      // Cache results
      if (useCache && cacheKey && outputDocs.length > 0) {
        await this._setCachedDocuments(cacheKey, outputDocs);
      }

      return outputDocs;

    } catch (error) {
      console.error('[ChatbotRAG] Error in hybrid retrieval:', error);
      return [];
    }
  }

  /**
   * Build context string from retrieved documents
   * Enhanced with diversity-aware packing
   */
  buildContextString(documents, options = {}) {
    const buildStartTime = Date.now();
    
    if (!documents || documents.length === 0) {
      console.log('[ChatbotRAG] buildContextString: No documents provided');
      return '';
    }

    const maxTokens = Math.max(options.maxTokens || 750, 200);
    const approxCharsPerToken = 4;
    const includeSources = options.includeSources !== false;
    const includeScores = options.includeScores !== false;

    console.log(`[ChatbotRAG] Building context from ${documents.length} documents (maxTokens: ${maxTokens})`);

    // Sort by relevance while maintaining some diversity
    const sortedDocs = this._diversitySort(documents);

    let context = '=== RELEVANT KNOWLEDGE BASE INFORMATION (PRIORITY SOURCE) ===\n\n';
    let tokensUsed = Math.ceil(context.length / approxCharsPerToken);
    let documentsIncluded = 0;
    const categoriesSeen = new Set();

    for (let i = 0; i < sortedDocs.length; i++) {
      const doc = sortedDocs[i];
      
      // Build document header
      let docHeader = `Document ${i + 1}: ${doc.title}`;
      if (includeScores && doc.similarity != null) {
        docHeader += ` [Relevance: ${(doc.similarity * 100).toFixed(0)}%]`;
      }
      docHeader += '\n';

      // Build document footer
      let docFooter = '';
      if (includeSources) {
        const sourceText = doc.sourceUrl || doc.source || 'Internal Knowledge Base';
        docFooter = `\nSource: ${sourceText}`;
        if (doc.category && !categoriesSeen.has(doc.category)) {
          docFooter += ` | Category: ${doc.category}`;
          categoriesSeen.add(doc.category);
        }
        docFooter += '\n\n';
      } else {
        docFooter = '\n\n';
      }

      const headerTokens = Math.ceil(docHeader.length / approxCharsPerToken);
      const footerTokens = Math.ceil(docFooter.length / approxCharsPerToken);

      if (tokensUsed + headerTokens >= maxTokens) {
        break;
      }

      context += docHeader;
      tokensUsed += headerTokens;
      documentsIncluded++;

      const remainingTokens = maxTokens - tokensUsed - footerTokens;
      if (remainingTokens <= 0) {
        context += '...[content truncated]\n';
        tokensUsed = maxTokens;
        break;
      }

      const maxDocChars = remainingTokens * approxCharsPerToken;
      let docContent = (doc.content || '').substring(0, maxDocChars);
      
      // Clean content
      docContent = docContent
        .replace(/\n{3,}/g, '\n\n')
        .trim();

      context += docContent;
      tokensUsed += Math.ceil(docContent.length / approxCharsPerToken);

      if (docContent.length < (doc.content || '').length) {
        context += '...\n';
        context += docFooter;
        break;
      }

      context += docFooter;
      tokensUsed += footerTokens;
    }

    context += '=== END KNOWLEDGE BASE INFORMATION ===\n';
    
    const buildDuration = Date.now() - buildStartTime;
    console.log(`[ChatbotRAG] Context built in ${buildDuration}ms: ${context.length} chars (~${tokensUsed} tokens), ${documentsIncluded}/${documents.length} docs`);
    
    return context.trim();
  }

  /**
   * Sort documents with diversity awareness
   * Ensures different categories/topics are represented
   */
  _diversitySort(documents) {
    if (documents.length <= 3) return [...documents];

    const result = [];
    const remaining = [...documents];
    const categoriesSeen = new Set();

    // First pass: prioritize top results and diversity
    while (remaining.length > 0 && result.length < documents.length) {
      let bestIdx = 0;
      let bestScore = -1;

      for (let i = 0; i < remaining.length; i++) {
        const doc = remaining[i];
        let score = doc.similarity || 0;
        
        // Boost score if category not yet seen
        if (doc.category && !categoriesSeen.has(doc.category)) {
          score += 0.1;
        }
        
        // Higher position bonus for higher scores
        score += (remaining.length - i) * 0.01;

        if (score > bestScore) {
          bestScore = score;
          bestIdx = i;
        }
      }

      const selected = remaining.splice(bestIdx, 1)[0];
      result.push(selected);
      if (selected.category) categoriesSeen.add(selected.category);
    }

    return result;
  }

  /**
   * Generate embeddings for all documents (batch operation)
   */
  async generateAllEmbeddings(keys, batchSize = 10, forceRegenerate = false, collections = 'knowledgeBase') {
    try {
      const db = getDb();
      const collectionList = Array.isArray(collections) ? collections : [collections];
      let allDocs = [];
      
      for (const collectionName of collectionList) {
        const snapshot = await db.collection(collectionName).get();
        const docs = snapshot.docs.map(doc => ({ 
          id: doc.id, 
          ref: doc.ref, 
          data: doc.data(), 
          collection: collectionName 
        }));
        allDocs = allDocs.concat(docs);
      }
      
      let processed = 0;
      let skipped = 0;
      let errors = 0;

      console.log(`[ChatbotRAG] Found ${allDocs.length} documents in ${collectionList.join(', ')}`);
      
      const docsToProcess = allDocs.filter(doc => 
        forceRegenerate || !doc.data.embedding || !Array.isArray(doc.data.embedding) || doc.data.embedding.length === 0
      );
      skipped = allDocs.length - docsToProcess.length;

      for (let i = 0; i < docsToProcess.length; i += batchSize) {
        const chunk = docsToProcess.slice(i, i + batchSize);
        console.log(`[ChatbotRAG] Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(docsToProcess.length / batchSize)}`);
        
        const chunkResults = await Promise.all(chunk.map(async doc => {
          const docData = doc.data;
          if (!docData.title && !docData.content) {
            console.warn(`[ChatbotRAG] Skipping ${doc.id} - missing title and content`);
            return { status: 'error' };
          }
          try {
            const text = `${docData.title || ''}\n${docData.content || ''}`.substring(0, 8000);
            if (!text.trim()) {
              return { status: 'error' };
            }
            const embedding = await generateEmbedding(text, keys);
            if (!embedding || !Array.isArray(embedding) || embedding.length === 0) {
              return { status: 'error' };
            }
            docData.embedding = embedding;
            return { status: 'ok', doc };
          } catch (err) {
            console.error(`[ChatbotRAG] Error processing ${doc.id}:`, err.message);
            return { status: 'error' };
          }
        }));

        const batch = db.batch();
        chunkResults.forEach(result => {
          if (result.status === 'ok') {
            processed++;
            batch.update(result.doc.ref, {
              embedding: result.doc.data.embedding,
              embeddingUpdatedAt: admin.firestore.FieldValue.serverTimestamp()
            });
          } else {
            errors++;
          }
        });
        await batch.commit();
        console.log(`[ChatbotRAG] Progress: ${processed} processed, ${skipped} skipped, ${errors} errors`);
        await new Promise(resolve => setTimeout(resolve, 300));
      }

      console.log(`[ChatbotRAG] Completed: ${processed} embeddings generated (${skipped} skipped, ${errors} errors)`);
      return processed;

    } catch (error) {
      console.error('[ChatbotRAG] Error generating embeddings:', error);
      throw error;
    }
  }

  // ============================================================================
  // CACHE METHODS
  // ============================================================================

  _buildCacheKey(query, categories, queryType, collections) {
    const hash = crypto.createHash('sha1');
    const collectionsStr = Array.isArray(collections) ? collections.join(',') : (collections || 'knowledgeBase');
    hash.update(`v2|${queryType || 'general'}|${query}|${(categories || []).join(',')}|${collectionsStr}`);
    return hash.digest('hex');
  }

  async _getCachedDocuments(cacheKey) {
    try {
      const docRef = await getDb().collection(CACHE_COLLECTION).doc(cacheKey).get();
      if (!docRef.exists) return null;
      
      const data = docRef.data();
      if (!data || !data.expiresAt) {
        await docRef.ref.delete();
        return null;
      }
      
      const expiresAt = data.expiresAt.toDate();
      if (expiresAt < new Date()) {
        await docRef.ref.delete();
        return null;
      }
      
      return data.documents || null;
    } catch (err) {
      console.warn('[ChatbotRAG] Cache read error:', err.message);
      return null;
    }
  }

  async _setCachedDocuments(cacheKey, documents) {
    try {
      const expiresAt = admin.firestore.Timestamp.fromDate(
        new Date(Date.now() + CACHE_TTL_MINUTES * 60 * 1000)
      );
      await getDb().collection(CACHE_COLLECTION).doc(cacheKey).set({
        documents,
        expiresAt,
        cachedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    } catch (err) {
      console.warn('[ChatbotRAG] Cache write error:', err.message);
    }
  }

  async _populateMissingEmbeddings(docWrappers, keys) {
    const chunkSize = 3;
    for (let i = 0; i < docWrappers.length; i += chunkSize) {
      const chunk = docWrappers.slice(i, i + chunkSize);
      await Promise.all(chunk.map(async wrapper => {
        const docData = wrapper.data;
        try {
          const text = `${docData.title || ''}\n${docData.content || ''}`.substring(0, 8000);
          if (!text.trim()) return;
          
          const embedding = await generateEmbedding(text, keys);
          docData.embedding = embedding;
          await wrapper.ref.update({
            embedding,
            embeddingUpdatedAt: admin.firestore.FieldValue.serverTimestamp()
          });
        } catch (err) {
          console.warn(`[ChatbotRAG] Failed to generate embedding for ${wrapper.id}: ${err.message}`);
        }
      }));
      await new Promise(resolve => setTimeout(resolve, 300));
    }
  }
}

// Export
module.exports = { 
  ChatbotRAGRetriever,
  BM25Index,
  tokenize,
  expandAcronyms,
  getAdaptiveSimilarityThreshold,
  DEFAULT_HYBRID_WEIGHTS,
  STOPWORDS,
  ACRONYM_EXPANSIONS
};
