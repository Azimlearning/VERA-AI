# VERA AI

An intelligent AI assistant designed specifically for PETRONAS Upstream, powered by advanced RAG (Retrieval-Augmented Generation) technology and specialized AI agents to accelerate workflows and provide expert knowledge.

## Overview

VERA AI is a comprehensive AI platform built to support PETRONAS Upstream's digital transformation journey. VERA serves as the core AI intelligence with deep knowledge about:

- **PETRONAS** (high-level corporate information)
- **PETRONAS Upstream** (upstream operations, strategies, and initiatives)
- **Systemic Shifts** (transformation initiatives and progress tracking)

VERA combines advanced AI capabilities with a specialized knowledge base to deliver accurate, citation-backed responses and accelerate various workflows through its ecosystem of specialized AI agents.

## Key Features

### 🤖 Core AI Intelligence (VERA)
- **RAG-Powered Knowledge Base**: Retrieval-Augmented Generation ensures accurate, context-aware responses
- **Citation-Backed Answers**: Every response includes source citations for transparency and verification
- **Specialized Knowledge**: Deep understanding of PETRONAS, PETRONAS Upstream, and Systemic Shifts
- **Conversational Interface**: Natural language interaction with streaming responses

### 🚀 Six Specialized AI Agents

1. **Analytics Agent**: Data insights and analytics automation
2. **Meetings Agent**: Meeting organization, action item extraction, and insights
3. **Podcast Agent**: AI-powered podcast generation from knowledge base content
4. **Content Agent**: Story drafting and content creation assistance
5. **Visual Agent**: Image analysis and generation capabilities
6. **Quiz Agent**: Knowledge testing and assessment generation

## Tech Stack

### Frontend
- **Framework**: Next.js 14+ (App Router)
- **Styling**: Tailwind CSS
- **UI Components**: React Icons, Framer Motion
- **Charts**: Recharts
- **State Management**: React Hooks

### Backend
- **Firebase**: Firestore (database), Storage, Cloud Functions
- **Authentication**: Firebase Auth
- **Hosting**: Firebase Hosting / Vercel

### AI Services
- **LLM**: Google Gemini, OpenRouter
- **Embeddings**: OpenAI, OpenRouter
- **Image Generation**: Hugging Face Inference API
- **Text-to-Speech**: Various TTS APIs

### Development Tools
- **Language**: JavaScript/TypeScript, Python
- **Package Manager**: npm
- **Version Control**: Git

## Project Structure

```
vera-ai/
├── src/
│   ├── app/              # Next.js app router pages
│   ├── components/       # React components
│   └── lib/              # Utility functions and helpers
├── functions/            # Firebase Cloud Functions (Node.js)
├── functions-python/     # Firebase Cloud Functions (Python)
├── public/               # Static assets
└── Scripts_usage/        # Utility scripts
```

## Quick Start

### Prerequisites
- Node.js 18+ and npm
- Firebase CLI
- Python 3.9+ (for Python functions)

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd vera-ai
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
Create a `.env.local` file with:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

4. Run development server
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000)

## Development Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Firebase Functions

### Node.js Functions
Located in `functions/` directory:
- `askChatbot` - VERA AI chatbot endpoint with RAG
- `generateImageHf` - Image generation using Hugging Face
- `generatePodcast` - Podcast generation
- `generateQuiz` - Quiz generation
- `meetxAI` - Meeting insights and processing

### Python Functions
Located in `functions-python/` directory:
- `generateImageHfPython` - Python-based image generation
- `analyzeImagePython` - Image analysis

## Deployment

### Frontend
Deploy to Firebase Hosting or Vercel:
```bash
npm run build
firebase deploy --only hosting
```

### Cloud Functions
```bash
cd functions
npm install
firebase deploy --only functions
```

## Configuration

See `SETUP.md` for detailed setup instructions including:
- Firebase configuration
- API keys setup
- Environment variables
- Local development setup

## Documentation

- `SETUP.md` - Detailed setup and configuration guide
- `TESTING.md` - Testing procedures and checklist
- `SITE_BREAKDOWN.md` - Full site architecture and API documentation
- `Scripts_usage/README.md` - Utility scripts documentation

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## License

Internal use only - PETRONAS Upstream

## Support

For issues and questions, contact the development team.
