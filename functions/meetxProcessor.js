// functions/meetxProcessor.js

const { extractTextFromFiles } = require('./aiHelper');
const { generateEmbedding } = require('./embeddingsHelper');
const admin = require('firebase-admin');
const { getStorage } = require('firebase-admin/storage');
const path = require('path');

function getDb() {
  return admin.firestore();
}

function getBucket() {
  return getStorage().bucket("systemicshiftv2.firebasestorage.app");
}

/**
 * Process uploaded meeting file and extract text
 */
async function processMeetingFile(fileUrl, fileName, fileType) {
  try {
    console.log('[MeetX Processor] Processing file:', {
      fileName: fileName,
      fileType: fileType,
      fileUrl: fileUrl
    });

    // Download file from Storage
    const fileUrlObj = new URL(fileUrl);
    let filePath = fileUrlObj.pathname;
    
    // Handle different Firebase Storage URL formats
    // Format 1: /v0/b/{bucket}/o/{path}?alt=media&token=...
    // Format 2: {bucket}/{path} (direct path)
    // Format 3: gs://{bucket}/{path}
    
    console.log('[MeetX Processor] Original pathname:', filePath);
    
    if (filePath.includes('/o/')) {
      // Extract path after /o/
      filePath = filePath.replace(/^\/v0\/b\/[^\/]+\/o\//, '');
      // Remove query parameters if present
      filePath = filePath.split('?')[0];
      console.log('[MeetX Processor] After /o/ extraction:', filePath);
    } else if (filePath.startsWith('/')) {
      filePath = filePath.substring(1);
      console.log('[MeetX Processor] After removing leading slash:', filePath);
    }
    
    // Decode URL encoding (handle %20, %2F, etc.) - may need multiple passes
    let decodedPath = filePath;
    try {
      // Try decoding multiple times in case of nested encoding
      for (let i = 0; i < 5; i++) {
        const prevPath = decodedPath;
        decodedPath = decodeURIComponent(decodedPath);
        if (prevPath === decodedPath) break; // No more decoding needed
      }
      filePath = decodedPath;
    } catch (decodeError) {
      console.warn('[MeetX Processor] URL decode error, using original path:', decodeError);
      // If decoding fails, try using the path as-is
    }
    
    console.log('[MeetX Processor] Final extracted file path:', filePath);
    
    const bucket = getBucket();
    const os = require('os');
    const fs = require('fs');
    const tempFilePath = path.join(os.tmpdir(), `${Date.now()}_${path.basename(fileName)}`);

    console.log('[MeetX Processor] Downloading file to:', tempFilePath);
    
    // Check if file exists in bucket
    const file = bucket.file(filePath);
    const [exists] = await file.exists();
    if (!exists) {
      throw new Error(`File not found in storage: ${filePath}. Please check the file URL.`);
    }
    
    await file.download({ destination: tempFilePath });
    
    // Verify file was downloaded
    if (!fs.existsSync(tempFilePath)) {
      throw new Error('File download failed - file does not exist at destination');
    }
    
    const fileStats = fs.statSync(tempFilePath);
    console.log('[MeetX Processor] File downloaded successfully, size:', fileStats.size, 'bytes');
    
    if (fileStats.size === 0) {
      throw new Error('Downloaded file is empty (0 bytes). The source file may be corrupted.');
    }

    // Extract text based on file type
    let extractedText = '';
    const fileExt = path.extname(fileName).toLowerCase();
    
    console.log('[MeetX Processor] Extracting text from file type:', fileExt);

    try {
      if (fileExt === '.pdf') {
        const pdf = require('pdf-parse');
        const dataBuffer = fs.readFileSync(tempFilePath);
        
        // Validate PDF buffer
        if (!dataBuffer || dataBuffer.length === 0) {
          throw new Error('PDF file buffer is empty');
        }
        
        // Check if it's a valid PDF
        const firstBytes = dataBuffer.slice(0, Math.min(1024, dataBuffer.length));
        const bufferString = firstBytes.toString('ascii');
        if (!bufferString.includes('%PDF')) {
          throw new Error('File does not appear to be a valid PDF. PDF header not found.');
        }
        
        console.log('[MeetX Processor] PDF validated, parsing...');
        const data = await pdf(dataBuffer);
        extractedText = data.text || '';
        console.log('[MeetX Processor] PDF extracted', extractedText.length, 'characters');
      } else if (fileExt === '.docx' || fileExt === '.doc') {
        const mammoth = require('mammoth');
        console.log('[MeetX Processor] Extracting from Word document...');
        const result = await mammoth.extractRawText({ path: tempFilePath });
        extractedText = result.value || '';
        console.log('[MeetX Processor] Word document extracted', extractedText.length, 'characters');
      } else if (fileExt === '.txt') {
        console.log('[MeetX Processor] Reading plain text file...');
        extractedText = fs.readFileSync(tempFilePath, 'utf-8');
        console.log('[MeetX Processor] Text file read', extractedText.length, 'characters');
      } else if (fileExt === '.rtf') {
        // RTF files - try to read as text (RTF is text-based but may need special parsing)
        console.log('[MeetX Processor] Processing RTF file...');
        try {
          extractedText = fs.readFileSync(tempFilePath, 'utf-8');
          // Basic RTF cleanup - remove RTF control words (simple approach)
          // For better extraction, consider using a library like rtf-parser
          extractedText = extractedText.replace(/\\[a-z]+\d*\s?/gi, ' ').replace(/\{[^}]*\}/g, ' ').replace(/\s+/g, ' ').trim();
          console.log('[MeetX Processor] RTF processed', extractedText.length, 'characters');
        } catch (err) {
          console.warn('[MeetX Processor] RTF parsing error, trying plain text:', err);
          extractedText = fs.readFileSync(tempFilePath, 'utf-8');
        }
      } else if (fileExt === '.odt') {
        // ODT files are ZIP archives containing XML
        // For now, return a message suggesting conversion
        throw new Error('ODT files are not yet supported. Please convert to DOCX or PDF format.');
      } else {
        // Try to read as plain text for unknown formats
        console.warn(`[MeetX Processor] Unknown file type ${fileExt}, attempting plain text read`);
        try {
          extractedText = fs.readFileSync(tempFilePath, 'utf-8');
          console.log('[MeetX Processor] Plain text read', extractedText.length, 'characters');
        } catch (err) {
          throw new Error(`Unsupported file type: ${fileExt}. Supported formats: PDF, DOCX, DOC, TXT, RTF`);
        }
      }
    } catch (extractError) {
      console.error('[MeetX Processor] Extraction error:', extractError.message);
      // If extraction fails, try reading as plain text as last resort
      if (fileExt !== '.txt') {
        console.log('[MeetX Processor] Attempting fallback: reading as plain text...');
        try {
          extractedText = fs.readFileSync(tempFilePath, 'utf-8');
          if (extractedText && extractedText.trim().length > 0) {
            console.log('[MeetX Processor] Fallback successful, extracted', extractedText.length, 'characters');
          } else {
            throw extractError; // Re-throw original error if fallback also fails
          }
        } catch (fallbackError) {
          throw new Error(`Failed to extract text: ${extractError.message}. File may be corrupted or in an unsupported format.`);
        }
      } else {
        throw extractError;
      }
    }

    // Validate extracted text
    if (!extractedText || extractedText.trim().length === 0) {
      // Clean up temp file before throwing
      if (fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
      }
      throw new Error(`No text content could be extracted from the ${fileExt} file. The file may be empty, corrupted, or contain only images.`);
    }

    // Clean up temp file
    if (fs.existsSync(tempFilePath)) {
      fs.unlinkSync(tempFilePath);
    }

    console.log('[MeetX Processor] Successfully extracted', extractedText.length, 'characters from', fileName);
    return extractedText;
  } catch (error) {
    // Clean up temp file on error
    const os = require('os');
    const fs = require('fs');
    const tempFilePath = path.join(os.tmpdir(), `${Date.now()}_${path.basename(fileName)}`);
    if (fs.existsSync(tempFilePath)) {
      try {
        fs.unlinkSync(tempFilePath);
      } catch (cleanupError) {
        console.warn('[MeetX Processor] Failed to cleanup temp file:', cleanupError);
      }
    }
    
    console.error('[MeetX Processor] Error processing file:', error.message);
    console.error('[MeetX Processor] Stack:', error.stack);
    throw error;
  }
}

