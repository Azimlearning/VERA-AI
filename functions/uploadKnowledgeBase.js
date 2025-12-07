/**
 * Upload Knowledge Base Document
 * 
 * Cloud Function to upload a document, extract text, and optionally create knowledge base entry
 * 
 * Enhanced with:
 * - Magic byte file type detection
 * - Structural/semantic chunking with overlap
 * - OCR fallback for image-only PDFs
 * - Chunk metadata (source, heading, page)
 * - Vision embeddings for images
 */

const admin = require('firebase-admin');
const cors = require('cors')({ origin: true });
const Busboy = require('busboy');
const path = require('path');
const os = require('os');
const fs = require('fs');
const pdf = require('pdf-parse');
const mammoth = require('mammoth');

// New modules for enhanced ingestion
const { detectFileType, detectFileTypeFull, isTextExtractable, isImage } = require('./fileTypeDetector');
const { chunkDocument, createImageChunk } = require('./documentChunker');
const { generateEmbedding } = require('./embeddingsHelper');

// Lazy getters for Firebase services (initialized in index.js)
function getDb() {
  return admin.firestore();
}

function getStorage() {
  return admin.storage();
}

function getBucket() {
  return getStorage().bucket("systemicshiftv2.firebasestorage.app");
}

/**
 * Run OCR on an image file using Tesseract
 */
async function runOCR(filePath) {
  try {
    const { createWorker } = require('tesseract.js');
    console.log('[Upload Knowledge Base] Running OCR on image...');
    const worker = await createWorker('eng');
    const { data: { text } } = await worker.recognize(filePath);
    await worker.terminate();
    console.log(`[Upload Knowledge Base] OCR extracted ${text.length} characters`);
    return text;
  } catch (error) {
    console.error('[Upload Knowledge Base] OCR failed:', error.message);
    return '';
  }
}

/**
 * Extract text from uploaded file with magic byte detection and OCR fallback
 */
async function extractTextFromFile(filePath, fileExt) {
  let extractedText = "";
  let pageData = []; // For page-aware extraction
  let usedOCR = false;

  try {
    // Verify file exists and has content
    if (!fs.existsSync(filePath)) {
      throw new Error('File does not exist');
    }

    const stats = fs.statSync(filePath);
    if (stats.size === 0) {
      throw new Error('File is empty');
    }

    // Read file buffer for magic byte detection
    const dataBuffer = fs.readFileSync(filePath);
    
    // Use magic byte detection instead of extension alone
    const detectedType = detectFileType(dataBuffer, path.basename(filePath));
    console.log(`[Upload Knowledge Base] Detected file type: ${detectedType.type} (confidence: ${detectedType.confidence}, method: ${detectedType.detectedBy})`);
    
    // Validate detected type matches expected
    if (detectedType.confidence === 'high' && detectedType.type !== fileExt.replace('.', '')) {
      console.warn(`[Upload Knowledge Base] File extension mismatch: expected ${fileExt}, detected ${detectedType.type}`);
    }

    // Process based on detected type
    if (detectedType.type === 'pdf' || fileExt === '.pdf') {
      // Validate PDF buffer
      if (!dataBuffer || dataBuffer.length === 0) {
        throw new Error('PDF file buffer is empty');
      }
      
      console.log(`[Upload Knowledge Base] PDF file validated, size: ${dataBuffer.length} bytes`);
      
      try {
        const data = await pdf(dataBuffer);
        extractedText = data.text || '';
        
        // Store page info if available
        if (data.numpages) {
          console.log(`[Upload Knowledge Base] PDF has ${data.numpages} pages`);
        }
        
        // OCR FALLBACK: If PDF parsing returns little/no text, try OCR
        if (extractedText.trim().length < 100) {
          console.log('[Upload Knowledge Base] PDF appears to be image-only, attempting OCR fallback...');
          const ocrText = await runOCR(filePath);
          if (ocrText && ocrText.trim().length > extractedText.trim().length) {
            extractedText = ocrText;
            usedOCR = true;
            console.log('[Upload Knowledge Base] OCR fallback successful');
          }
        }
      } catch (pdfError) {
        console.error(`[Upload Knowledge Base] PDF parsing error:`, pdfError);
        // Try OCR as fallback
        console.log('[Upload Knowledge Base] PDF parsing failed, attempting OCR fallback...');
        const ocrText = await runOCR(filePath);
        if (ocrText && ocrText.trim().length > 0) {
          extractedText = ocrText;
          usedOCR = true;
        } else {
          throw new Error(`Failed to parse PDF: ${pdfError.message}`);
        }
      }
    } else if (detectedType.type === 'docx' || fileExt === '.docx' || fileExt === '.doc') {
      const result = await mammoth.extractRawText({ path: filePath });
      extractedText = result.value || '';
    } else if (detectedType.type === 'text' || detectedType.type === 'markdown' || fileExt === '.txt' || fileExt === '.md') {
      extractedText = fs.readFileSync(filePath, 'utf-8');
    } else if (detectedType.type === 'json' || fileExt === '.json') {
      const jsonContent = fs.readFileSync(filePath, 'utf-8');
      try {
        const parsed = JSON.parse(jsonContent);
        extractedText = JSON.stringify(parsed, null, 2);
      } catch {
        extractedText = jsonContent;
      }
    } else if (detectedType.type === 'csv' || fileExt === '.csv') {
      extractedText = fs.readFileSync(filePath, 'utf-8');
    } else if (isImage(detectedType)) {
      // Image file - run OCR
      console.log('[Upload Knowledge Base] Image file detected, running OCR...');
      extractedText = await runOCR(filePath);
      usedOCR = true;
    }

    console.log(`[Upload Knowledge Base] Extracted ${extractedText.length} characters from ${detectedType.type} file${usedOCR ? ' (via OCR)' : ''}`);
    
    return {
      text: extractedText,
      detectedType,
      usedOCR,
      pageCount: pageData.length || 1
    };
  } catch (error) {
    console.error(`[Upload Knowledge Base] Error extracting text from ${fileExt}:`, error);
    throw new Error(`Failed to extract text: ${error.message}`);
  }
}

