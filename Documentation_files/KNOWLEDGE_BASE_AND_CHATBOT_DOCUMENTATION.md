# Knowledge Base Injection & Chatbot (Vera AI) - Technical Documentation

## Overview

This document provides a comprehensive breakdown of all files and functions involved in two key features:
1. **Knowledge Base Injection Feature** - Allows users to inject data into the knowledge base
2. **Chatbot (Vera AI) Feature** - AI-powered chatbot with RAG (Retrieval-Augmented Generation)

---

## 1. Knowledge Base Injection Feature

### How It Works

The knowledge base injection feature allows users to add content to the knowledge base through:
- Manual form entry (title, content, category, tags, source, sourceUrl)
- File upload (PDF, DOCX, TXT) with automatic text extraction
- Two modes: Extract & Review, or Upload & Add Directly

### Frontend Files

#### `systemicshiftsver2/src/components/KnowledgeBaseInjector.js`

**Component:** `KnowledgeBaseInjector`

**Props:**
- `isOpen` (boolean) - Controls modal visibility
- `onClose` (function) - Callback to close modal

**State Variables:**
- `formData` - Form data object (title, content, category, tags, source, sourceUrl)
- `selectedFile` - Selected file object
- `isSubmitting` - Submission loading state
- `isExtracting` - Text extraction loading state
- `message` - Success/error message object

**Functions:**

1. **`handleInputChange(e)`**
   - Updates form data state when input fields change
   - Parameters: `e` - Event object
   - Updates: `formData` state

2. **`handleFileChange(e)`**
   - Handles file selection
   - Parameters: `e` - File input event
   - Auto-fills title from filename if title is empty
   - Updates: `selectedFile` state

3. **`handleExtractAndFill()`**
   - Extracts text from uploaded file and fills form
   - Calls: `uploadKnowledgeBase` Cloud Function
   - Sends: FormData with file, category, source, sourceUrl
   - Updates: `formData` with extracted text, suggested tags, suggested category
   - Sets: Success message

4. **`handleSubmit(e)`**
   - Main submission handler for manual form entry
   - Parameters: `e` - Form submit event
   - Validates: Title and content are required
   - Parses: Tags from comma-separated string
   - Calls: `injectKnowledgeBase` Cloud Function
   - Payload: `{ title, content, category, tags, source, sourceUrl }`
   - On success: Resets form, closes modal after 2 seconds

5. **`handleUploadAndAddDirectly()`**
   - Uploads file and adds directly to knowledge base without review
   - Validates: File is selected
   - Calls: `uploadKnowledgeBase` Cloud Function with `addDirectly: 'true'` flag
   - Sends: FormData with file + all form fields
   - On success: Resets form, closes modal

**Constants:**
- `CATEGORIES` - Array of allowed categories
- `injectFunctionUrl` - `https://us-central1-systemicshiftv2.cloudfunctions.net/injectKnowledgeBase`
- `uploadAndInjectFunctionUrl` - `https://us-central1-systemicshiftv2.cloudfunctions.net/uploadKnowledgeBase`

---

### Backend Files

#### `systemicshiftsver2/functions/injectKnowledgeBase.js`

**Exported Function:** `exports.injectKnowledgeBase`

**Cloud Function Endpoint:** `POST /injectKnowledgeBase`

**Request Body:**
```json
{
  "title": "string (required, max 200 chars)",
  "content": "string (required, max 20,000 chars)",
  "category": "string (required, must be in ALLOWED_CATEGORIES)",
  "tags": "array of strings (optional)",
  "source": "string (optional, default: 'manual')",
  "sourceUrl": "string (optional, must be valid URL)"
}
```

**Helper Functions:**

1. **`sanitizeContent(text)`**
   - Removes script tags and control characters
   - Parameters: `text` - Input text
   - Returns: Sanitized string

2. **`isValidUrl(value)`**
   - Validates URL format (HTTP/HTTPS)
   - Parameters: `value` - URL string
   - Returns: Boolean

3. **`inferCategory(title, content, providedCategory)`**
   - Auto-infers category from keywords if category is 'general'
   - Parameters: `title`, `content`, `providedCategory`
   - Uses: `CATEGORY_KEYWORDS` mapping
   - Returns: Category string

4. **`scoreContentQuality(text)`**
   - Scores content quality (0-1)
   - Parameters: `text` - Content text
   - Factors: Length, structure, data presence
   - Returns: `{ score, details: { lengthScore, structureScore, dataScore } }`