/**
 * Generate all AI insights for a meeting
 */
async function generateMeetingInsights(meetingId, content, title, keys) {
  try {
    console.log('[MeetX Processor] Generating insights for meeting:', meetingId);

    const { 
      generateMeetingSummary, 
      generateCascadingSummary, 
      checkAlignment, 
      detectActionItems 
    } = require('./meetxAI');

    // Generate all insights in parallel
    const [summary, cascadingSummary, alignmentWarnings, actionItemsData] = await Promise.all([
      generateMeetingSummary(content, keys),
      generateCascadingSummary(content, title, keys),
      checkAlignment(content, title, keys),
      detectActionItems(content, keys)
    ]);

    // Generate embedding for semantic search
    let embedding = null;
    try {
      const textForEmbedding = `${title}\n${content}`.substring(0, 8000);
      embedding = await generateEmbedding(textForEmbedding, keys);
    } catch (embedError) {
      console.warn('[MeetX Processor] Failed to generate embedding:', embedError);
    }

    // Update meeting document
    const db = getDb();
    const meetingRef = db.collection('meetings').doc(meetingId);
    
    const updateData = {
      summary,
      aiInsights: {
        cascadingSummary,
        alignmentWarnings,
        actionItems: actionItemsData.actionItems,
        zombieTasks: actionItemsData.zombieTasks
      },
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    if (embedding) {
      updateData.embedding = embedding;
    }

    await meetingRef.update(updateData);

    console.log('[MeetX Processor] Successfully generated insights for meeting:', meetingId);
    return updateData;
  } catch (error) {
    console.error('[MeetX Processor] Error generating insights:', error);
    throw error;
  }
}

module.exports = {
  processMeetingFile,
  generateMeetingInsights
};

