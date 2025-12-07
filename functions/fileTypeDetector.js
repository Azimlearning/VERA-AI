/**
 * File Type Detector
 * 
 * Production-grade file type detection using magic bytes (file signatures)
 * instead of relying on file extensions alone.
 * 
 * Based on best practices from ChatGPT, Claude, and Gemini document processing.
 */

/**
 * Magic byte signatures for common file types
 * Format: { signature: Buffer or hex string, offset: number, type: string, mime: string }
 */
const MAGIC_SIGNATURES = [
  // PDF
  {
    signature: Buffer.from('%PDF'),
    offset: 0,
    type: 'pdf',
    mime: 'application/pdf',
    parser: 'pdf'
  },
  
  // Office Open XML (DOCX, XLSX, PPTX) - ZIP-based
  // These start with PK (ZIP signature) but we need to check internal structure
  {
    signature: Buffer.from([0x50, 0x4B, 0x03, 0x04]),
    offset: 0,
    type: 'zip',
    mime: 'application/zip',
    parser: 'zip',
    // Sub-detection needed for DOCX/XLSX/PPTX
    requiresDeepInspection: true
  },
  
  // Legacy Office formats (DOC, XLS, PPT) - Compound File Binary Format
  {
    signature: Buffer.from([0xD0, 0xCF, 0x11, 0xE0, 0xA1, 0xB1, 0x1A, 0xE1]),
    offset: 0,
    type: 'ole',
    mime: 'application/x-ole-storage',
    parser: 'ole',
    requiresDeepInspection: true
  },
  
  // Images
  {
    signature: Buffer.from([0xFF, 0xD8, 0xFF]),
    offset: 0,
    type: 'jpeg',
    mime: 'image/jpeg',
    parser: 'image'
  },
  {
    signature: Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]),
    offset: 0,
    type: 'png',
    mime: 'image/png',
    parser: 'image'
  },
  {
    signature: Buffer.from('GIF87a'),
    offset: 0,
    type: 'gif',
    mime: 'image/gif',
    parser: 'image'
  },
  {
    signature: Buffer.from('GIF89a'),
    offset: 0,
    type: 'gif',
    mime: 'image/gif',
    parser: 'image'
  },
  {
    signature: Buffer.from('RIFF'),
    offset: 0,
    type: 'webp',
    mime: 'image/webp',
    parser: 'image',
    // WEBP has RIFF....WEBP signature
    additionalCheck: (buffer) => {
      if (buffer.length >= 12) {
        return buffer.slice(8, 12).toString() === 'WEBP';
      }
      return false;
    }
  },
  
  // Plain text indicators (no magic bytes, detect by content)
  {
    signature: null,
    type: 'text',
    mime: 'text/plain',
    parser: 'text',
    detectByContent: true
  },
  
  // JSON (detect by content)
  {
    signature: null,
    type: 'json',
    mime: 'application/json',
    parser: 'json',
    detectByContent: true
  },
  
  // CSV (detect by content)
  {
    signature: null,
    type: 'csv',
    mime: 'text/csv',
    parser: 'csv',
    detectByContent: true
  },
  
  // RTF
  {
    signature: Buffer.from('{\\rtf'),
    offset: 0,
    type: 'rtf',
    mime: 'application/rtf',
    parser: 'rtf'
  }
];

/**
 * ZIP internal paths that identify specific Office formats
 */