5. **`buildEmbeddingKeys()`**
   - Builds API keys object from environment variables
   - Returns: `{ openai?, openrouter? }`

6. **`generateDocumentEmbedding(title, content)`**
   - Generates embedding vector for document
   - Parameters: `title`, `content`
   - Calls: `embeddingsHelper.generateEmbedding()`
   - Model: `text-embedding-3-small`
   - Returns: `{ status, embedding?, embeddingModel?, reason? }`

**Main Function Flow:**

1. Validates request method (POST)
2. Validates and sanitizes input
3. Checks for duplicate titles in Firestore
4. Generates document embedding
5. Creates knowledge base document with:
   - Title, content, category, tags
   - Embedding vector
   - Metadata (source, sourceUrl, timestamps)
   - Quality score
   - Embedding status
6. Saves to Firestore `knowledgeBase` collection
7. Returns success response with document ID

**Constants:**
- `EMBEDDING_MODEL` - `'text-embedding-3-small'`
- `EMBEDDING_TEXT_LIMIT` - `8000` characters
- `MAX_TITLE_LENGTH` - `200`
- `MAX_CONTENT_LENGTH` - `20000`
- `MAX_TAG_LENGTH` - `50`
- `ALLOWED_CATEGORIES` - Set of allowed category strings
- `CATEGORY_KEYWORDS` - Object mapping categories to keywords

---

#### `systemicshiftsver2/functions/uploadKnowledgeBase.js`

**Exported Function:** `exports.uploadKnowledgeBase`

**Cloud Function Endpoint:** `POST /uploadKnowledgeBase`

**Request:** Multipart form data with:
- `file` - PDF, DOCX, or TXT file
- `category` - Category string
- `source` - Source string
- `sourceUrl` - Source URL string
- `title` - Title string (optional)
- `tags` - Tags string (optional)
- `addDirectly` - `'true'` to add directly without review

**Helper Functions:**

1. **`extractTextFromFile(filePath, fileExt)`**
   - Extracts text from uploaded file
   - Parameters: `filePath` - Temporary file path, `fileExt` - File extension
   - Supports: `.pdf` (using `pdf-parse`), `.docx/.doc` (using `mammoth`), `.txt`
   - Returns: Extracted text string
   - Throws: Error if extraction fails

2. **`getDb()`**
   - Returns Firestore instance
   - Lazy getter (initialized in index.js)

3. **`getStorage()`**
   - Returns Firebase Storage instance

4. **`getBucket()`**
   - Returns Storage bucket: `systemicshiftv2.firebasestorage.app`

**Main Function Flow:**

1. Parses multipart form data using Busboy
2. Saves uploaded file to temporary directory
3. Validates file exists and is not empty
4. Validates file extension (`.pdf`, `.docx`, `.doc`, `.txt`)
5. Extracts text from file
6. Uploads file to Firebase Storage
7. Makes file publicly accessible
8. If `addDirectly === 'true'`:
   - Creates knowledge base entry immediately
   - Saves to Firestore `knowledgeBase` collection
   - Returns success with document ID
9. Otherwise:
   - Returns extracted text, suggested title, suggested tags
   - User reviews and submits via `injectKnowledgeBase`

**Dependencies:**
- `busboy` - Multipart form parsing
- `pdf-parse` - PDF text extraction
- `mammoth` - DOCX text extraction

---

#### `systemicshiftsver2/functions/embeddingsHelper.js`

**Purpose:** Generates vector embeddings for semantic search

**Exported Functions:**

1. **`generateEmbedding(text, keys, model)`**
   - Generates embedding vector for text
   - Parameters:
     - `text` - Text to embed (required, non-empty)
     - `keys` - `{ openai?, openrouter? }` API keys object
     - `model` - Model name (default: `'text-embedding-3-small'`)
   - Tries OpenAI first, falls back to OpenRouter
   - Returns: `Promise<number[]>` - Embedding vector array
   - Throws: Error if no API keys available

2. **`generateOpenAIEmbedding(text, apiKey, model)`**
   - Calls OpenAI embeddings API
   - Endpoint: `https://api.openai.com/v1/embeddings`
   - Returns: Embedding vector array

3. **`generateOpenRouterEmbedding(text, apiKey, model)`**
   - Calls OpenRouter embeddings API
   - Endpoint: `https://openrouter.ai/api/v1/embeddings`
   - Returns: Embedding vector array

