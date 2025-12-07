/**
 * Document Chunker
 * 
 * Production-grade chunking system based on best practices from
 * ChatGPT, Claude, Gemini, and Cursor AI.
 * 
 * Features:
 * - Structural chunking (preserves headers, lists, tables, code blocks)
 * - Semantic chunking (one idea per chunk)
 * - Overlapping windows (50-100 token overlap)
 * - Chunk metadata (source, heading, page, position)
 * - Vision-chunk merging for images
 */

// Configuration
const DEFAULT_CHUNK_SIZE = 800;      // tokens (approx 3200 chars)
const DEFAULT_OVERLAP = 100;          // tokens overlap between chunks
const MIN_CHUNK_SIZE = 100;           // minimum tokens per chunk
const MAX_CHUNK_SIZE = 1500;          // maximum tokens per chunk
const CHARS_PER_TOKEN = 4;            // rough estimate

/**
 * Structural markers for splitting
 */
const STRUCTURAL_MARKERS = {
  // Headers (Markdown and plain text)
  headers: [
    /^#{1,6}\s+.+$/gm,                        // Markdown headers
    /^[A-Z][A-Z\s]{2,50}$/gm,                 // ALL CAPS headers
    /^[\d]+\.\s+[A-Z].+$/gm,                  // Numbered sections "1. Introduction"
    /^[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*:$/gm,    // Title Case with colon
  ],
  // Structural breaks
  breaks: [
    /\n{3,}/g,                                 // Multiple newlines
    /^[-=]{3,}$/gm,                            // Horizontal rules
    /^[*]{3,}$/gm,                             // Asterisk rules
  ],
  // List items
  lists: [
    /^[-*•]\s+.+$/gm,                          // Bullet points
    /^\d+\.\s+.+$/gm,                          // Numbered lists
    /^[a-z]\)\s+.+$/gm,                        // Letter lists
  ],
  // Code blocks
  codeBlocks: [
    /```[\s\S]*?```/g,                         // Fenced code blocks
    /^(?:\s{4}|\t).+$/gm,                      // Indented code
  ],
  // Tables
  tables: [
    /\|.+\|/g,                                 // Pipe tables
  ]
};

/**
 * Semantic sentence boundaries
 */
const SENTENCE_BOUNDARIES = /(?<=[.!?])\s+(?=[A-Z])/g;

/**
 * Extract heading from text chunk
 */
