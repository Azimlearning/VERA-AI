# Knowledge Base Population Guide

## Quick Start

You have documents ready to populate the knowledge base. Here are three methods:

## Method 1: Using the Web Interface (Recommended for Testing)

1. **Start your dev server** (if not running):
   ```powershell
   npm run dev
   ```

2. **Navigate to VERA AI page**:
   - Open: http://localhost:3000/vera
   - Click "Inject Knowledge Base" button (usually in sidebar or top menu)

3. **Upload Documents**:
   - **Option A - Manual Entry:**
     - Enter Title, Content, Category, Tags
     - Categories: `systemic-shifts`, `mindset-behaviour`, `upstream-target`, `petronas-info`, `upstream`, `general`
     - Click "Inject Document"
   
   - **Option B - File Upload:**
     - Click "Choose File"
     - Select PDF or DOCX file
     - Click "Extract and Fill" to auto-extract text
     - Review and edit if needed
     - Click "Upload and Inject"

4. **Verify Documents Added**:
   - Check Firebase Console → Firestore → `knowledgeBase` collection
   - Documents should appear with title, content, category, tags

## Method 2: Using populateKnowledgeBase Function (Bulk from Website)

If you want to populate from existing website content:

```powershell
# Call the function
curl -X GET https://populateknowledgebase-el2jwxb5bq-uc.a.run.app
```

This will extract content from your website components and populate the knowledge base.

## Method 3: Using API Directly (For Programmatic Access)

### Manual Entry via API:

```powershell
$body = @{
    title = "Document Title"
    content = "Document content here..."
    category = "systemic-shifts"
    tags = "tag1, tag2, tag3"
    source = "manual"
    sourceUrl = "https://example.com"
} | ConvertTo-Json

Invoke-RestMethod -Uri "https://injectknowledgebase-el2jwxb5bq-uc.a.run.app" -Method POST -Body $body -ContentType "application/json"
```

### File Upload via API:

```powershell
# Use uploadKnowledgeBase endpoint
# Requires multipart form data with file
```

## Generate Embeddings

**After populating documents, generate embeddings for RAG:**

```powershell
# Call generateEmbeddings function
curl -X GET https://generateembeddings-el2jwxb5bq-uc.a.run.app
```

**Or use PowerShell:**
```powershell
Invoke-RestMethod -Uri "https://generateembeddings-el2jwxb5bq-uc.a.run.app" -Method GET
```

**Verification:**
- Check Firestore `knowledgeBase` collection
- Each document should have:
  - `embedding` field (array of 3072 numbers)
  - `embeddingUpdatedAt` timestamp

## Recommended Document Categories

Based on your presentation, use these categories:

- **systemic-shifts** - Systemic Shifts framework documents
- **mindset-behaviour** - Mindset and behavior transformation
- **upstream-target** - Upstream target strategies
- **petronas-info** - General PETRONAS information
- **upstream** - Upstream operations
- **general** - General knowledge base content

## Testing RAG After Population

1. Navigate to: http://localhost:3000/vera
2. Ask a question related to your documents
3. Verify:
   - Answer includes citations
   - Citations link to your documents
   - Similarity scores are shown
   - Answers are accurate

## Troubleshooting

**Documents not appearing:**
- Check Firestore Console for errors
- Verify function deployed correctly
- Check browser console for errors

**Embeddings not generating:**
- Verify `generateEmbeddings` function is deployed
- Check function logs in Firebase Console
- Ensure documents have content field

**RAG not finding documents:**
- Verify embeddings are generated
- Check similarity threshold (should be 0.65)
- Ensure documents have proper categories