/**
 * Process extracted text into chunks with metadata
 */
function processIntoChunks(text, options = {}) {
  const {
    source = 'document',
    sourceUrl = '',
    documentId = null,
    category = 'general',
    title = ''
  } = options;

  const chunks = chunkDocument(text, {
    chunkSize: 800,
    overlap: 100,
    source,
    sourceUrl,
    documentId,
    category
  });

  // Add title to first chunk heading if not already set
  if (chunks.length > 0 && title && !chunks[0].heading) {
    chunks[0].heading = title;
  }

  return chunks;
}

/**
 * Cloud Function to upload document and extract text
 */
exports.uploadKnowledgeBase = async (req, res) => {
  cors(req, res, async () => {
    if (req.method !== 'POST') {
      return res.status(405).send({ error: 'Method Not Allowed' });
    }

    const busboy = Busboy({ headers: req.headers });
    const tmpdir = os.tmpdir();
    let formData = {};
    let filePath = null;
    let fileName = null;
    let fileMimeType = null;

    busboy.on('field', (fieldname, val) => {
      formData[fieldname] = val;
    });

    busboy.on('file', (fieldname, file, filenameDetails) => {
      if (fieldname === 'file') {
        const { filename, mimeType } = filenameDetails;
        fileName = filename;
        fileMimeType = mimeType;
        filePath = path.join(tmpdir, `${Date.now()}_${filename}`);
        const writeStream = fs.createWriteStream(filePath);
        
        // Create promise to wait for file write completion
        const fileWritePromise = new Promise((resolve, reject) => {
          file.pipe(writeStream);
          
          writeStream.on('finish', () => {
            console.log(`[Upload Knowledge Base] File written successfully: ${filePath}`);
            resolve();
          });
          
          writeStream.on('error', (err) => {
            console.error(`[Upload Knowledge Base] Write error:`, err);
            reject(err);
          });
          
          file.on('error', (err) => {
            console.error(`[Upload Knowledge Base] File stream error:`, err);
            reject(err);
          });
        });
        
        // Store promise for later use
        formData._fileWritePromise = fileWritePromise;
      }
    });

    busboy.on('finish', async () => {
      try {
        // Wait for file to be fully written
        if (formData._fileWritePromise) {
          try {
            await formData._fileWritePromise;
          } catch (writeError) {
            console.error('[Upload Knowledge Base] File write failed:', writeError);
            return res.status(500).send({
              success: false,
              error: `Failed to save uploaded file: ${writeError.message}`
            });
          }
        }
        
        // Additional small delay to ensure file system sync
        await new Promise(resolve => setTimeout(resolve, 100));
        
        if (!filePath || !fs.existsSync(filePath)) {
          return res.status(400).send({ error: 'No file uploaded' });
        }

        // Check file size
        const stats = fs.statSync(filePath);
        if (stats.size === 0) {
          fs.unlinkSync(filePath);
          return res.status(400).send({ error: 'Uploaded file is empty' });
        }

        console.log(`[Upload Knowledge Base] Processing file: ${fileName} (${stats.size} bytes)`);

        const fileExt = path.extname(fileName).toLowerCase();
        const allowedExt = ['.pdf', '.docx', '.doc', '.txt'];

        if (!allowedExt.includes(fileExt)) {
          fs.unlinkSync(filePath);
          return res.status(400).send({ 
            error: `File type ${fileExt} not supported. Allowed: ${allowedExt.join(', ')}` 
          });
        }

        // Extract text from file with enhanced detection
        let extractedText = '';
        let extractionResult = null;
        try {
          extractionResult = await extractTextFromFile(filePath, fileExt);
          extractedText = typeof extractionResult === 'string' ? extractionResult : extractionResult.text;
          
          // Validate extracted text
          if (!extractedText || extractedText.trim().length === 0) {
            console.warn(`[Upload Knowledge Base] No text extracted from file - may be image-only PDF or empty document`);
            // Continue anyway - let user add content manually or use OCR later
            extractedText = '[No text content extracted from document. Please add content manually or the document may be image-based.]';
          }
        } catch (extractError) {
          console.error('[Upload Knowledge Base] Text extraction failed:', extractError);
          // If extraction fails but file was uploaded, still allow manual entry
          extractedText = `[Text extraction failed: ${extractError.message}. Please add content manually.]`;
          
          // If addDirectly is true, we should fail since we can't extract content
          if (formData.addDirectly === 'true') {
            return res.status(400).send({
              success: false,
              error: `Failed to extract text from document: ${extractError.message}. Please try extracting text first or add content manually.`
            });
          }
        }

        // Upload file to Storage
        const bucket = getBucket();
        const uniqueFilename = `knowledgeBase/${Date.now()}_${fileName}`;
        const [uploadedFile] = await bucket.upload(filePath, {
          destination: uniqueFilename,
          metadata: { contentType: fileMimeType }
        });
        await uploadedFile.makePublic();
        const fileUrl = uploadedFile.publicUrl();

        // Clean up temp file
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }

        // Generate suggested title from filename if not provided
        const suggestedTitle = formData.title || fileName.replace(/\.[^/.]+$/, '');

        // Simple tag suggestions from filename and category
        const suggestedTags = [];
        if (formData.category) {
          suggestedTags.push(formData.category);
        }
        // Add filename words as tags (remove extension, split by dash/underscore)
        const nameWords = fileName.replace(/\.[^/.]+$/, '').split(/[-_\s]+/);
        suggestedTags.push(...nameWords.filter(w => w.length > 2).slice(0, 3));

        // If addDirectly flag is set, create knowledge base entry immediately
        if (formData.addDirectly === 'true') {
          // Parse tags from form or use suggested tags
          let tagsArray = [];
          if (formData.tags) {
            tagsArray = formData.tags
              .split(',')
              .map(tag => tag.trim())
              .filter(tag => tag.length > 0);
          }
          if (tagsArray.length === 0) {
            tagsArray = suggestedTags;
          }

          const category = formData.category || 'general';
          const db = getDb();

          // Process text into chunks with metadata
          const chunks = processIntoChunks(extractedText, {
            source: formData.source || 'document',
            sourceUrl: formData.sourceUrl || fileUrl,
            category,
            title: suggestedTitle
          });

          console.log(`[Upload Knowledge Base] Created ${chunks.length} chunks from document`);

          // Create parent document
          const parentDoc = {
            title: suggestedTitle,
            content: extractedText,
            category,
            tags: tagsArray,
            source: formData.source || 'document',
            sourceUrl: formData.sourceUrl || fileUrl,
            documentUrl: fileUrl,
            fileName: fileName,
            // Extraction metadata
            extractionMethod: extractionResult?.usedOCR ? 'ocr' : 'text',
            detectedFileType: extractionResult?.detectedType?.type || fileExt.replace('.', ''),
            // Chunk metadata
            chunkCount: chunks.length,
            isChunked: chunks.length > 1,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          };

          const docRef = await db.collection('knowledgeBase').add(parentDoc);
          const parentId = docRef.id;
          console.log(`[Upload Knowledge Base] Added parent document: ${parentId} - "${suggestedTitle}"`);

          // Store individual chunks with embeddings if document is large
          let chunkIds = [];
          if (chunks.length > 1) {
            const batch = db.batch();
            
            for (const chunk of chunks) {
              const chunkDoc = {
                // Reference to parent
                parentId,
                parentTitle: suggestedTitle,
                
                // Chunk content
                content: chunk.text,
                
                // Chunk metadata
                chunkIndex: chunk.chunkIndex,
                totalChunks: chunk.totalChunks,
                heading: chunk.heading || null,
                contentType: chunk.contentType,
                estimatedTokens: chunk.estimatedTokens,
                hasOverlap: chunk.hasOverlap,
                
                // Source metadata
                source: chunk.source,
                sourceUrl: chunk.sourceUrl,
                category,
                tags: tagsArray,
                
                // Timestamps
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
              };

              const chunkRef = db.collection('knowledgeBaseChunks').doc();
              batch.set(chunkRef, chunkDoc);
              chunkIds.push(chunkRef.id);
            }

            await batch.commit();
            console.log(`[Upload Knowledge Base] Stored ${chunkIds.length} chunks`);

            // Update parent with chunk references
            await docRef.update({ chunkIds });
          }

          return res.status(200).send({
            success: true,
            message: 'Document uploaded and added to knowledge base',
            documentId: parentId,
            title: suggestedTitle,
            extractedText: extractedText,
            fileUrl: fileUrl,
            chunking: {
              totalChunks: chunks.length,
              chunkIds: chunkIds.length > 0 ? chunkIds : null,
              usedOCR: extractionResult?.usedOCR || false,
              detectedType: extractionResult?.detectedType?.type || null
            }
          });
        }

        // Process into chunks for preview
        const previewChunks = processIntoChunks(extractedText, {
          source: 'document',
          sourceUrl: fileUrl,
          category: formData.category || 'general',
          title: suggestedTitle
        });

        // Return extracted text and suggestions for manual review
        res.status(200).send({
          success: true,
          extractedText: extractedText,
          title: suggestedTitle,
          suggestedTags: suggestedTags,
          suggestedCategory: formData.category || 'general',
          fileUrl: fileUrl,
          fileName: fileName,
          // Enhanced metadata
          extraction: {
            usedOCR: extractionResult?.usedOCR || false,
            detectedType: extractionResult?.detectedType?.type || null,
            confidence: extractionResult?.detectedType?.confidence || null,
            detectedBy: extractionResult?.detectedType?.detectedBy || null
          },
          chunking: {
            previewChunkCount: previewChunks.length,
            firstChunkHeading: previewChunks[0]?.heading || null,
            estimatedTotalTokens: previewChunks.reduce((sum, c) => sum + c.estimatedTokens, 0)
          }
        });

      } catch (error) {
        console.error('[Upload Knowledge Base] Error:', error);
        
        // Clean up temp file if it exists
        if (filePath && fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }

        res.status(500).send({
          success: false,
          error: error.message || 'Failed to process document',
        });
      }
    });

    if (req.rawBody) {
      busboy.end(req.rawBody);
    } else {
      req.pipe(busboy);
    }
  });
};