4. **`cosineSimilarity(vecA, vecB)`**
   - Calculates cosine similarity between two vectors
   - Parameters: `vecA`, `vecB` - Number arrays (must be same length)
   - Returns: Similarity score between -1 and 1
   - Formula: `dotProduct / (sqrt(normA) * sqrt(normB))`

5. **`generateEmbeddingsBatch(texts, keys, batchSize)`**
   - Generates embeddings for multiple texts in batches
   - Parameters:
     - `texts` - Array of text strings
     - `keys` - API keys object
     - `batchSize` - Number of texts per batch (default: 10)
   - Returns: `Promise<number[][]>` - Array of embedding vectors
   - Includes delay between batches to avoid rate limiting

---

#### `systemicshiftsver2/functions/index.js`

**Purpose:** Registers Cloud Functions

**Relevant Exports:**
- `exports.injectKnowledgeBase` (line ~113) - Wraps `injectKnowledgeBase.js`
- `exports.uploadKnowledgeBase` (line ~816) - Wraps `uploadKnowledgeBase.js`

**Configuration:**
- Region: `us-central1`
- Timeout: 120 seconds
- Secrets: API keys from environment

---

## 2. Chatbot (Vera AI) Feature

### How It Works

The chatbot uses RAG (Retrieval-Augmented Generation) to answer questions:
1. User sends message
2. System generates query embedding
3. Searches knowledge base using cosine similarity
4. Retrieves top 5 most relevant documents
5. Builds context string from documents
6. Enhances system prompt with context
7. Calls LLM (Gemini/OpenRouter) with enhanced prompt
8. Returns answer with citations and suggestions

### Frontend Files

#### `systemicshiftsver2/src/app/vera/page.js`

**Component:** `VeraPage` (default export)

**State Variables:**
- `chatInput` - Current input text
- `isChatLoading` - Loading state
- `isStreaming` - Streaming response state
- `streamingText` - Accumulated streaming text
- `streamingMessageIndex` - Index of message being streamed
- `chatHistory` - Array of message objects
- `suggestions` - Array of suggested follow-up questions
- `hasChatStarted` - Whether chat has started
- `isInjectorOpen` - Knowledge base injector modal state
- `isSettingsOpen` - Developer settings modal state
- `isSidebarOpen` - Chat history sidebar state
- `isRightSidebarOpen` - Right sidebar state
- `selectedAgent` - Selected AI agent object
- `currentSessionId` - Current chat session ID
- `developerSettings` - Developer settings object
- `selectedMessageInfo` - Selected message info for panel
- `showSuggestions` - Whether to show suggestions

**Refs:**
- `chatContainerRef` - Reference to chat container for scrolling
- `abortControllerRef` - AbortController for canceling requests

**Functions:**

1. **`getOrCreateSession()`**
   - Creates new chat session or returns existing one
   - Creates Firestore document in `chatSessions` collection
   - Returns: Session ID string
   - Sets: `currentSessionId` state

2. **`saveMessageToSession(message, sessionId, currentHistory)`**
   - Saves message to Firestore chat session
   - Parameters:
     - `message` - Message object
     - `sessionId` - Session ID
     - `currentHistory` - Current chat history array
   - Updates: Firestore `chatSessions` document

3. **`handleStreamingResponse(response, sessionId, updatedHistory)`**
   - Handles streaming response from server
   - Parameters: `response` - Fetch Response object, `sessionId`, `updatedHistory`
   - Parses: Server-Sent Events (SSE) format
   - Updates: `streamingText` state as chunks arrive
   - On completion: Saves final message to session

4. **`handleChatSubmit(messageText)`**
   - Main chat submission handler
   - Parameters: `messageText` - User message string
   - Flow:
     1. Validates input
     2. Creates/gets session
     3. Adds user message to history
     4. Saves user message to Firestore
     5. Calls `askChatbot` Cloud Function
     6. Handles streaming or JSON response
     7. Updates chat history
     8. Updates session title from first user message
   - Request payload:
     ```json
     {
       "message": "string",
       "agent": "agentId or null",
       "agentContext": { "name", "description" } or null,
       "temperature": number (optional),
       "model": "string" (optional),
       "maxTokens": number (optional),
       "dataInjection": boolean (optional)
     }
     ```

5. **`handleStop()`**
   - Stops current generation
   - Aborts: Fetch request via AbortController
   - Saves: Partial streaming text if available

