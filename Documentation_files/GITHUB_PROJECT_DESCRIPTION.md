# VERA AI: RAG-Powered Intelligent Knowledge Base Assistant Platform

## 🚀 Project Overview

VERA AI is an enterprise-grade intelligent AI assistant platform engineered for PETRONAS Upstream operations. Built with cutting-edge **Retrieval-Augmented Generation (RAG)** technology, **vector embeddings**, and a comprehensive **knowledge base**, VERA delivers citation-backed, accurate responses while accelerating workflows through specialized AI agents.

**VERA** derives from "Veritas" (Latin for "Truth"), reflecting the platform's commitment to providing truthful, verifiable, and citation-backed answers.

## ✨ Key Features

### 🤖 Core AI Intelligence (VERA)
- **RAG-Powered Knowledge Base**: Advanced Retrieval-Augmented Generation ensures accurate, context-aware responses grounded in source documents
- **Vector Embeddings**: 3,072-dimensional embeddings (OpenAI text-embedding-3-large) enable semantic search beyond keyword matching
- **Citation-Backed Answers**: Every response includes transparent source citations for verification and trust
- **Knowledge Base Management**: Comprehensive document ingestion, chunking, and vectorization pipeline
- **Cosine Similarity Search**: Intelligent retrieval using vector similarity algorithms
- **Conversational Interface**: Natural language interaction with real-time streaming responses

### 🚀 Six Specialized AI Agents

1. **Analytics Agent**: AI-powered data insights, forecasting, and analytics automation using predictive algorithms
2. **Meetings Agent**: Automated meeting transcription, action item extraction, and executive brief generation
3. **Podcast Agent**: RAG-enhanced podcast generation with multi-speaker TTS synthesis
4. **Content Agent**: Automated content creation with RAG-based style matching and visual concept generation
5. **Visual Agent**: Computer vision-powered image analysis, tagging, and categorization using Gemini Vision
6. **Quiz Agent**: Knowledge assessment generation from content and knowledge base materials

### 📊 Advanced Analytics
- **StatsX Dashboard**: Real-time analytics with predictive forecasting (Prophet algorithm)
- **Anomaly Detection**: Statistical models (IQR, Z-score) for identifying irregular patterns
- **Real-Time Telemetry**: Event-driven analytics with 10-minute aggregation cycles

## 🛠️ Technology Stack

### Frontend
- **Next.js 14+** (App Router) - React framework with hybrid rendering
- **React 19** - UI library with Server Components
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - GPU-accelerated animations
- **Recharts** - Data visualization

### Backend
- **Firebase Cloud Functions** (Node.js & Python) - Serverless compute
- **Cloud Firestore** - NoSQL database with real-time listeners
- **Firebase Storage** - File storage
- **Firebase Authentication** - Role-based access control

### AI & ML Technologies
- **RAG Architecture**: Retrieval-Augmented Generation with vector database
- **Vector Embeddings**: OpenAI text-embedding-3-large (3,072 dimensions)
- **LLMs**: Google Gemini API, OpenRouter API
- **Computer Vision**: Gemini Vision API
- **Image Generation**: Local Stable Diffusion (PyTorch + Hugging Face Diffusers)
- **Text-to-Speech**: Multi-speaker TTS engines
- **Predictive Analytics**: Prophet algorithm for forecasting

## 🏗️ Architecture Highlights

- **Hybrid AI Inference**: Cloud-based LLMs for text processing + Local GPU for image generation
- **Serverless Architecture**: Event-driven, auto-scaling backend
- **Real-Time Data Pipeline**: Firestore listeners for instant updates
- **Vector Database**: Firestore-based semantic search with cosine similarity
- **Cost Optimization**: Local image generation eliminates per-transaction cloud costs

## 📈 Performance Metrics

- **95% Efficiency Gain**: Knowledge retrieval time reduced from 15-30 minutes to <10 seconds
- **90% Faster**: Content creation turnaround from 5-7 days to <15 minutes
- **94% Citation Accuracy**: High-precision RAG retrieval with source verification
- **82% First-Pass Acceptance**: AI-generated content quality validation
- **Near-Zero Marginal Cost**: Local image generation eliminates cloud API fees

## 🎯 Use Cases

- **Knowledge Retrieval**: Instant access to PETRONAS policies, strategies, and operational documents
- **Content Creation**: Automated story drafting with brand consistency
- **Meeting Intelligence**: Structured meeting minutes with action items
- **Data Analytics**: AI-powered insights and forecasting
- **Learning & Training**: Podcast generation and quiz creation
- **Visual Asset Management**: Automated image tagging and organization

## 📚 Documentation

Comprehensive documentation available in `Documentation_files/`:
- `SETUP.md` - Complete setup and configuration guide
- `DEPLOYMENT_GUIDE.md` - Production deployment instructions
- `TESTING.md` - Testing procedures and checklist
- `FULL_DOCUMENTATION.md` - Complete architecture and API documentation
- `SIP_REPORT.md` - Detailed project report with technical specifications

## 🚦 Quick Start

```bash
# Clone repository
git clone https://github.com/[YOUR_USERNAME]/vera-ai.git
cd vera-ai

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Configure Firebase and API keys

# Run development server
npm run dev
```

## 🔐 Security & Governance

- **Role-Based Access Control (RBAC)**: Granular permissions via Firebase Custom Claims
- **Input Sanitization**: Protection against prompt injection attacks
- **Toxicity Filtering**: Real-time content safety checks
- **Citation Verification**: "No Citation, No Answer" policy prevents hallucinations
- **Human-in-the-Loop**: AI outputs require human review and approval

## 🌱 Sustainability

- **Green AI Architecture**: Local inference reduces cloud compute emissions
- **Cost Optimization**: Hybrid architecture minimizes operational expenditure
- **Paperless Operations**: Fully digital workflows reduce environmental impact

## 📝 License

Internal use only - PETRONAS Upstream

## 👥 Contributors

- **Developer**: Fakhrul Azim Bin Ahmed Mardzukie
- **Host Company**: PETRONAS Upstream - Strategic & Commercial (S&C), Business Performance Improvement (BPI)
- **Supervisor**: Noor Shameem Roslan

## 🔗 Related Links

- [Project Documentation](./Documentation_files/)
- [SIP Report](./Documentation_files/SIP_REPORT.md)
- [Deployment Guide](./Documentation_files/DEPLOYMENT_GUIDE.md)

---

**Built with ❤️ for PETRONAS Upstream Digital Transformation**