const OFFICE_ZIP_MARKERS = {
  'word/document.xml': { type: 'docx', mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', parser: 'docx' },
  'xl/workbook.xml': { type: 'xlsx', mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', parser: 'xlsx' },
  'ppt/presentation.xml': { type: 'pptx', mime: 'application/vnd.openxmlformats-officedocument.presentationml.presentation', parser: 'pptx' },
  '[Content_Types].xml': { type: 'ooxml', mime: 'application/x-ooxml', parser: 'ooxml' }
};

/**
 * Detect file type from buffer using magic bytes
 * 
 * @param {Buffer} buffer - File buffer (at least first 8KB recommended)
 * @param {string} filename - Optional filename for extension hint
 * @returns {object} Detected file type info
 */
function detectFileType(buffer, filename = '') {
  if (!Buffer.isBuffer(buffer)) {
    if (typeof buffer === 'string') {
      buffer = Buffer.from(buffer);
    } else {
      throw new Error('Input must be a Buffer or string');
    }
  }

  const extension = filename ? filename.split('.').pop()?.toLowerCase() : '';

  // Try magic byte detection first
  for (const sig of MAGIC_SIGNATURES) {
    if (sig.signature === null) continue; // Skip content-based detection for now

    // Check if buffer starts with signature at specified offset
    if (buffer.length >= sig.offset + sig.signature.length) {
      const slice = buffer.slice(sig.offset, sig.offset + sig.signature.length);
      
      if (slice.equals(sig.signature)) {
        // Additional check if needed
        if (sig.additionalCheck && !sig.additionalCheck(buffer)) {
          continue;
        }

        return {
          type: sig.type,
          mime: sig.mime,
          parser: sig.parser,
          confidence: 'high',
          detectedBy: 'magic_bytes',
          requiresDeepInspection: sig.requiresDeepInspection || false,
          extension
        };
      }
    }
  }

  // Try content-based detection for text files
  const contentType = detectTextContent(buffer);
  if (contentType) {
    return {
      ...contentType,
      confidence: 'medium',
      detectedBy: 'content_analysis',
      extension
    };
  }

  // Fall back to extension-based detection
  const extensionType = detectByExtension(extension);
  if (extensionType) {
    return {
      ...extensionType,
      confidence: 'low',
      detectedBy: 'extension',
      extension
    };
  }

  // Unknown type
  return {
    type: 'unknown',
    mime: 'application/octet-stream',
    parser: null,
    confidence: 'none',
    detectedBy: 'none',
    extension
  };
}

/**
 * Detect text-based file types by analyzing content
 */
function detectTextContent(buffer) {
  // Check if content appears to be text (no binary bytes)
  const sample = buffer.slice(0, Math.min(buffer.length, 4096));
  const text = sample.toString('utf-8');
  
  // Check for binary content
  const hasBinary = /[\x00-\x08\x0B\x0C\x0E-\x1F]/.test(text);
  if (hasBinary) {
    return null;
  }

  const trimmed = text.trim();

  // JSON detection
  if ((trimmed.startsWith('{') && trimmed.includes('"')) ||
      (trimmed.startsWith('[') && trimmed.includes('{'))) {
    try {
      JSON.parse(trimmed.slice(0, 1000) + (trimmed.length > 1000 ? '}' : ''));
      return { type: 'json', mime: 'application/json', parser: 'json' };
    } catch {
      // Not valid JSON, continue
    }
  }

  // CSV detection (contains commas and newlines in structured pattern)
  const lines = trimmed.split('\n').slice(0, 10);
  if (lines.length >= 2) {
    const commaPattern = lines.map(l => (l.match(/,/g) || []).length);
    const isConsistent = commaPattern.every(c => c === commaPattern[0] && c > 0);
    if (isConsistent && commaPattern[0] >= 1) {
      return { type: 'csv', mime: 'text/csv', parser: 'csv' };
    }
  }

  // Markdown detection
  if (/^#{1,6}\s+/.test(trimmed) || /\[.+\]\(.+\)/.test(trimmed)) {
    return { type: 'markdown', mime: 'text/markdown', parser: 'text' };
  }

  // Plain text
  return { type: 'text', mime: 'text/plain', parser: 'text' };
}

/**
 * Detect file type by extension (fallback)
 */
function detectByExtension(extension) {
  const extensionMap = {
    'pdf': { type: 'pdf', mime: 'application/pdf', parser: 'pdf' },
    'docx': { type: 'docx', mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', parser: 'docx' },
    'doc': { type: 'doc', mime: 'application/msword', parser: 'doc' },
    'xlsx': { type: 'xlsx', mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', parser: 'xlsx' },
    'xls': { type: 'xls', mime: 'application/vnd.ms-excel', parser: 'xls' },
    'pptx': { type: 'pptx', mime: 'application/vnd.openxmlformats-officedocument.presentationml.presentation', parser: 'pptx' },
    'ppt': { type: 'ppt', mime: 'application/vnd.ms-powerpoint', parser: 'ppt' },
    'txt': { type: 'text', mime: 'text/plain', parser: 'text' },
    'md': { type: 'markdown', mime: 'text/markdown', parser: 'text' },
    'json': { type: 'json', mime: 'application/json', parser: 'json' },
    'csv': { type: 'csv', mime: 'text/csv', parser: 'csv' },
    'rtf': { type: 'rtf', mime: 'application/rtf', parser: 'rtf' },
    'jpg': { type: 'jpeg', mime: 'image/jpeg', parser: 'image' },
    'jpeg': { type: 'jpeg', mime: 'image/jpeg', parser: 'image' },
    'png': { type: 'png', mime: 'image/png', parser: 'image' },
    'gif': { type: 'gif', mime: 'image/gif', parser: 'image' },
    'webp': { type: 'webp', mime: 'image/webp', parser: 'image' },
    'svg': { type: 'svg', mime: 'image/svg+xml', parser: 'image' }
  };

  return extensionMap[extension] || null;
}

/**
 * Deep inspect ZIP-based files to determine actual type
 * Requires JSZip or similar library
 * 
 * @param {Buffer} buffer - File buffer
 * @returns {Promise<object>} Detected type after deep inspection
 */
async function deepInspectZip(buffer) {
  try {
    const JSZip = require('jszip');
    const zip = await JSZip.loadAsync(buffer);
    
    for (const [path, typeInfo] of Object.entries(OFFICE_ZIP_MARKERS)) {
      if (zip.files[path]) {
        return {
          type: typeInfo.type,
          mime: typeInfo.mime,
          parser: typeInfo.parser,
          confidence: 'high',
          detectedBy: 'zip_deep_inspection'
        };
      }
    }

    // It's a ZIP but not a known Office format
    return {
      type: 'zip',
      mime: 'application/zip',
      parser: 'zip',
      confidence: 'high',
      detectedBy: 'zip_deep_inspection'
    };

  } catch (error) {
    console.warn('[fileTypeDetector] ZIP deep inspection failed:', error.message);
    return {
      type: 'zip',
      mime: 'application/zip',
      parser: 'zip',
      confidence: 'medium',
      detectedBy: 'magic_bytes',
      error: error.message
    };
  }
}

/**
 * Full file type detection with deep inspection
 * 
 * @param {Buffer} buffer - File buffer
 * @param {string} filename - Optional filename
 * @returns {Promise<object>} Complete file type info
 */
async function detectFileTypeFull(buffer, filename = '') {
  const basicType = detectFileType(buffer, filename);

  // Deep inspect ZIP-based files
  if (basicType.requiresDeepInspection && basicType.type === 'zip') {
    const deepType = await deepInspectZip(buffer);
    return {
      ...deepType,
      extension: basicType.extension
    };
  }

  return basicType;
}

/**
 * Check if file type is supported for text extraction
 */
function isTextExtractable(fileType) {
  const extractableParsers = ['pdf', 'docx', 'doc', 'text', 'json', 'csv', 'markdown', 'rtf'];
  return extractableParsers.includes(fileType.parser);
}

/**
 * Check if file type is an image
 */
function isImage(fileType) {
  return fileType.parser === 'image';
}

/**
 * Get recommended parser for file type
 */
function getRecommendedParser(fileType) {
  const parserMap = {
    'pdf': 'pdf-parse',
    'docx': 'mammoth',
    'doc': 'mammoth',
    'text': 'utf-8',
    'json': 'JSON.parse',
    'csv': 'csv-parse',
    'image': 'vision-api',
    'xlsx': 'xlsx',
    'pptx': 'pptx-parser'
  };

  return parserMap[fileType.parser] || null;
}

module.exports = {
  detectFileType,
  detectFileTypeFull,
  deepInspectZip,
  isTextExtractable,
  isImage,
  getRecommendedParser,
  MAGIC_SIGNATURES,
  OFFICE_ZIP_MARKERS
};