6. **`handleRegenerate(messageIndex)`**
   - Regenerates AI response for a user message
   - Parameters: `messageIndex` - Index of user message
   - Truncates: Chat history to message index
   - Calls: `handleChatSubmit()` with original message

7. **`handleQuestionClick(question)`**
   - Handles click on suggested question
   - Parameters: `question` - Question string
   - Calls: `handleChatSubmit(question)`

8. **`handleClearChat()`**
   - Clears chat history
   - Resets: All chat-related state
   - Aborts: Any pending requests

9. **`handleLoadSession(messages, sessionId)`**
   - Loads saved chat session
   - Parameters: `messages` - Message array, `sessionId` - Session ID
   - Sets: Chat history and session ID

**Constants:**
- `chatFunctionUrl` - `"https://askchatbot-el2jwxb5bq-uc.a.run.app"`
- `initialHistory` - Initial welcome message array

**Effects:**
- Auto-scrolls chat container when messages update
- Tracks scroll position to show/hide suggestions

---

#### `systemicshiftsver2/src/components/vera/ChatInput.js`

**Purpose:** Chat input component with agent selection

**Features:**
- Text input with submit button
- Agent picker integration
- Loading/streaming state handling
- Stop generation button
- Command support (e.g., `/` commands)

---

#### `systemicshiftsver2/src/components/vera/MarkdownMessage.js`

**Purpose:** Renders markdown-formatted messages

**Features:**
- Markdown parsing and rendering
- Code block syntax highlighting
- Streaming text display
- Citation links

---

#### `systemicshiftsver2/src/components/vera/MessageActions.js`

**Purpose:** Action buttons for messages

**Actions:**
- Regenerate response
- Copy message
- Show message info
- Other message actions

---

#### `systemicshiftsver2/src/components/vera/MessageInfoPanel.js`

**Purpose:** Displays detailed information about a message

**Information:**
- Message metadata
- Citations used
- Model information
- Generation parameters

---

#### `systemicshiftsver2/src/components/vera/AgentSelector.js`

**Purpose:** AI agent selection component

**Features:**
- List of available agents
- Agent descriptions
- Agent selection handler

---

#### `systemicshiftsver2/src/components/vera/SuggestedQuestions.js`

**Purpose:** Displays suggested follow-up questions

**Features:**
- Question suggestions from AI response
- Click handler to submit questions

---

#### `systemicshiftsver2/src/components/vera/DeveloperSettings.js`

**Purpose:** Developer settings modal

**Settings:**
- Temperature (0-2)
- Model selection (auto, specific model)
- Max tokens
- Data injection toggle

---

#### `systemicshiftsver2/src/components/vera/SettingsMenu.js`

**Purpose:** Settings menu component

**Options:**
- Toggle context panel
- Open developer settings
- Open knowledge base injector
- Clear chat

---

#### `systemicshiftsver2/src/components/vera/RightSidebar.js`

**Purpose:** Right sidebar with context information

**Content:**
- References from citations
- Related topics
- Context data

---

#### `systemicshiftsver2/src/components/vera/TypingIndicator.js`

**Purpose:** Shows typing indicator while AI is generating

---

#### `systemicshiftsver2/src/components/vera/ScrollToBottom.js`

**Purpose:** Scroll to bottom button

**Features:**
- Appears when scrolled up
- Scrolls to bottom on click

---

#### `systemicshiftsver2/src/components/chat/ChatHistorySidebar.js`

**Purpose:** Chat history sidebar

**Features:**
- List of saved chat sessions
- New chat button
- Load session handler
- Current session highlighting

---

### Backend Files

#### `systemicshiftsver2/functions/index.js`

**Exported Function:** `exports.askChatbot`

**Cloud Function Endpoint:** `POST /askChatbot` or `https://askchatbot-el2jwxb5bq-uc.a.run.app`

**Configuration:**
- Region: `us-central1`
- Timeout: 120 seconds
- Secrets: `geminiApiKey`, `openRouterApiKey`
- Memory: 512MiB

**Request Body:**
```json
{
  "message": "string (required)",
  "agent": "string or null (optional)",
  "agentContext": { "name": "string", "description": "string" } or null (optional),
  "temperature": number (optional),
  "model": "string" (optional),
  "maxTokens": number (optional),
  "dataInjection": boolean (optional)
}
```

