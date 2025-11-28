/**
 * Migration Script: Writeup Examples to Knowledge Base
 * 
 * This script migrates writeup examples from rag_writeup_examples.json
 * to the knowledgeBase Firestore collection.
 * 
 * Run this once to migrate the examples:
 * node migrateWriteupExamples.js
 * 
 * Or call via Cloud Function if needed
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');
const { generateEmbedding } = require('./embeddingsHelper');

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

/**
 * Migrate writeup examples to knowledge base
 */
async function migrateWriteupExamples(keys) {
  try {
    console.log('[Migration] Starting writeup examples migration...');
    
    // Load examples from JSON file
    const examplesFile = path.join(__dirname, 'rag_writeup_examples.json');
    const fileContent = fs.readFileSync(examplesFile, 'utf-8');
    const data = JSON.parse(fileContent);
    const examples = data.examples || [];
    
    console.log(`[Migration] Found ${examples.length} examples to migrate`);
    
    let migrated = 0;
    let skipped = 0;
    let errors = 0;
    
    for (const example of examples) {
      try {
        // Check if example already exists in knowledge base
        const existingQuery = await db.collection('knowledgeBase')
          .where('title', '==', example.title)
          .where('source', '==', 'writeup-example')
          .limit(1)
          .get();
        
        if (!existingQuery.empty) {
          console.log(`[Migration] Skipping "${example.title}" - already exists`);
          skipped++;
          continue;
        }
        
        // Prepare document data
        const docData = {
          title: example.title,
          content: example.writeup || '',
          category: 'writeup-examples',
          tags: example.keywords || [],
          source: 'writeup-example',
          sourceUrl: null,
          titleLower: example.title.toLowerCase(),
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        };
        
        // Generate embedding
        const textForEmbedding = `${example.title}\n${example.writeup || ''}`.substring(0, 8000);
        console.log(`[Migration] Generating embedding for "${example.title}"...`);
        const embedding = await generateEmbedding(textForEmbedding, keys);
        
        docData.embedding = embedding;
        docData.embeddingStatus = 'ready';
        docData.embeddingModel = 'text-embedding-3-small';
        docData.embeddingGeneratedAt = admin.firestore.FieldValue.serverTimestamp();
        
        // Add metadata from example structure
        if (example.theme) {
          docData.tags.push(`theme:${example.theme}`);
        }
        if (example.keyTopics && example.keyTopics.length > 0) {
          docData.tags = docData.tags.concat(example.keyTopics);
        }
        
        // Add to knowledge base
        await db.collection('knowledgeBase').add(docData);
        console.log(`[Migration] ✅ Migrated "${example.title}"`);
        migrated++;
        
        // Small delay to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (error) {
        console.error(`[Migration] ❌ Error migrating "${example.title}":`, error.message);
        errors++;
      }
    }
    
    console.log(`[Migration] ✅ Migration complete! Migrated: ${migrated}, Skipped: ${skipped}, Errors: ${errors}`);
    return { migrated, skipped, errors };
    
  } catch (error) {
    console.error('[Migration] Fatal error:', error);
    throw error;
  }
}

// If run directly, execute migration
if (require.main === module) {
  // For direct execution, you'll need to provide API keys
  // This is mainly for Cloud Function usage
  console.log('[Migration] This script should be called from a Cloud Function with API keys');
}

module.exports = { migrateWriteupExamples };