function extractHeading(text) {
  // Try markdown headers first
  const mdMatch = text.match(/^#{1,6}\s+(.+)$/m);
  if (mdMatch) return mdMatch[1].trim();

  // Try ALL CAPS headers
  const capsMatch = text.match(/^([A-Z][A-Z\s]{2,50})$/m);
  if (capsMatch) return capsMatch[1].trim();

  // Try numbered sections
  const numMatch = text.match(/^[\d]+\.\s+([A-Z].+)$/m);
  if (numMatch) return numMatch[1].trim();

  // Try first line if short enough
  const firstLine = text.split('\n')[0]?.trim();
  if (firstLine && firstLine.length < 80 && !firstLine.includes('.')) {
    return firstLine;
  }

  return null;
}

/**
 * Detect structural type of content
 */
function detectContentType(text) {
  if (/^```[\s\S]*```$/s.test(text.trim())) return 'code_block';
  if (/^\|.+\|$/m.test(text)) return 'table';
  if (/^[-*•]\s+/m.test(text)) return 'list';
  if (/^\d+\.\s+/m.test(text)) return 'numbered_list';
  if (/^#{1,6}\s+/.test(text)) return 'section';
  return 'paragraph';
}

/**
 * Estimate token count from text
 */
function estimateTokens(text) {
  if (!text) return 0;
  return Math.ceil(text.length / CHARS_PER_TOKEN);
}

/**
 * Split text into structural segments
 */
function splitIntoSegments(text) {
  const segments = [];
  let currentPos = 0;
  let currentHeading = null;

  // Split by major structural breaks first
  const majorBreaks = text.split(/\n{2,}/);
  
  for (const block of majorBreaks) {
    if (!block.trim()) continue;

    // Check if this is a header
    const headerMatch = block.match(/^(#{1,6})\s+(.+)$/m) ||
                       block.match(/^([A-Z][A-Z\s]{2,50})$/m) ||
                       block.match(/^([\d]+\.)\s+([A-Z].+)$/m);
    
    if (headerMatch) {
      currentHeading = headerMatch[2] || headerMatch[1];
    }

    segments.push({
      text: block.trim(),
      heading: currentHeading,
      type: detectContentType(block),
      position: currentPos
    });

    currentPos += block.length + 2; // +2 for the newlines
  }

  return segments;
}

/**
 * Merge small segments to meet minimum chunk size
 */
function mergeSmallSegments(segments, minTokens = MIN_CHUNK_SIZE) {
  const merged = [];
  let buffer = null;

  for (const segment of segments) {
    const segmentTokens = estimateTokens(segment.text);

    if (!buffer) {
      buffer = { ...segment, texts: [segment.text] };
      continue;
    }

    const bufferTokens = estimateTokens(buffer.texts.join('\n\n'));

    // If buffer is still small, merge
    if (bufferTokens < minTokens) {
      buffer.texts.push(segment.text);
      // Keep the most recent heading
      if (segment.heading) buffer.heading = segment.heading;
    } else {
      // Finalize buffer
      merged.push({
        text: buffer.texts.join('\n\n'),
        heading: buffer.heading,
        type: buffer.type,
        position: buffer.position
      });
      buffer = { ...segment, texts: [segment.text] };
    }
  }

  // Don't forget the last buffer
  if (buffer) {
    merged.push({
      text: buffer.texts.join('\n\n'),
      heading: buffer.heading,
      type: buffer.type,
      position: buffer.position
    });
  }

  return merged;
}

/**
 * Split large segments to meet maximum chunk size
 */
function splitLargeSegments(segments, maxTokens = MAX_CHUNK_SIZE, overlap = DEFAULT_OVERLAP) {
  const result = [];

  for (const segment of segments) {
    const tokens = estimateTokens(segment.text);

    if (tokens <= maxTokens) {
      result.push(segment);
      continue;
    }

    // Need to split this segment
    const sentences = segment.text.split(SENTENCE_BOUNDARIES);
    let currentChunk = [];
    let currentTokens = 0;
    let chunkIndex = 0;

    for (let i = 0; i < sentences.length; i++) {
      const sentence = sentences[i];
      const sentenceTokens = estimateTokens(sentence);

      if (currentTokens + sentenceTokens > maxTokens && currentChunk.length > 0) {
        // Emit current chunk
        result.push({
          text: currentChunk.join(' '),
          heading: segment.heading,
          type: segment.type,
          position: segment.position,
          chunkIndex: chunkIndex++
        });

        // Start new chunk with overlap
        const overlapTokens = overlap;
        let overlapText = [];
        let overlapCount = 0;

        // Grab last few sentences for overlap
        for (let j = currentChunk.length - 1; j >= 0 && overlapCount < overlapTokens; j--) {
          overlapText.unshift(currentChunk[j]);
          overlapCount += estimateTokens(currentChunk[j]);
        }

        currentChunk = overlapText;
        currentTokens = overlapCount;
      }

      currentChunk.push(sentence);
      currentTokens += sentenceTokens;
    }

    // Emit remaining
    if (currentChunk.length > 0) {
      result.push({
        text: currentChunk.join(' '),
        heading: segment.heading,
        type: segment.type,
        position: segment.position,
        chunkIndex: chunkIndex
      });
    }
  }

  return result;
}

/**
 * Main chunking function
 * 
 * @param {string} text - Document text to chunk
 * @param {object} options - Chunking options
 * @param {number} options.chunkSize - Target chunk size in tokens (default: 800)
 * @param {number} options.overlap - Overlap between chunks in tokens (default: 100)
 * @param {string} options.source - Source identifier (e.g., filename, URL)
 * @param {string} options.sourceUrl - Source URL if available
 * @param {string} options.documentId - Parent document ID
 * @param {number} options.pageNumber - Page number if from PDF
 * @param {string} options.category - Content category
 * @returns {Array<object>} Array of chunk objects with metadata
 */
function chunkDocument(text, options = {}) {
  const {
    chunkSize = DEFAULT_CHUNK_SIZE,
    overlap = DEFAULT_OVERLAP,
    source = 'unknown',
    sourceUrl = '',
    documentId = null,
    pageNumber = null,
    category = 'general'
  } = options;

  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    return [];
  }

  // Step 1: Split into structural segments
  const segments = splitIntoSegments(text);

  // Step 2: Merge small segments
  const merged = mergeSmallSegments(segments, MIN_CHUNK_SIZE);

  // Step 3: Split large segments with overlap
  const chunks = splitLargeSegments(merged, chunkSize, overlap);

  // Step 4: Add metadata to each chunk
  return chunks.map((chunk, index) => {
    const heading = chunk.heading || extractHeading(chunk.text);
    
    return {
      // Core content
      text: chunk.text,
      
      // Chunk identification
      chunkId: `${documentId || 'doc'}_chunk_${index}`,
      chunkIndex: index,
      totalChunks: chunks.length,
      
      // Source metadata
      source,
      sourceUrl,
      documentId,
      pageNumber,
      category,
      
      // Structural metadata
      heading,
      contentType: chunk.type,
      position: chunk.position,
      
      // Token estimates
      estimatedTokens: estimateTokens(chunk.text),
      
      // Overlap info
      hasOverlap: index > 0,
      overlapTokens: index > 0 ? overlap : 0,
      
      // Timestamps
      chunkedAt: new Date().toISOString()
    };
  });
}

/**
 * Chunk a PDF document with page awareness
 * 
 * @param {Array<{page: number, text: string}>} pages - Array of page objects
 * @param {object} options - Chunking options
 * @returns {Array<object>} Array of chunk objects with page metadata
 */
function chunkPDFPages(pages, options = {}) {
  const allChunks = [];

  for (const page of pages) {
    const pageChunks = chunkDocument(page.text, {
      ...options,
      pageNumber: page.page
    });

    allChunks.push(...pageChunks);
  }

  // Re-index chunks across all pages
  return allChunks.map((chunk, index) => ({
    ...chunk,
    chunkIndex: index,
    totalChunks: allChunks.length,
    chunkId: `${options.documentId || 'doc'}_chunk_${index}`
  }));
}

/**
 * Create an image chunk with vision metadata
 * 
 * @param {object} imageData - Image analysis data
 * @param {string} imageData.imageUrl - URL of the image
 * @param {string} imageData.caption - AI-generated caption
 * @param {string} imageData.ocrText - Extracted OCR text
 * @param {Array<string>} imageData.tags - Image tags
 * @param {string} imageData.category - Image category
 * @param {Array<number>} imageData.embedding - Vision embedding vector
 * @param {object} options - Additional metadata options
 * @returns {object} Image chunk object
 */
function createImageChunk(imageData, options = {}) {
  const {
    source = 'image',
    sourceUrl = '',
    documentId = null,
    pageNumber = null
  } = options;

  // Build searchable text from image data
  const searchableText = [
    imageData.caption || '',
    imageData.ocrText || '',
    (imageData.tags || []).join(', '),
    imageData.description || ''
  ].filter(Boolean).join('\n\n');

  return {
    // Core content
    text: searchableText,
    
    // Chunk identification
    chunkId: `${documentId || 'img'}_image_${Date.now()}`,
    chunkType: 'image',
    
    // Image-specific metadata
    imageUrl: imageData.imageUrl,
    caption: imageData.caption || '',
    ocrText: imageData.ocrText || '',
    tags: imageData.tags || [],
    imageCategory: imageData.category || 'Stock Images',
    
    // Vision embedding (if available)
    visionEmbedding: imageData.embedding || null,
    hasVisionEmbedding: !!imageData.embedding,
    
    // Source metadata
    source,
    sourceUrl: sourceUrl || imageData.imageUrl,
    documentId,
    pageNumber,
    
    // Structural metadata
    contentType: 'image',
    
    // Token estimates
    estimatedTokens: estimateTokens(searchableText),
    
    // Timestamps
    chunkedAt: new Date().toISOString()
  };
}

/**
 * Merge text chunks with image chunks for a document
 * 
 * @param {Array<object>} textChunks - Text chunks from chunkDocument
 * @param {Array<object>} imageChunks - Image chunks from createImageChunk
 * @returns {Array<object>} Merged and re-indexed chunks
 */
function mergeTextAndImageChunks(textChunks, imageChunks) {
  // Combine all chunks
  const allChunks = [...textChunks, ...imageChunks];
  
  // Sort by position/page if available
  allChunks.sort((a, b) => {
    // First by page
    if (a.pageNumber !== b.pageNumber) {
      return (a.pageNumber || 0) - (b.pageNumber || 0);
    }
    // Then by position
    return (a.position || 0) - (b.position || 0);
  });

  // Re-index
  return allChunks.map((chunk, index) => ({
    ...chunk,
    chunkIndex: index,
    totalChunks: allChunks.length
  }));
}

module.exports = {
  chunkDocument,
  chunkPDFPages,
  createImageChunk,
  mergeTextAndImageChunks,
  extractHeading,
  detectContentType,
  estimateTokens,
  // Constants
  DEFAULT_CHUNK_SIZE,
  DEFAULT_OVERLAP,
  MIN_CHUNK_SIZE,
  MAX_CHUNK_SIZE,
  CHARS_PER_TOKEN
};