**Response:**
```json
{
  "reply": "string",
  "suggestions": ["string", ...],
  "citations": [
    {
      "title": "string",
      "sourceUrl": "string",
      "category": "string",
      "similarity": number,
      "contentPreview": "string"
    }
  ]
}
```

**Main Function Flow:**

1. Validates request method (POST)
2. Validates and sanitizes message
3. Detects prompt injection attempts
4. Checks response cache
5. Uses RAG to retrieve relevant documents:
   - Creates `ChatbotRAGRetriever` instance
   - Calls `retrieveRelevantDocuments()`
   - Gets top 5 documents
6. Builds enhanced system prompt with:
   - Base context (PETRONAS 2.0 goals)
   - Security notice (if injection detected)
   - Knowledge base context
   - Instructions
   - Example response format
   - User question
7. Calls LLM with `generateWithFallback()`
8. Parses response for suggestions
9. Caches response
10. Returns response with citations

**Dependencies:**
- `chatbotRAGRetriever.js` - RAG retrieval
- `aiHelper.js` - LLM generation
- `promptSecurity.js` - Input sanitization

---

#### `systemicshiftsver2/functions/chatbotRAGRetriever.js`

**Class:** `ChatbotRAGRetriever`

**Purpose:** Retrieves relevant knowledge base documents using semantic search

**Methods:**

1. **`retrieveRelevantDocuments(query, keys, topK, categories, options)`**
   - Main RAG retrieval method
   - Parameters:
     - `query` - User's question/query string
     - `keys` - API keys object `{ openai?, openrouter? }`
     - `topK` - Number of documents to retrieve (default: 3)
     - `categories` - Optional category filter array
     - `options` - Configuration object:
       - `minSimilarity` - Minimum similarity threshold
       - `queryType` - Query type ('chat', 'general', etc.)
       - `useCache` - Whether to use cache (default: true)
   - Flow:
     1. Checks cache for query
     2. Generates query embedding
     3. Queries Firestore `knowledgeBase` collection
     4. Filters by categories if provided
     5. Generates missing embeddings if needed
     6. Calculates cosine similarity for each document
     7. Filters by similarity threshold
     8. Sorts by similarity (descending)
     9. Returns top K documents
     10. Caches results
   - Returns: `Promise<Array>` - Array of document objects with similarity scores

2. **`buildContextString(documents, options)`**
   - Builds context string from retrieved documents
   - Parameters:
     - `documents` - Array of retrieved documents
     - `options` - `{ maxTokens }` (default: 750)
   - Formats: Documents with headers, similarity scores, sources
   - Truncates: Content to fit token limit
   - Returns: Formatted context string

3. **`generateAllEmbeddings(keys, batchSize, forceRegenerate)`**
   - Batch generates embeddings for all knowledge base documents
   - Parameters:
     - `keys` - API keys object
     - `batchSize` - Documents per batch (default: 10)
     - `forceRegenerate` - Force regeneration even if exists
   - Returns: Number of documents processed

4. **`_buildCacheKey(query, categories, queryType)`**
   - Builds cache key from query parameters
   - Uses: SHA1 hash
   - Returns: Cache key string

5. **`_getCachedDocuments(cacheKey)`**
   - Retrieves cached documents from Firestore
   - Checks: Expiration time
   - Returns: Cached documents array or null

6. **`_setCachedDocuments(cacheKey, documents)`**
   - Caches documents in Firestore
   - TTL: 30 minutes
   - Collection: `ragQueryCache`

7. **`_populateMissingEmbeddings(docWrappers, keys)`**
   - Generates embeddings for documents missing them
   - Processes: In chunks of 3
   - Updates: Firestore documents with embeddings

**Constants:**
- `DEFAULT_SIMILARITY_THRESHOLDS` - Object with thresholds per query type
- `CACHE_COLLECTION` - `'ragQueryCache'`
- `CACHE_TTL_MINUTES` - `30`

**Helper Functions:**
- `getAdaptiveSimilarityThreshold()` - Calculates adaptive threshold based on query length

---

#### `systemicshiftsver2/functions/aiHelper.js`

**Function:** `generateWithFallback(prompt, keys, outputJson)`

**Purpose:** Generates text using LLM with fallback between providers

**Parameters:**
- `prompt` - Prompt string
- `keys` - API keys object `{ gemini?, openrouter? }`
- `outputJson` - Whether to expect JSON output (default: false)

