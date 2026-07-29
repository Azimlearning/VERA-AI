# VERA AI - Complete Platform Documentation

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Dependencies](#dependencies)
4. [File Structure](#file-structure)
5. [Component Documentation](#component-documentation)
6. [Library Functions](#library-functions)
7. [API Endpoints](#api-endpoints)
8. [Data Flow](#data-flow)
9. [User Flows](#user-flows)
10. [Firestore Collections](#firestore-collections)
11. [Local Services](#local-services)
12. [Usage Guide](#usage-guide)
13. [Troubleshooting](#troubleshooting)
14. [Future Enhancements](#future-enhancements)

---

## Overview

VERA AI is an enterprise-grade intelligent AI assistant platform designed specifically for PETRONAS Upstream operations, initiatives, and employee support. With deep knowledge about PETRONAS 2.0 strategic initiatives and Systemic Shifts frameworks as supporting context, VERA helps accelerate workflows across the organization through advanced AI automation and intelligent knowledge management.

VERA leverages state-of-the-art **Retrieval-Augmented Generation (RAG)** technology combined with **vector embeddings** and a comprehensive **knowledge base** to provide accurate, citation-backed responses. The platform utilizes **3,072-dimensional vector embeddings** (OpenAI text-embedding-3-large) stored in a Firestore-based vector database, enabling semantic search through **cosine similarity** algorithms. This ensures access to the latest, verified information about PETRONAS Upstream operations and strategic initiatives, with every response grounded in actual source documents and transparent citations.

### Key Features

- **VERA AI Chatbot**: Core RAG-powered AI assistant with citation-backed answers from knowledge base
- **Six Specialized AI Agents**: 
  - **Analytics Agent**: Data insights and analytics automation
  - **Meetings Agent**: Meeting organization, action item extraction, and insights
  - **Podcast Agent**: AI-powered podcast generation from knowledge base content
  - **Content Agent**: Story drafting and content creation assistance
  - **Visual Agent**: Image analysis and generation capabilities
  - **Quiz Agent**: Knowledge testing and assessment generation
- **StatsX Analytics Dashboard**: Real-time analytics with predictive forecasting and anomaly detection
- **Real-Time Analytics**: StatsX dashboard with predictive insights and anomaly detection
- **Knowledge Base Management**: Document injection and RAG search capabilities
- **Local Image Generation**: GPU-accelerated local image generation service

---

## Architecture

### Technology Stack

**Frontend:**
- **Next.js 14+** (App Router) - React framework with server-side rendering
- **React 19** - UI library
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion 12.23.24** - Animation library
- **Recharts 2.12.7** - Chart library for data visualization
- **date-fns 3.6.0** - Date manipulation utilities
- **react-icons 5.5.0** - Icon library

**Backend:**
- **Firebase Cloud Functions (Node.js)** - Serverless backend functions
- **Firebase Cloud Functions (Python)** - Python-based serverless functions
- **Firestore** - NoSQL database
- **Firebase Storage** - File storage
- **Firebase Authentication** - User authentication

**AI Services & Technologies:**
- **RAG (Retrieval-Augmented Generation)** - Core architecture for knowledge retrieval with citation-backed responses
- **Vector Embeddings** - OpenAI text-embedding-3-large (3,072-dimensional vectors) for semantic understanding
- **Vector Database** - Firestore-based knowledge base with cosine similarity search
- **Google Gemini API** - Primary LLM for text generation and reasoning
- **OpenRouter API** - Alternative LLM provider and embeddings service
- **Gemini Vision API** - Computer vision for image analysis and tagging
- **Stable Diffusion** - Local image generation using PyTorch and Hugging Face Diffusers
- **Text-to-Speech (TTS)** - Multi-speaker TTS engines for podcast generation
- **Predictive Analytics** - Prophet algorithm for forecasting and anomaly detection

**Local Services:**
- **Local Image Generator** (`python/local_image_generator.py`) - GPU-accelerated image generation

### Architecture Pattern

The application follows a **serverless architecture** with:

- **Client-side rendering** for most pages (Next.js App Router)
- **Server-side data fetching** for initial page loads
- **Real-time updates** via Firestore listeners (`onSnapshot`)
- **Cloud Functions** for backend processing and AI operations
- **Local services** for resource-intensive tasks (image generation)

### Data Sources

1. **Firestore Collections**:
   - `meetings` - Meeting records with AI insights
   - `knowledgeBase` - Documents for RAG search
   - `chatSessions` - VERA AI chat session history
   - `analytics` - Page views and user interactions
   - `statsSnapshots` - Aggregated analytics data for StatsX

2. **Real-time Tracking**:
   - Page view events
   - User interactions
   - Click events
   - Chat session data
   - Agent usage metrics

---

## Dependencies

### Core Dependencies

```json
{
  "next": "^14.0.0",
  "react": "^19.0.0",
  "react-dom": "^19.0.0",
  "firebase": "^10.0.0",
  "framer-motion": "^12.23.24",
  "recharts": "^2.12.7",
  "date-fns": "^3.6.0",
  "react-icons": "^5.5.0"
}
```

### Installation

```bash
npm install
```

### Python Dependencies (Local Image Generator)

```txt
torch
diffusers
transformers
firebase-admin
google-cloud-storage
pillow
```

---

## File Structure

```
systemicshiftsver2/
├── src/
│   ├── app/                          # Next.js App Router pages
│   │   ├── page.js                   # Homepage
│   │   ├── vera/
│   │   │   └── page.js               # VERA AI chatbot
│   │   ├── agents/
│   │   │   ├── page.js               # AI Agents overview
│   │   │   ├── analytics/
│   │   │   │   └── page.js           # Analytics Agent
│   │   │   ├── content/
│   │   │   │   └── page.js           # Content Agent
│   │   │   ├── meetings/
│   │   │   │   └── page.js           # Meetings Agent
│   │   │   ├── podcast/
│   │   │   │   └── page.js           # Podcast Agent
│   │   │   ├── quiz/
│   │   │   │   └── page.js           # Quiz Agent
│   │   │   └── visual/
│   │   │       └── page.js           # Visual Agent
│   │   ├── statsx/
│   │   │   └── page.js               # StatsX analytics dashboard
│   │   ├── meetx/
│   │   │   └── page.js               # MeetX meeting organizer
│   │   └── api/
│   │       ├── analyzeData/
│   │       │   └── route.js          # Data analysis API
│   │       ├── analyzeImage/
│   │       │   └── route.js          # Image analysis API
│   │       ├── analyzeMeeting/
│   │       │   └── route.js          # Meeting analysis API
│   │       └── saveMeetingToKB/
│   │           └── route.js          # Save meeting to knowledge base
│   ├── components/                   # React components
│   │   ├── Header.js                 # Main navigation header
│   │   ├── Footer.js                 # Site footer
│   │   ├── AIPoweredFeatures.js      # Homepage AI features showcase
│   │   ├── KnowledgeBaseInjector.js  # Knowledge base injection UI
│   │   ├── ChatInterface.js          # Chat interface component
│   │   ├── MiniChatWidget.js         # Mini chat widget
│   │   ├── vera/                     # VERA AI components
│   │   │   ├── AgentSelector.js      # Agent selection component
│   │   │   ├── ChatInput.js          # Chat input component
│   │   │   ├── MarkdownMessage.js    # Message display component
│   │   │   └── [other VERA components]
│   │   ├── agents/                   # AI Agent components
│   │   │   ├── analytics/            # Analytics Agent components
│   │   │   ├── content/              # Content Agent components
│   │   │   ├── meetings/            # Meetings Agent components
│   │   │   ├── podcast/              # Podcast Agent components
│   │   │   ├── quiz/                 # Quiz Agent components
│   │   │   └── visual/               # Visual Agent components
│   │   ├── StatsX/                   # StatsX dashboard components
│   │   │   ├── StatsDashboard.js     # Main dashboard container
│   │   │   ├── MetricCard.js         # Metric display card
│   │   │   ├── PulseWidget.js        # Health metrics widget
│   │   │   ├── TrendChart.js         # Trend visualization
│   │   │   ├── CohortHeatmap.js      # Activity heatmap
│   │   │   ├── AnomalyDetector.js    # Anomaly detection widget
│   │   │   ├── AIInsightsTicker.js   # AI insights ticker
│   │   │   ├── StoryAnalytics.js     # Story analytics widget
│   │   │   ├── MeetingAnalytics.js   # Meeting analytics widget
│   │   │   ├── EngagementAnalytics.js # Engagement analytics
│   │   │   ├── KnowledgeBaseAnalytics.js # Knowledge base stats
│   │   │   ├── AgentUsageAnalytics.js  # Agent usage analytics widget
│   │   │   └── DataGenerator.js      # Fake data generator UI
│   │   └── MeetX/                    # MeetX components
│   │       ├── MeetingList.js        # Meeting list display
│   │       ├── MeetingEditor.js       # Meeting editor
│   │       └── FileUploader.js       # File upload component
│   └── lib/                          # Utility libraries
│       ├── firebase.js                # Firebase configuration
│       ├── analytics.js               # Analytics tracking system
│       ├── statsData.js               # Data aggregation utilities
│       ├── forecasting.js             # Predictive forecasting
│       ├── anomalyDetection.js        # Anomaly detection algorithms
│       ├── generateFakeData.js        # Fake data generation
│       ├── dataScenarios.js           # Data scenario management
│       └── quizData.js                # Quiz data utilities
├── functions/                        # Node.js Cloud Functions
│   ├── index.js                      # Main functions file
│   ├── aiHelper.js                   # AI helper functions
│   ├── ai_models.js                  # AI model configurations
│   ├── chatbotRAGRetriever.js        # RAG retrieval system
│   ├── rag_writeup_retriever.js     # Writeup RAG retriever
│   ├── knowledgeBaseExtractor.js     # Knowledge base extraction
│   ├── generateEmbeddings.js         # Embedding generation
│   ├── embeddingsHelper.js           # Embedding utilities
│   └── generate_image_hf.js          # Image generation (legacy)
├── functions-python/                 # Python Cloud Functions
│   ├── main.py                       # Main Python functions
│   └── requirements.txt              # Python dependencies
├── python/                           # Local Python services
│   ├── local_image_generator.py      # Local image generator service
│   ├── rag_image_retriever.py        # RAG image style retriever
│   ├── requirements.txt              # Python dependencies
│   └── run_local_generator.ps1       # PowerShell script to run generator
└── public/                           # Static assets
    └── StatsXNotes/                  # StatsX documentation
        └── STATSX_IMPLEMENTATION.md  # Detailed StatsX docs
```

## Component Documentation

### Core Components

#### 1. Header Component (`src/components/Header.js`)

**Purpose**: Main navigation bar with dropdown menus and responsive mobile support.

**Features**:
- **Dropdown Navigation**: Microsoft/Apple-style dropdown menus for Systemic Shifts, ULearn, and NexusHub
- **Second-Level Navigation**: Appears when in specific sections (Systemic Shifts, ULearn, NexusHub)
- **Responsive Design**: Mobile hamburger menu for small screens
- **Active State Highlighting**: Highlights current page in navigation
- **Click-Outside Detection**: Closes dropdowns when clicking outside

**Props**: None (uses `usePathname` hook internally)

**State Management**:
- `isSystemicShiftsOpen`: Boolean - Controls Systemic Shifts dropdown
- `isUlearnOpen`: Boolean - Controls ULearn dropdown
- `isNexusHubOpen`: Boolean - Controls NexusHub dropdown
- `isMobileMenuOpen`: Boolean - Controls mobile menu visibility

**Navigation Structure**:
```javascript
const navItems = [
  { name: 'Home', href: '/#home', type: 'link' },
  { name: 'PETRONAS 2.0', href: '/petronas-2.0', type: 'link' },
  { 
    name: 'Systemic Shifts', 
    type: 'dropdown',
    subItems: [
      { name: 'Upstream Target', href: '/systemic-shifts/upstream-target' },
      { name: 'Key Shifts', href: '/systemic-shifts/key-shifts' },
      { name: 'Mindset & Behaviour', href: '/systemic-shifts/mindset-behaviour' },
      { name: 'Our Progress', href: '/systemic-shifts/our-progress' },
    ]
  },
  // ... more items
];
```

**Technical Details**:
- Uses `useRef` for dropdown references
- `useEffect` for click-outside detection
- `usePathname` from Next.js for active state detection
- Framer Motion for smooth dropdown animations

**Example Usage**:
```jsx
import Header from '@/components/Header';

export default function Layout({ children }) {
  return (
    <>
      <Header />
      {children}
    </>
  );
}
```

---

#### 2. Footer Component (`src/components/Footer.js`)

**Purpose**: Site footer with links, contact information, and social media.

**Features**:
- Quick links to main sections
- Contact information display
- Social media icon links
- Copyright information
- Responsive grid layout

**Props**: None

**Layout Structure**:
- Multi-column grid (responsive)
- Link sections organized by category
- Social media icons with hover effects

**Example Usage**:
```jsx
import Footer from '@/components/Footer';

export default function Layout({ children }) {
  return (
    <>
      {children}
      <Footer />
    </>
  );
}
```

---

#### 3. AIPoweredFeatures Component (`src/components/AIPoweredFeatures.js`)

**Purpose**: Homepage showcase of AI-powered features with orbital animation design.

**Features**:
- **Orbital Animation**: Circular gradient cards orbiting around center logo
- **Glass-morphism Background**: Modern glass effect styling
- **Connection Lines**: Visual lines connecting cards to center
- **Hover Effects**: Enhanced hover interactions
- **Gradient Cards**: Theme-matched gradient cards for each feature
- **Hydration-Safe**: Prevents React hydration errors with `mounted` state

**Props**: None

**State Management**:
- `rotation`: Number - Current rotation angle (0-360)
- `hoveredCard`: String | null - Currently hovered card ID
- `mounted`: Boolean - Client-side mount flag (prevents hydration errors)

**AI Features Displayed**:
```javascript
const AI_FEATURES = [
  {
    id: 'content',
    name: 'Content Agent',
    description: 'AI content & image generation',
    icon: FaFileAlt,
    href: '/agents/content',
    gradient: 'from-teal-400 to-cyan-500',
    color: '#14b8a6',
    angle: 0,
    radius: 180,
  },
  // ... 5 more features
];
```

**Technical Details**:
- **Orbital Calculation**: Cards positioned using `transform: rotate()` and `translateX()`
- **Animation**: Continuous rotation via `setInterval` (0.2° per 30ms)
- **Hydration Fix**: Uses `mounted` state to prevent server/client mismatch
- **Performance**: Conditional rotation only after mount to prevent hydration errors

**Animation Logic**:
```javascript
// Orbital rotation (only after mount)
useEffect(() => {
  if (!mounted) return;
  
  const rotationInterval = setInterval(() => {
    setRotation(prev => (prev + 0.2) % 360);
  }, 30);

  return () => clearInterval(rotationInterval);
}, [mounted]);
```

**Example Usage**:
```jsx
import AIPoweredFeatures from '@/components/AIPoweredFeatures';

export default function HomePage() {
  return (
    <div>
      <AIPoweredFeatures />
    </div>
  );
}
```

---

### VERA AI Components

#### 4. VERA Chat Interface (`src/app/vera/page.js`)

**Purpose**: Main VERA AI chatbot interface with RAG-powered knowledge retrieval.

**Key Features**:
- **RAG-Powered Chat**: Retrieval-Augmented Generation for citation-backed answers
- **Agent Selection**: Choose from 6 specialized AI agents
- **Streaming Responses**: Real-time streaming of AI responses
- **Chat History**: Persistent chat session management
- **Knowledge Base Integration**: Direct access to knowledge base injector
- **Message Actions**: Copy, regenerate, and view message details
- **Suggested Questions**: AI-generated follow-up questions

**State Management**:
- `chatHistory`: Array of conversation messages
- `selectedAgent`: Currently selected AI agent
- `currentSessionId`: Active chat session ID
- `isStreaming`: Boolean - Streaming response state
- `suggestions`: Array - Follow-up question suggestions

**Agent Support**:
- Analytics Agent: Data insights and analytics
- Meetings Agent: Meeting analysis and action items
- Podcast Agent: Podcast generation
- Content Agent: Content and image generation
- Visual Agent: Image analysis and tagging
- Quiz Agent: Quiz generation

---

### NexusGPT Components

#### 7. ChatInterface Component (`src/components/ChatInterface.js`)

**Purpose**: Reusable chat interface component for NexusGPT and other chatbot implementations.

**Props**:
- `chatFunctionUrl` (string, required): URL of the chatbot Cloud Function

**Features**:
- **Message History**: Maintains conversation history
- **Loading States**: Shows typing indicator while waiting for response
- **Suggestions**: Displays follow-up question suggestions
- **Citations**: Shows document citations for RAG responses
- **Auto-scroll**: Automatically scrolls to latest message
- **Clear Chat**: Button to reset conversation

**State Management**:
- `chatInput`: String - Current input text
- `chatHistory`: Array - Conversation messages
- `isChatLoading`: Boolean - Loading state
- `suggestions`: Array - Follow-up suggestions

**Message Structure**:
```javascript
{
  role: 'user' | 'ai',
  content: 'Message text',
  timestamp: Date,
  citations?: Array, // For AI messages with RAG
  suggestions?: Array // For AI messages
}
```

**Functions**:
- `handleChatSubmit()`: Sends message to Cloud Function
- `handleSuggestionClick()`: Uses suggestion as new message
- `handleClearChat()`: Resets conversation history

**Example Usage**:
```jsx
<ChatInterface 
  chatFunctionUrl="https://askchatbot-el2jwxb5bq-uc.a.run.app"
/>
```

---

### ULearn Components

#### 8. PodcastGenerator Component (`src/components/PodcastGenerator.js`)

**Purpose**: Generate AI-powered podcast scripts and audio from topics.

**Features**:
- **Topic Input**: Text input for podcast topic
- **Context Input**: Optional additional context
- **Progress Tracking**: Shows generation progress steps
- **Audio Playback**: Built-in audio player
- **Save to Firestore**: Save generated podcasts
- **Download**: Download audio file

**State Management**:
- `topic`: String - Podcast topic
- `context`: String - Additional context
- `generating`: Boolean - Generation in progress
- `progress`: String - Current progress message
- `podcast`: Object - Generated podcast data
- `playing`: Boolean - Audio playback state
- `audioUrl`: String - Audio file URL
- `saving`: Boolean - Save operation in progress

**Generation Flow**:
```
User enters topic
    ↓
Click "Generate Podcast"
    ↓
POST to generatePodcast Cloud Function
    ↓
Progress updates:
  - "Generating podcast outline..."
  - "Creating script..."
  - "Generating audio..."
    ↓
Response received with script and audioUrl
    ↓
Podcast state updated
    ↓
Audio player displayed
```

**Podcast Data Structure**:
```javascript
{
  script: 'Podcast script text...',
  audioUrl: 'https://storage.googleapis.com/...',
  topic: 'Topic name',
  context: 'Additional context',
  generatedAt: Timestamp
}
```

**Cloud Function Integration**:
- Endpoint: `https://generatepodcast-el2jwxb5bq-uc.a.run.app`
- Method: POST
- Request Body: `{ topic, context }`
- Response: `{ status, script, audioUrl }`

---

### MeetX Components

#### 9. MeetingEditor Component (`src/components/MeetX/MeetingEditor.js`)

**Purpose**: Create and edit meetings with AI-powered insights.

**Features**:
- **Meeting Form**: Title, date, notes input
- **File Upload**: Upload meeting files (PDF, DOCX, TXT)
- **AI Processing**: Extract text from files
- **AI Insights**: Generate summaries and action items
- **Real-time Preview**: See insights as they generate

**State Management**:
- `title`: String - Meeting title
- `content`: String - Meeting notes/content
- `fileUploading`: Boolean - File upload in progress
- `processing`: Boolean - AI processing in progress
- `insights`: Object - AI-generated insights

**AI Insights Structure**:
```javascript
{
  summary: 'Meeting summary...',
  actionItems: [
    { item: 'Action 1', assignee: 'Person', dueDate: '2025-01-15' }
  ],
  insights: 'Key insights...',
  alignmentWarnings: [],
  zombieTasks: []
}
```

---

### Upstream Gallery Components

#### 10. UpstreamGallery Component (`src/components/UpstreamGallery.js`)

**Purpose**: Image gallery with AI-powered categorization and tagging.

**Features**:
- **Category Filtering**: Filter images by category
- **Pagination**: Navigate through image pages
- **Image Upload**: Upload new images with metadata
- **AI Analysis**: Automatic tag and description generation
- **Search**: Search images by tags/description

**Categories**:
```javascript
['All', 'Stock Images', 'Events', 'Team Photos', 'Infographics', 'Operations', 'Facilities']
```

**State Management**:
- `images`: Array - Current page images
- `selectedCategory`: String - Active category filter
- `currentPage`: Number - Current page number
- `totalDocs`: Number - Total image count
- `showUploadForm`: Boolean - Upload form visibility
- `uploading`: Boolean - Upload in progress
- `analyzing`: Boolean - AI analysis in progress

**Upload Flow**:
```
User selects file
    ↓
Upload to Firebase Storage
    ↓
Create Firestore document
    ↓
Optional: AI analysis (analyzeImage Cloud Function)
    ↓
Tags and description added
    ↓
Image appears in gallery
```

**Pagination**:
- Uses Firestore pagination for efficient data loading
- 12 images per page
- Supports page jumping

---

### Knowledge Base Components

#### 11. KnowledgeBaseInjector Component (`src/components/KnowledgeBaseInjector.js`)

**Purpose**: Add documents to the knowledge base for RAG functionality.

**Features**:
- **Manual Entry**: Type or paste document content
- **File Upload**: Upload PDF or DOCX files
- **Auto-extraction**: Extract text from uploaded files
- **Category Selection**: Assign document category
- **Tag Management**: Add tags for better searchability
- **Embedding Generation**: Automatically generates embeddings

**Form Fields**:
- `title`: Document title
- `content`: Document content (textarea)
- `category`: Dropdown selection
- `tags`: Comma-separated tags
- `source`: Source identifier
- `sourceUrl`: Optional source URL

**Categories**:
```javascript
['systemic-shifts', 'mindset-behaviour', 'upstream-target', 
 'petronas-info', 'upstream', 'general']
```

**Cloud Functions Used**:
- `injectKnowledgeBase`: For manual entry
- `uploadKnowledgeBase`: For file uploads

**Data Flow**:
```
User enters/uploads document
    ↓
POST to Cloud Function
    ↓
Document saved to Firestore
    ↓
Embedding generated (if not exists)
    ↓
Document available for RAG search
```

---

### StatsX Components

**Note**: StatsX components are documented in detail in `public/StatsXNotes/STATSX_IMPLEMENTATION.md`. Key components include:

- **StatsDashboard**: Main dashboard container
- **MetricCard**: Reusable metric display card
- **TrendChart**: Trend visualization with forecasting
- **AnomalyDetector**: Statistical anomaly detection
- **AgentUsageAnalytics**: Agent usage analytics widget
- **DataGenerator**: Fake data generation tool

See `STATSX_IMPLEMENTATION.md` for complete documentation.

### StatsX Components

#### StatsDashboard (`src/components/StatsX/StatsDashboard.js`)
- Main dashboard container
- Metric cards
- Widget grid layout
- Cross-filtering support

#### TrendChart (`src/components/StatsX/TrendChart.js`)
- Interactive trend visualization
- Multiple metric support
- Date range filtering
- Forecasting capabilities

#### AnomalyDetector (`src/components/StatsX/AnomalyDetector.js`)
- Statistical anomaly detection
- Alert generation
- Pattern recognition

## API Endpoints

### Cloud Functions (Node.js)

Base URL: `https://us-central1-systemicshiftv2.cloudfunctions.net`  
Alternative Base URL (v2): `https://[function-name]-el2jwxb5bq-uc.a.run.app`

#### Active Functions (Frontend-Used)

##### 1. askChatbot

**Endpoint:** `POST /askChatbot` or `https://askchatbot-el2jwxb5bq-uc.a.run.app`

**Status:** ✅ Active - Used by frontend

**Used in:** 
- `src/app/vera/page.js`
- `src/components/MiniChatWidget.js`

**Description:** VERA AI chatbot with RAG (Retrieval-Augmented Generation) retrieval from knowledge base

**Secrets:** 
- `GOOGLE_GENAI_API_KEY`
- `OPENROUTER_API_KEY`

**Timeout:** 120 seconds

**Memory:** 512MiB

**Request Body:**
```json
{
  "message": "What is Portfolio High-Grading?"
}
```

**Response:**
```json
{
  "reply": "Portfolio High-Grading is a strategic approach...",
  "suggestions": [
    "Tell me more about Portfolio High-Grading",
    "What are the key benefits?"
  ],
  "citations": [
    {
      "title": "Portfolio High-Grading Strategy",
      "sourceUrl": "https://...",
      "category": "systemic-shifts",
      "similarity": 0.85
    }
  ]
}
```

**How It Works**:
1. Receives user message
2. Generates query embedding using OpenRouter
3. Searches knowledge base using cosine similarity
4. Retrieves top 5 most relevant documents
5. Builds context string from documents
6. Enhances system prompt with context
7. Calls Gemini/OpenRouter LLM
8. Returns answer with citations

**Error Handling**:
- Returns error message if RAG retrieval fails
- Falls back to general knowledge if no documents found
- Handles API rate limits gracefully

##### 2. analyzeData
**Endpoint:** `POST /api/analyzeData` (local Next.js API route)

**Status:** ✅ Active - Used by Analytics Agent

**Used in:** `src/app/agents/analytics/page.js`

**Description:** Analyzes uploaded data files (CSV, Excel) and generates insights

**Request:** Multipart form data with data file

**Response:**
```json
{
  "success": true,
  "insights": "Data analysis insights...",
  "summary": "Summary of findings..."
}
```

##### 3. analyzeImage
**Endpoint:** `POST /api/analyzeImage` (local Next.js API route)

**Status:** ✅ Active - Used by Visual Agent

**Used in:** `src/app/agents/visual/page.js`

**Description:** Analyzes uploaded images and generates tags, descriptions, and metadata

**Request:** Multipart form data with image file

**Response:**
```json
{
  "success": true,
  "tags": ["tag1", "tag2"],
  "description": "Image description...",
  "metadata": {}
}
```

##### 4. analyzeMeeting
**Endpoint:** `POST /api/analyzeMeeting` (local Next.js API route)

**Status:** ✅ Active - Used by Meetings Agent

**Used in:** `src/app/agents/meetings/page.js`

**Description:** Analyzes meeting files and extracts insights, action items, and summaries

**Request:** Multipart form data with meeting file

**Response:**
```json
{
  "success": true,
  "summary": "Meeting summary...",
  "actionItems": [],
  "insights": "Key insights..."
}
```

##### 3. generateImageHf (Legacy - Replaced by Local Generator)
**Endpoint:** `POST /generateImageHf` or `https://generateimagehf-el2jwxb5bq-uc.a.run.app`  
**Status:** ⚠️ DEPRECATED - Replaced by local image generator  
**Note:** Image generation is now handled locally by `python/local_image_generator.py`

##### 3a. Local Image Generator Service
**Location:** `python/local_image_generator.py`  
**Status:** ✅ Active - Primary image generation method  
**Description:** Local service that monitors Firestore and generates images using local GPU  
**How It Works:**
1. Monitors Firestore `stories` collection every 30 seconds
2. Detects stories with `aiInfographicConcept` but no `aiGeneratedImageUrl` (or `aiGeneratedImageUrl === "Pending local generation"`)
3. Generates image locally using Hugging Face diffusers (GPU-accelerated)
4. Uploads generated image to Firebase Storage
5. Updates Firestore document with `aiGeneratedImageUrl` and `imageGeneratedLocally: true`

**Setup Requirements:**
- Python 3.9+
- PyTorch with CUDA (for GPU) or CPU version
- Firebase service account key (`firebase-key.json`)
- Hugging Face API token (`HF_API_TOKEN` environment variable)

**Running:**
```powershell
cd python
.\run_local_generator.ps1
```

**Benefits:**
- Uses local GPU (much faster than Cloud Functions)
- No 5GB model download in Cloud Functions
- Works offline once model is downloaded
- Full control over generation parameters

##### 4. triggerImageGeneration
**Endpoint:** `POST /triggerImageGeneration` or `https://triggerimagegeneration-el2jwxb5bq-uc.a.run.app`  
**Status:** ✅ Active - Used by frontend  
**Used in:** Visual Agent (`src/app/agents/visual/page.js`)  
**Description:** Manually trigger image generation for an existing story document  
**Secrets:** `GOOGLE_GENAI_API_KEY`, `OPENROUTER_API_KEY`, `HF_API_TOKEN`  
**Timeout:** 600 seconds (10 minutes)  
**Memory:** 1GiB  
**Request Body:**
```json
{
  "storyId": "story-id"
}
```
**Response:**
```json
{
  "status": "ok",
  "message": "Image generation triggered."
}
```
**Side Effects:** Calls `generateImageHf` internally, updates Firestore document

##### 5. generatePodcast
**Endpoint:** `POST /generatePodcast` or `https://generatepodcast-el2jwxb5bq-uc.a.run.app`  
**Status:** ✅ Active - Used by frontend  
**Used in:** `src/components/PodcastGenerator.js`  
**Description:** Generate AI podcast script and audio from a topic using RAG  
**Secrets:** `GOOGLE_GENAI_API_KEY`, `OPENROUTER_API_KEY`  
**Timeout:** 300 seconds  
**Memory:** 1GiB  
**Request Body:**
```json
{
  "topic": "Topic name",
  "context": "Additional context (optional)"
}
```
**Response:**
```json
{
  "status": "ok",
  "script": "Podcast script text...",
  "audioUrl": "https://storage.googleapis.com/..."
}
```

##### 6. analyzeImage
**Endpoint:** `POST /analyzeImage` or `https://analyzeimage-el2jwxb5bq-uc.a.run.app`  
**Status:** ✅ Active - Used by frontend  
**Used in:** `src/components/UpstreamGallery.js`  
**Description:** Analyze uploaded image with AI to generate tags and descriptions  
**Secrets:** `GOOGLE_GENAI_API_KEY`, `OPENROUTER_API_KEY`  
**Timeout:** 120 seconds  
**Memory:** 512MiB  
**Request Body:**
```json
{
  "imageUrl": "https://storage.googleapis.com/..."
}
```
**Response:**
```json
{
  "status": "ok",
  "tags": ["tag1", "tag2"],
  "description": "Image description..."
}
```

##### 7. injectKnowledgeBase
**Endpoint:** `POST /injectKnowledgeBase` or `https://injectknowledgebase-el2jwxb5bq-uc.a.run.app`  
**Status:** ✅ Active - Used by frontend  
**Used in:** `src/components/KnowledgeBaseInjector.js`  
**Description:** Add a single document to the knowledge base collection  
**Secrets:** `GOOGLE_GENAI_API_KEY`, `OPENROUTER_API_KEY`  
**Timeout:** 60 seconds  
**Memory:** 512MiB  
**Request Body:**
```json
{
  "title": "Document Title",
  "content": "Document content...",
  "category": "systemic-shifts",
  "source": "manual",
  "sourceUrl": "https://...",
  "tags": ["tag1", "tag2"]
}
```
**Response:**
```json
{
  "success": true,
  "message": "Document added successfully",
  "docId": "document-id"
}
```

##### 8. uploadKnowledgeBase
**Endpoint:** `POST /uploadKnowledgeBase` or `https://uploadknowledgebase-el2jwxb5bq-uc.a.run.app`  
**Status:** ✅ Active - Used by frontend  
**Used in:** `src/components/KnowledgeBaseInjector.js`  
**Description:** Upload a document (PDF, DOCX) to Cloud Storage and extract text to inject into knowledge base  
**Secrets:** `GOOGLE_GENAI_API_KEY`, `OPENROUTER_API_KEY`  
**Timeout:** 300 seconds  
**Memory:** 1GiB  
**Request:** Multipart form data (file + metadata)  
**Response:**
```json
{
  "success": true,
  "message": "Document uploaded and processed",
  "docId": "document-id"
}
```

##### 9. processMeetingFile
**Endpoint:** `POST /processMeetingFile` or `https://processmeetingfile-el2jwxb5bq-uc.a.run.app`  
**Status:** ✅ Active - Used by frontend  
**Used in:** `src/components/MeetX/MeetingEditor.js`  
**Description:** Process uploaded meeting files (PDF, DOCX, TXT) and extract text content  
**Secrets:** `GOOGLE_GENAI_API_KEY`, `OPENROUTER_API_KEY`  
**Timeout:** 300 seconds  
**Memory:** 1GiB  
**Request Body:**
```json
{
  "fileUrl": "https://storage.googleapis.com/...",
  "fileName": "meeting-notes.pdf",
  "fileType": "application/pdf"
}
```
**Response:**
```json
{
  "success": true,
  "extractedText": "Meeting content...",
  "wordCount": 500
}
```

##### 10. generateMeetingInsights
**Endpoint:** `POST /generateMeetingInsights` or `https://generatemeetinginsights-el2jwxb5bq-uc.a.run.app`  
**Status:** ✅ Active - Used by frontend  
**Used in:** `src/components/MeetX/MeetingEditor.js`  
**Description:** Generate AI insights, summaries, and action items from meeting content  
**Secrets:** `GOOGLE_GENAI_API_KEY`, `OPENROUTER_API_KEY`  
**Timeout:** 540 seconds (9 minutes)  
**Memory:** 1GiB  
**Request Body:**
```json
{
  "meetingId": "meeting-id",
  "content": "Meeting content...",
  "title": "Meeting Title"
}
```
**Response:**
```json
{
  "success": true,
  "summary": "Meeting summary...",
  "actionItems": ["Action 1", "Action 2"],
  "insights": "Key insights..."
}
```

#### Admin Functions (Manual Use Only)

##### 11. populateKnowledgeBase
**Endpoint:** `GET /populateKnowledgeBase` or `https://populateknowledgebase-el2jwxb5bq-uc.a.run.app`  
**Status:** ⚠️ Admin Function - Manual use only  
**Description:** Populate the knowledge base collection with predefined content from website components  
**Secrets:** `GOOGLE_GENAI_API_KEY`, `OPENROUTER_API_KEY`  
**Timeout:** 300 seconds  
**Memory:** 1GiB  
**Usage:** Called manually via HTTP GET request or Firebase Console (typically during initial setup)  
**Response:**
```json
{
  "success": true,
  "message": "Successfully populated knowledge base with X documents",
  "count": 50
}
```
**Note:** Run this before `generateEmbeddings` to populate initial content

##### 12. generateEmbeddings
**Endpoint:** `GET /generateEmbeddings` or `https://generateembeddings-el2jwxb5bq-uc.a.run.app`  
**Status:** ⚠️ Admin Function - Manual use only  
**Description:** Generate vector embeddings for all documents in the knowledge base collection (required for RAG functionality)  
**Secrets:** `GOOGLE_GENAI_API_KEY`, `OPENROUTER_API_KEY`  
**Timeout:** 540 seconds (9 minutes)  
**Memory:** 1GiB  
**Usage:** Called manually after populating knowledge base or when new documents are added  
**Response:**
```json
{
  "success": true,
  "message": "Generated embeddings for X documents",
  "processed": 50
}
```
**Note:** Must be run after `populateKnowledgeBase` or when adding new documents to enable RAG search

### Cloud Functions (Python)

Located in `functions-python/` directory, deployed separately.

##### generateImageHfPython
**Endpoint:** `POST /generateImageHfPython` or `https://generateimagehfpython-el2jwxb5bq-uc.a.run.app`  
**Status:** ✅ Active - Used internally  
**Used in:** Called internally by `analyzeStorySubmission` as fallback/alternative to Node.js version  
**Description:** Python-based image generation using Hugging Face (diffusers library)  
**Secrets:** `HF_API_TOKEN`  
**Timeout:** 540 seconds (9 minutes)  
**Memory:** 1GiB  
**Request Body:** Same as Node.js `generateImageHf`  
**Response:** Same as Node.js `generateImageHf`  
**Note:** Used as alternative/fallback to the Node.js implementation

##### analyzeImagePython
**Endpoint:** `POST /analyzeImagePython`  
**Status:** ⚠️ Defined but usage unclear  
**Description:** Python-based image analysis (alternative to Node.js `analyzeImage`)  
**Note:** Check if this is actively used or can be removed

### Firestore Triggers


## Data Flow

### VERA AI Chat Flow

```
User asks question in VERA
    ↓
askChatbot function called
    ↓
Generate query embedding using OpenRouter
    ↓
Search knowledge base using cosine similarity
    ↓
Retrieve top 5 most relevant documents
    ↓
Build context string from documents
    ↓
Enhance system prompt with context (and agent context if agent selected)
    ↓
Call LLM (Gemini/OpenRouter) with enhanced prompt
    ↓
Stream response back to user
    ↓
Extract citations from retrieved documents
    ↓
Return answer with citations and suggestions
    ↓
Save message to chat session in Firestore
    ↓
Display in UI with citation links
```

### RAG Query Flow

```
User asks question in NexusGPT
    ↓
askChatbot function called
    ↓
Generate query embedding using OpenRouter
    ↓
Search knowledge base using cosine similarity
    ↓
Retrieve top 5 most relevant documents
    ↓
Build context string from documents
    ↓
Enhance system prompt with context
    ↓
Call LLM (Gemini/OpenRouter) with enhanced prompt
    ↓
LLM generates answer using context
    ↓
Extract citations from retrieved documents
    ↓
Return answer with citations and suggestions
    ↓
Display in UI with citation links
```

### AI Agent Workflow Flow

```
User navigates to agent page
    ↓
Agent-specific interface loads
    ↓
User uploads file or enters data
    ↓
Data sent to appropriate API endpoint
    ↓
AI processes the input
    ↓
Results displayed with insights
    ↓
User can save results or export
    ↓
Analytics tracked in StatsX
    ↓
Real-time UI updates via Firestore listeners
```

## User Flows

### 1. VERA AI Chat Flow

1. User navigates to VERA page (`/vera`)
2. Optionally selects an AI agent from the sidebar
3. Types question in chat input
4. Question sent to `askChatbot` Cloud Function
5. Function generates query embedding
6. RAG system searches knowledge base
7. Top 5 relevant documents retrieved
8. Context built from documents
9. System prompt enhanced with context (and agent-specific context if agent selected)
10. LLM (Gemini/OpenRouter) generates answer
11. Response streams back to user in real-time
12. Citations extracted from retrieved documents
13. Answer displayed with citations
14. Follow-up suggestions shown
15. Message saved to chat session in Firestore
16. User can click citations to view source documents
17. User can access chat history from sidebar

### 2. VERA AI Chat Flow

1. User navigates to VERA page (`/vera`)
2. Types question in chat input
3. Optionally selects an AI agent for specialized assistance
4. Question sent to `askChatbot` Cloud Function
5. Function generates query embedding
6. RAG system searches knowledge base
7. Top 5 relevant documents retrieved
8. Context built from documents
9. System prompt enhanced with context (and agent-specific context if agent selected)
10. LLM (Gemini/OpenRouter) generates answer
11. Citations extracted from retrieved documents
12. Answer displayed with citations
13. Follow-up suggestions shown
14. User can click citations to view source documents
15. Chat history saved to Firestore for session persistence

### 3. AI Agent Workflow Flow

1. User navigates to Agents page (`/agents`)
2. Selects a specific agent (e.g., Analytics Agent)
3. Agent-specific page loads with specialized interface
4. User uploads file or enters data
5. Data sent to appropriate API endpoint
6. AI processes the input
7. Results displayed with insights
8. User can save results or export data
9. Analytics tracked in StatsX dashboard

### 4. StatsX Analytics Flow

1. User navigates to StatsX page (`/statsx`)
2. Dashboard loads with initial data (server-side fetch)
3. Various widgets display metrics:
   - Pulse Widget (4 key metrics)
   - Trend Chart (with forecasting)
   - Anomaly Detector
   - Meeting Analytics
   - Knowledge Base Analytics
   - Agent Usage Analytics
   - Chat Session Analytics
4. User can filter data (cross-filtering)
5. Charts update based on filters
6. Real-time updates via Firestore listeners

## Firestore Collections

### chatSessions
**Description:** VERA AI chat session history  
**Fields:**
- `userId`: String
- `title`: String (auto-generated from first message)
- `createdAt`: Timestamp
- `updatedAt`: Timestamp
- `messageCount`: Number
- `agentId`: String (selected agent, if any)

### chatMessages
**Description:** Individual chat messages within sessions  
**Fields:**
- `sessionId`: String
- `role`: String ('user' | 'ai')
- `content`: String
- `timestamp`: Timestamp
- `citations`: Array (for AI messages)
- `agentId`: String (if agent was used)

### knowledgeBase
**Description:** Knowledge base documents for RAG  
**Fields:**
- `title`: String
- `content`: String
- `category`: String
- `embedding`: Array<Number>
- `sourceUrl`: String

### analytics
**Description:** Analytics events  
**Fields:**
- `type`: String ("page_view" | "event" | "agent_usage")
- `pagePath`: String
- `userId`: String
- `timestamp`: Timestamp
- `metadata`: Object

### meetings
**Description:** Meeting records  
**Fields:**
- `title`: String
- `date`: Timestamp
- `notes`: String
- `aiInsights`: Object

## Component Hierarchy

```
App
├── Header
├── Main Content
│   ├── Homepage
│   │   ├── Hero
│   │   ├── AIPoweredFeatures
│   │   └── WebsiteCapabilities
│   ├── StatsX
│   │   └── StatsDashboard
│   │       ├── MetricCard (x4)
│   │       ├── AgentUsageAnalytics
│   │       ├── StoryAnalytics
│   │       └── [other widgets]
│   ├── Agents
│   │   ├── Analytics Agent
│   │   ├── Content Agent
│   │   ├── Meetings Agent
│   │   ├── Podcast Agent
│   │   ├── Quiz Agent
│   │   └── Visual Agent
│   └── [other pages]
└── Footer
```

## State Management

### Client-Side State
- React Hooks (useState, useEffect)
- Local component state
- Firestore real-time listeners for updates

### Server-Side State
- Firestore database
- Firebase Storage for files
- Cloud Functions for processing

## Error Handling

### Frontend
- Try-catch blocks in async functions
- Error boundaries for React components
- User-friendly error messages
- Fallback UI for failed operations

### Backend
- Comprehensive error logging
- Graceful degradation
- Retry mechanisms for API calls
- Status codes for different error types

## Performance Optimizations

### Frontend
- Next.js Image optimization
- Code splitting
- Lazy loading components
- Memoization where appropriate

### Backend
- Cloud Functions timeout optimization
- Firestore query optimization
- Caching strategies
- Batch operations

## Security Considerations

### Authentication
- Firebase Authentication
- Protected routes
- Role-based access control

### Data Security
- Firestore security rules
- Input validation
- API key protection
- CORS configuration

## Local Services

### Local Image Generator

**Location:** `python/local_image_generator.py`

**Purpose:** Generate AI images locally using GPU instead of Cloud Functions

**Setup:**
1. Install Python dependencies: `pip install -r requirements.txt`
2. Install PyTorch with CUDA (for GPU support)
3. Set up Firebase authentication (service account key or gcloud auth)
4. Set `HF_API_TOKEN` environment variable
5. Run: `python local_image_generator.py` or use `run_local_generator.ps1`

**How It Works:**
- Monitors Firestore `stories` collection every 30 seconds
- Detects stories needing image generation (`aiInfographicConcept` exists but `aiGeneratedImageUrl` is missing or "Pending local generation")
- Generates image using Hugging Face diffusers library
- Uploads to Firebase Storage
- Updates Firestore with image URL

**Benefits:**
- Faster generation using local GPU
- No Cloud Functions deployment needed
- Works offline once model is downloaded
- Enhanced data privacy (proprietary prompts never leave your machine)

**See:** `SETUP.md` for detailed setup instructions

## Library Functions

### Analytics Library (`src/lib/analytics.js`)

**Purpose**: Comprehensive analytics tracking system for page views, user interactions, and agent usage.

#### Core Functions

##### `trackPageView(pagePath, pageTitle, metadata)`
**Purpose**: Track page view events  
**Parameters**:
- `pagePath` (string): The path of the page viewed
- `pageTitle` (string): The title of the page
- `metadata` (object, optional): Additional metadata

**Returns**: Promise (void)  
**Side Effects**: Creates document in `analytics` collection

**Example**:
```javascript
await trackPageView('/vera', 'VERA AI Page', { category: 'ai' });
```

**Stored Data**:
```javascript
{
  type: 'page_view',
  pagePath: '/vera',
  pageTitle: 'VERA AI Page',
  userId: 'user-id',
  timestamp: Timestamp,
  metadata: { category: 'content' },
  userAgent: 'Mozilla/5.0...',
  referrer: 'https://...'
}
```

---

##### `trackEvent(eventName, elementId, metadata)`
**Purpose**: Track custom interaction events  
**Parameters**:
- `eventName` (string): Name of the event (e.g., 'button_click', 'link_click')
- `elementId` (string): ID or identifier of the element
- `metadata` (object, optional): Additional metadata

**Example**:
```javascript
await trackEvent('button_click', 'agent-generate-btn', { agentType: 'content' });
```

---

##### `trackAgentUsage(agentId, action, metadata)`
**Purpose**: Track AI agent usage for analytics  
**Parameters**:
- `agentId` (string): Agent ID (analytics, meetings, podcast, content, visual, quiz)
- `action` (string): Action type (e.g., 'generate', 'analyze', 'create')
- `metadata` (object, optional): Additional metadata

**Side Effects**:
- Creates analytics event in Firestore
- Updates agent usage statistics

**Example**:
```javascript
await trackAgentUsage('analytics', 'analyze', { fileType: 'csv' });
```

---

##### `getAgentUsageStats(agentId, timeRange)`
**Purpose**: Get usage statistics for a specific agent  
**Parameters**:
- `agentId` (string): Agent ID
- `timeRange` (object, optional): Date range for statistics

**Returns**: Promise<object>
```javascript
{
  totalUsage: 150,
  averageResponseTime: 3.5,
  successRate: 0.95
}
```

**Example**:
```javascript
const stats = await getAgentUsageStats('analytics');
```

---

##### `trackChatSession(sessionId, messageCount, agentId)`
**Purpose**: Track VERA AI chat session metrics  
**Parameters**:
- `sessionId` (string): Chat session ID
- `messageCount` (number): Number of messages in session
- `agentId` (string, optional): Selected agent ID

**Side Effects**:
- Updates chat session statistics
- Creates analytics event

**Example**:
```javascript
await trackChatSession('session-123', 10, 'analytics');
```

---

### Firebase Configuration (`src/lib/firebase.js`)

**Purpose**: Firebase initialization and configuration.

**Exports**:
- `db`: Firestore database instance
- `storage`: Firebase Storage instance
- `auth`: Firebase Authentication instance

**Configuration**:
- Reads from environment variables (`.env.local`)
- Initializes Firebase app with config
- Sets up Firestore, Storage, and Auth instances

---

## Usage Guides

### Setting Up Local Development

#### 1. Initial Setup
```bash
# Clone repository
git clone <repository-url>
cd systemicshiftsver2

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Firebase config
```

#### 2. Firebase Configuration
1. Create Firebase project at [Firebase Console](https://console.firebase.google.com)
2. Enable Firestore, Storage, and Authentication
3. Copy config values to `.env.local`
4. Set up Firestore security rules
5. Configure Storage rules

#### 3. Local Image Generator Setup
```powershell
cd python
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt

# Set up Firebase credentials
# Option 1: Service account key
# Download from Firebase Console → Project Settings → Service Accounts
# Save as firebase-key.json in python/ folder

# Option 2: gcloud auth
gcloud auth application-default login

# Set Hugging Face token
$env:HF_API_TOKEN="your_token_here"

# Run generator
python local_image_generator.py
```

#### 4. Start Development Server
```bash
npm run dev
# Visit http://localhost:3000
```

---

### Using AI Agents

#### Analytics Agent

1. **Navigate to Analytics Agent**
   - Go to `/agents/analytics`
   - Or select Analytics Agent from VERA sidebar

2. **Upload Data**
   - Upload CSV or Excel file
   - Or use sample data provided

3. **View Analysis**
   - AI generates insights automatically
   - View charts and visualizations
   - Export results if needed

#### Visual Agent

1. **Navigate to Visual Agent**
   - Go to `/agents/visual`
   - Or select Visual Agent from VERA sidebar

2. **Upload Image**
   - Upload image file (JPG, PNG, etc.)
   - Wait for AI analysis

3. **View Results**
   - See AI-generated tags
   - Read image description
   - View metadata

---

### Using VERA AI

#### How to Ask Questions

1. **Navigate to VERA**
   - Go to `/vera`
   - Or click "VERA" in header

2. **Select an AI Agent (Optional)**
   - Choose from 6 specialized agents if you need specific assistance
   - Agents provide context-aware responses for their domain
   - Can switch agents mid-conversation

3. **Type Your Question**
   - Enter question in input field
   - Press Enter or click send button
   - Responses stream in real-time

4. **View Response**
   - AI answer appears with citations
   - Follow-up suggestions shown below
   - Click suggestions to ask follow-up questions
   - View message details for technical information

5. **Understanding Citations**
   - Citations show source documents
   - Similarity score indicates relevance
   - Click to view source (if URL provided)

#### Tips for Better Results

- **Be Specific**: More specific questions get better answers
- **Use Keywords**: Include relevant terms from knowledge base
- **Select Appropriate Agent**: Use specialized agents for domain-specific questions
- **Ask Follow-ups**: Use suggested questions for deeper exploration
- **Check Citations**: Verify information from source documents
- **Review Chat History**: Access previous conversations from sidebar

---

### Using Knowledge Base Injector

#### Adding Documents Manually

1. **Open Injector**
   - Click "Inject Knowledge Base" button (usually in NexusGPT page)
   - Modal opens with form

2. **Fill Form**
   - **Title**: Document title
   - **Content**: Paste or type document content
   - **Category**: Select appropriate category
   - **Tags**: Comma-separated tags
   - **Source**: Source identifier
   - **Source URL**: Optional URL

3. **Submit**
   - Click "Inject Document"
   - Document saved to Firestore
   - Embedding generated automatically
   - Available for RAG search immediately

#### Uploading Files

1. **Select File**
   - Click "Choose File"
   - Select PDF or DOCX file

2. **Extract Content** (Optional)
   - Click "Extract and Fill"
   - Text extracted from file
   - Form auto-filled with content

3. **Review and Submit**
   - Review extracted content
   - Add/edit metadata
   - Click "Upload and Inject"
   - File uploaded to Storage
   - Text extracted and saved to knowledge base

---

### Using Podcast Generator

1. **Navigate to ULearn**
   - Go to `/ulearn/podcast`

2. **Enter Topic**
   - Type podcast topic in input field
   - Add optional context

3. **Generate**
   - Click "Generate Podcast"
   - Progress updates shown:
     - "Generating podcast outline..."
     - "Creating script..."
     - "Generating audio..."

4. **Review Results**
   - Script displayed in text area
   - Audio player appears
   - Play/pause controls available

5. **Save Podcast** (Optional)
   - Click "Save Podcast"
   - Saved to Firestore
   - Accessible in "My Podcasts"

---

## Troubleshooting

### Common Issues and Solutions

#### 1. VERA AI Not Responding

**Symptoms**: Chat interface shows loading but no response

**Possible Causes**:
- Cloud Function not deployed
- API keys missing
- Knowledge base empty
- Network issues

**Solutions**:
1. **Check Function Status**: Verify `askChatbot` function is deployed
2. **Verify API Keys**: Check Firebase secrets are set
3. **Check Knowledge Base**: Ensure documents exist in `knowledgeBase` collection
4. **Check Network**: Verify Cloud Function URL is accessible

**Debug Steps**:
```javascript
// Check browser console for errors
// Test Cloud Function directly:
fetch('https://askchatbot-el2jwxb5bq-uc.a.run.app', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ message: 'test' })
})
```

---

#### 2. Images Not Generating

**Symptoms**: Story shows "Pending local generation" but image never appears

**Possible Causes**:
- Local image generator not running
- Firebase credentials not configured
- Hugging Face token missing
- GPU/CUDA issues

**Solutions**:
1. **Check Generator Status**: Ensure `python local_image_generator.py` is running
2. **Verify Credentials**: Check Firebase service account key exists
3. **Check Token**: Verify `HF_API_TOKEN` environment variable is set
4. **Check Logs**: Look for errors in generator console output

**Debug Steps**:
```powershell
# Check if generator is running
Get-Process python

# Verify environment variable
echo $env:HF_API_TOKEN

# Check Firebase credentials
Test-Path "python\firebase-key.json"
```

---

#### 3. NexusGPT Not Responding

**Symptoms**: Chat interface shows loading but no response

**Possible Causes**:
- Cloud Function not deployed
- API keys missing
- Knowledge base empty
- Network issues

**Solutions**:
1. **Check Function Status**: Verify `askChatbot` function is deployed
2. **Verify API Keys**: Check Firebase secrets are set
3. **Check Knowledge Base**: Ensure documents exist in `knowledgeBase` collection
4. **Check Network**: Verify Cloud Function URL is accessible

**Debug Steps**:
```javascript
// Check browser console for errors
// Test Cloud Function directly:
fetch('https://askchatbot-el2jwxb5bq-uc.a.run.app', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ message: 'test' })
})
```

---

#### 4. Agent Not Responding

**Symptoms**: Agent page shows loading but no response

**Possible Causes**:
- API endpoint not accessible
- File upload failed
- Network issues

**Solutions**:
1. **Check API Endpoint**: Verify the agent's API route is accessible
2. **Check File Upload**: Ensure files are within size limits
3. **Check Network**: Verify network connectivity

**Debug Steps**:
```javascript
// Check browser console for errors
// Verify API endpoint URL
// Check file size and format
```

---

#### 5. Chat History Not Loading

**Symptoms**: Previous chat sessions not appearing in sidebar

**Possible Causes**:
- Firestore query errors
- Missing indexes
- Snapshot storage issues

**Solutions**:
1. **Check Firestore Indexes**: Ensure composite indexes exist
2. **Check Console Errors**: Look for Firestore query errors
3. **Verify Query Structure**: Check query uses correct field names

**Debug Steps**:
```javascript
// Check browser console for Firestore errors
// Verify collection name matches
// Check field names in queries
```

---

#### 6. Hydration Errors

**Symptoms**: React hydration mismatch warnings in console

**Possible Causes**:
- Server/client HTML mismatch
- Date/time rendering differences
- Conditional rendering based on client-only state

**Solutions**:
1. **Use `mounted` State**: Check component uses `mounted` flag for client-only rendering
2. **Avoid Date Formatting**: Use `useEffect` for date formatting
3. **Check Conditional Rendering**: Ensure server and client render same initial HTML

**Example Fix**:
```javascript
const [mounted, setMounted] = useState(false);

useEffect(() => {
  setMounted(true);
}, []);

// Only render dynamic content after mount
{mounted && <DynamicComponent />}
```

---

### Performance Issues

#### Slow Page Loads

**Solutions**:
1. **Enable Code Splitting**: Use dynamic imports for heavy components
2. **Optimize Images**: Use Next.js Image component
3. **Reduce Bundle Size**: Remove unused dependencies
4. **Enable Caching**: Configure proper cache headers

#### Slow Firestore Queries

**Solutions**:
1. **Add Indexes**: Create composite indexes for complex queries
2. **Limit Results**: Use `limit()` in queries
3. **Cache Data**: Store frequently accessed data in state
4. **Optimize Queries**: Reduce number of queries per page

---

## Future Enhancements

### Planned Features

- [ ] **Unit and Integration Tests**: Jest and React Testing Library
- [ ] **E2E Testing**: Playwright for end-to-end testing
- [ ] **Performance Monitoring**: Real User Monitoring (RUM)
- [ ] **Error Tracking**: Sentry integration for error tracking
- [ ] **Analytics Dashboard**: Enhanced analytics visualization
- [ ] **A/B Testing Framework**: Built-in A/B testing capabilities
- [ ] **Offline Support**: Service workers for offline functionality
- [ ] **Push Notifications**: Browser push notifications
- [ ] **Advanced Search**: Full-text search across all content
- [ ] **Export Functionality**: Export data as CSV/JSON

### Technical Debt

- [ ] Refactor duplicate code in pagination components
- [ ] Consolidate similar utility functions
- [ ] Improve error handling consistency
- [ ] Add TypeScript for type safety
- [ ] Optimize bundle size further
- [ ] Improve accessibility (WCAG compliance)

---

## Summary

VERA AI is a comprehensive platform featuring:

- **AI-Powered Features**: Image generation, podcast creation, chatbot, meeting insights
- **Real-time Analytics**: StatsX dashboard with forecasting and anomaly detection
- **Content Management**: Knowledge base, agent-generated content
- **User Engagement**: Chat sessions, agent usage tracking
- **Local Services**: GPU-accelerated image generation

All components are modular, well-documented, and designed for extensibility. The architecture supports easy addition of new features and integration with external services.