**Flow:**
1. Tries Gemini API first
2. Falls back to OpenRouter if Gemini fails
3. Handles JSON mode if requested
4. Returns generated text

**Returns:** `Promise<string>` - Generated text

---

#### `systemicshiftsver2/functions/promptSecurity.js`

**Purpose:** Input sanitization and security

**Functions:**

1. **`sanitizePromptInput(input, maxLength)`**
   - Sanitizes user input
   - Parameters:
     - `input` - Input string
     - `maxLength` - Maximum length (default: 2000)
   - Removes: Control characters, excessive whitespace
   - Truncates: To max length
   - Returns: Sanitized string

2. **`detectPromptInjection(input)`**
   - Detects potential prompt injection attempts
   - Parameters: `input` - Input string
   - Checks: Common injection patterns
   - Returns: Array of detected signals

3. **`buildSecurityNotice(signals)`**
   - Builds security notice for system prompt
   - Parameters: `signals` - Array of injection signals
   - Returns: Security notice string or null

---

## Shared Utilities

### `systemicshiftsver2/src/lib/firebase.js`

**Exports:**
- `db` - Firestore instance
- Other Firebase services

**Usage:** Imported by components for Firestore operations

---

## Firestore Collections

### `knowledgeBase`
**Purpose:** Stores knowledge base documents

**Document Structure:**
```javascript
{
  title: string,
  content: string,
  category: string,
  tags: string[],
  source: string,
  sourceUrl: string,
  embedding: number[],
  embeddingStatus: 'pending' | 'ready' | 'error',
  embeddingModel: string,
  embeddingGeneratedAt: Timestamp,
  titleLower: string, // Lowercase for duplicate checking
  contentQuality: {
    score: number,
    details: {
      lengthScore: number,
      structureScore: number,
      dataScore: number
    }
  },
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### `chatSessions`
**Purpose:** Stores chat session history

**Document Structure:**
```javascript
{
  messages: Array<{
    role: 'user' | 'ai' | 'error',
    content: string,
    timestamp: Date,
    citations?: Array<{
      title: string,
      sourceUrl: string,
      category: string,
      similarity: number
    }>
  }>,
  title: string,
  createdAt: Timestamp,
  lastActivity: Timestamp
}
```

### `ragQueryCache`
**Purpose:** Caches RAG query results

**Document Structure:**
```javascript
{
  documents: Array<DocumentObject>,
  expiresAt: Timestamp,
  cachedAt: Timestamp
}
```

---

## Function Call Flows

### Knowledge Base Injection Flow

```
User Action (KnowledgeBaseInjector.js)
  ↓
handleSubmit() or handleUploadAndAddDirectly()
  ↓
POST Request to Cloud Function
  ├─→ injectKnowledgeBase.js: exports.injectKnowledgeBase()
  │     ├─→ sanitizeContent()
  │     ├─→ isValidUrl()
  │     ├─→ inferCategory()
  │     ├─→ scoreContentQuality()
  │     ├─→ generateDocumentEmbedding()
  │     │     └─→ embeddingsHelper.js: generateEmbedding()
  │     │           ├─→ generateOpenAIEmbedding() OR
  │     │           └─→ generateOpenRouterEmbedding()
  │     └─→ Save to Firestore 'knowledgeBase' collection
  │
  └─→ uploadKnowledgeBase.js: exports.uploadKnowledgeBase()
        ├─→ extractTextFromFile()
        │     ├─→ pdf-parse (for PDF)
        │     ├─→ mammoth (for DOCX)
        │     └─→ fs.readFileSync (for TXT)
        ├─→ Upload to Firebase Storage
        └─→ If addDirectly: Save to Firestore 'knowledgeBase'
```

### Chatbot Flow

```
User Types Message (vera/page.js)
  ↓
handleChatSubmit(messageText)
  ↓
POST Request to askChatbot Cloud Function
  ↓
functions/index.js: exports.askChatbot()
  ├─→ promptSecurity.js: sanitizePromptInput()
  ├─→ promptSecurity.js: detectPromptInjection()
  ├─→ Check response cache
  ├─→ chatbotRAGRetriever.js: retrieveRelevantDocuments()
  │     ├─→ Check query cache
  │     ├─→ embeddingsHelper.js: generateEmbedding() (for query)
  │     ├─→ Query Firestore 'knowledgeBase' collection
  │     ├─→ For each document:
  │     │     ├─→ embeddingsHelper.js: cosineSimilarity()
  │     │     └─→ Calculate similarity score
  │     ├─→ Filter by similarity threshold
  │     ├─→ Sort by similarity (descending)
  │     ├─→ Return top K documents
  │     └─→ Cache results
  ├─→ chatbotRAGRetriever.js: buildContextString()
  ├─→ Build enhanced system prompt
  ├─→ aiHelper.js: generateWithFallback()
  │     ├─→ Try Gemini API
  │     └─→ Fallback to OpenRouter
  ├─→ Parse response for suggestions
  ├─→ Cache response
  └─→ Return response with citations
  ↓
handleStreamingResponse() or JSON response handling
  ↓
Update chatHistory state
  ↓
saveMessageToSession()
  ↓
Update Firestore 'chatSessions' collection
```

---

## API Endpoints

### Knowledge Base Injection

1. **`POST /injectKnowledgeBase`**
   - URL: `https://us-central1-systemicshiftv2.cloudfunctions.net/injectKnowledgeBase`
   - Purpose: Add single knowledge base entry manually
   - Body: JSON with title, content, category, tags, source, sourceUrl

2. **`POST /uploadKnowledgeBase`**
   - URL: `https://us-central1-systemicshiftv2.cloudfunctions.net/uploadKnowledgeBase`
   - Purpose: Upload file, extract text, optionally add to KB
   - Body: Multipart form data with file and metadata

### Chatbot

1. **`POST /askChatbot`**
   - URL: `https://askchatbot-el2jwxb5bq-uc.a.run.app`
   - Purpose: Chat with AI assistant using RAG
   - Body: JSON with message, agent, settings
   - Response: JSON with reply, suggestions, citations (or SSE stream)

---

## Dependencies

### NPM Packages

**Backend:**
- `firebase-admin` - Firebase Admin SDK
- `cors` - CORS middleware
- `busboy` - Multipart form parsing
- `pdf-parse` - PDF text extraction
- `mammoth` - DOCX text extraction
- `node-fetch` - HTTP requests

**Frontend:**
- `react` - React framework
- `framer-motion` - Animations
- `react-icons` - Icons
- `firebase` - Firebase client SDK

---

## Environment Variables / Secrets

### Required Secrets (Cloud Functions)

- `GOOGLE_GENAI_API_KEY` - Google Gemini API key
- `OPENROUTER_API_KEY` - OpenRouter API key
- `OPENAI_API_KEY` - OpenAI API key (optional, for embeddings)

---

## Notes

- Embeddings are generated using `text-embedding-3-small` model
- Similarity threshold for chat queries: ~0.28 (adaptive based on query length)
- RAG cache TTL: 30 minutes
- Maximum content length: 20,000 characters
- Maximum title length: 200 characters
- Supported file types: PDF, DOCX, DOC, TXT
- Chat sessions are automatically saved to Firestore
- Streaming responses use Server-Sent Events (SSE) format

---

## Summary

This system implements a complete RAG (Retrieval-Augmented Generation) chatbot with knowledge base management:

1. **Knowledge Base Injection**: Users can add content via form or file upload, which is processed, embedded, and stored in Firestore.

2. **Chatbot**: Uses semantic search to retrieve relevant documents, builds context, and generates responses using LLMs with citations.

3. **Key Technologies**: 
   - Vector embeddings for semantic search
   - Cosine similarity for document ranking
   - RAG for context-aware responses
   - Firestore for data storage
   - Cloud Functions for backend processing

The architecture separates concerns cleanly: frontend handles UI/UX, backend handles processing, and shared utilities provide common functionality.

---

## File Structure Summary

### Frontend Files (14 files)
- `src/app/vera/page.js` - Main chatbot page
- `src/components/KnowledgeBaseInjector.js` - KB injection modal
- `src/components/vera/*.js` - 12 Vera-specific components
- `src/components/chat/ChatHistorySidebar.js` - Chat history

### Backend Files (7 files)
- `functions/injectKnowledgeBase.js` - KB injection handler
- `functions/uploadKnowledgeBase.js` - File upload handler
- `functions/chatbotRAGRetriever.js` - RAG retrieval class
- `functions/embeddingsHelper.js` - Embedding utilities
- `functions/aiHelper.js` - LLM generation
- `functions/promptSecurity.js` - Input sanitization
- `functions/index.js` - Cloud Function registration

### Shared Files (1 file)
- `src/lib/firebase.js` - Firebase initialization

**Total: 22 files involved in these features**

