# VERA AI Setup Guide

Complete setup instructions for the VERA AI platform, including local development environment, Firebase configuration, and all required services.

## Overview

VERA AI is an enterprise-grade intelligent AI assistant platform powered by **Retrieval-Augmented Generation (RAG)** technology, **vector embeddings** (OpenAI text-embedding-3-large), and a comprehensive **knowledge base** with cosine similarity search. Designed specifically for PETRONAS Upstream operations, this guide will help you set up the complete development environment, including the Next.js frontend, Firebase backend with vector database, and local image generation service.

## Prerequisites

### Required Software

- **Node.js**: Version 18.0 or higher
  - Download from [nodejs.org](https://nodejs.org/)
  - Verify installation: `node --version`
  
- **npm**: Version 9.0 or higher (comes with Node.js)
  - Verify installation: `npm --version`
  
- **Python**: Version 3.9 or higher (for local image generation)
  - Download from [python.org](https://www.python.org/downloads/)
  - Verify installation: `python --version`
  
- **Firebase CLI**: Latest version
  - Install: `npm install -g firebase-tools`
  - Verify: `firebase --version`
  - Login: `firebase login`
  
- **Git**: For version control
  - Download from [git-scm.com](https://git-scm.com/)

### Optional but Recommended

- **Visual Studio Code**: Recommended IDE
- **Postman**: For API testing
- **NVIDIA GPU**: For local image generation (significantly faster)

## Project Setup

### 1. Clone Repository

```bash
git clone <repository-url>
cd systemicshiftsver2
```

### 2. Install Dependencies

#### Frontend Dependencies
```bash
npm install
```

This installs all Next.js, React, and frontend dependencies.

#### Firebase Functions Dependencies
```bash
cd functions
npm install
cd ..
```

This installs all Cloud Functions dependencies.

### 3. Firebase Configuration

#### Initialize Firebase Project

If starting fresh:
```bash
firebase init
```

Select:
- ✅ Firestore
- ✅ Functions
- ✅ Hosting
- ✅ Storage

#### Link to Existing Project

If you have an existing Firebase project:
```bash
firebase use <project-id>
```

Verify current project:
```bash
firebase use
```

### 4. Environment Variables

#### Frontend Environment Variables

Create `.env.local` in the root directory (`systemicshiftsver2/.env.local`):

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

**How to get these values:**
1. Go to Firebase Console → Project Settings
2. Scroll to "Your apps" section
3. Click on the web app icon (</>)
4. Copy the configuration values

#### Firebase Functions Secrets

Set up secrets for Cloud Functions (required for AI features):

```bash
# Google Gemini API Key
firebase functions:secrets:set GOOGLE_GENAI_API_KEY
# Enter your API key when prompted

# OpenRouter API Key
firebase functions:secrets:set OPENROUTER_API_KEY
# Enter your API key when prompted

# Hugging Face API Token (optional, for cloud image generation)
firebase functions:secrets:set HF_API_TOKEN
# Enter your token when prompted
```

**Note:** Secrets are stored securely and are not visible in code. They are required for Cloud Functions to work.

### 5. API Keys Setup

#### Google Gemini API

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the API key
5. Set as Firebase secret: `firebase functions:secrets:set GOOGLE_GENAI_API_KEY`

#### OpenRouter API

1. Sign up at [OpenRouter](https://openrouter.ai/)
2. Go to Dashboard → Keys
3. Create a new API key
4. Copy the API key
5. Set as Firebase secret: `firebase functions:secrets:set OPENROUTER_API_KEY`

#### Hugging Face API (Optional)

1. Sign up at [Hugging Face](https://huggingface.co/)
2. Go to Settings → Access Tokens
3. Create a new token with "Read" permissions
4. Copy the token
5. Set as Firebase secret: `firebase functions:secrets:set HF_API_TOKEN`

## Local Development

### Start Development Server

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

**Features:**
- Hot module replacement (HMR)
- Fast refresh for React components
- Automatic error reporting
- Source maps for debugging

### Run Firebase Functions Locally

#### Using Firebase Emulator Suite

```bash
# Start all emulators
firebase emulators:start

# Start specific emulators
firebase emulators:start --only firestore,functions
```

**Note:** Local functions will be available at `http://localhost:5001/<project-id>/<region>/<function-name>`

#### Using Functions Framework (Alternative)

```bash
cd functions
npm run serve
```

### Firestore Emulator (Optional)

For local development without affecting production data:

```bash
firebase emulators:start --only firestore
```

The emulator will run on `http://localhost:8080`

## Local Image Generator Setup

The project includes a **local image generator** service that runs on your machine to generate images using your GPU. This is preferred over Cloud Functions for better performance, enhanced data privacy, and reduced latency.

### Prerequisites

- Python 3.9 or higher
- NVIDIA GPU (recommended) or CPU
- Firebase service account key
- Hugging Face API token

### Setup Steps

#### 1. Install Python Dependencies

```powershell
cd python
python -m venv .venv

# Windows
.\.venv\Scripts\activate

# Mac/Linux
source .venv/bin/activate

pip install -r requirements.txt
```

#### 2. Install PyTorch with CUDA (if you have NVIDIA GPU)

**For GPU (Recommended):**
- Go to: https://pytorch.org/get-started/locally/
- Select your CUDA version
- Example command for CUDA 12.1:
```powershell
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121
```

**For CPU Only:**
```powershell
pip install torch torchvision torchaudio
```

#### 3. Set Up Firebase Authentication

**Option A: Service Account Key (Recommended)**

1. Go to Firebase Console → Project Settings → Service Accounts
2. Click "Generate new private key"
3. Save the JSON file as `firebase-key.json` in the `python/` folder
4. Set environment variable:
```powershell
# Windows PowerShell
$env:GOOGLE_APPLICATION_CREDENTIALS="C:\path\to\systemicshiftsver2\python\firebase-key.json"

# Windows CMD
set GOOGLE_APPLICATION_CREDENTIALS=C:\path\to\systemicshiftsver2\python\firebase-key.json

# Mac/Linux
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/systemicshiftsver2/python/firebase-key.json"
```

**Option B: Application Default Credentials**
```powershell
gcloud auth application-default login
```

#### 4. Set Hugging Face Token

```powershell
# Windows PowerShell
$env:HF_API_TOKEN="your_huggingface_token_here"

# Windows CMD
set HF_API_TOKEN=your_huggingface_token_here

# Mac/Linux
export HF_API_TOKEN="your_huggingface_token_here"
```

### Running the Local Image Generator

**Using PowerShell Script (Recommended - Windows):**
```powershell
cd python
.\run_local_generator.ps1
```

**Manual Start:**
```powershell
cd python
.\.venv\Scripts\activate  # Activate virtual environment
$env:HF_API_TOKEN="your_token"  # Set token
python local_image_generator.py
```

**Mac/Linux:**
```bash
cd python
source .venv/bin/activate
export HF_API_TOKEN="your_token"
python local_image_generator.py
```

### How It Works

1. **Monitors Firestore** - Checks every 30 seconds for stories with `aiInfographicConcept` but no `aiGeneratedImageUrl`
2. **Generates images locally** - Uses your GPU (much faster than Cloud Functions!)
3. **Uploads to Firebase Storage** - Saves the generated image
4. **Updates Firestore** - Sets `aiGeneratedImageUrl` so the frontend can display it

### Benefits

- ✅ Uses your local GPU (fast!)
- ✅ No 5GB model download in Cloud Functions
- ✅ No Cloud Functions deployment issues
- ✅ Works offline (once model is downloaded)
- ✅ Full control over generation parameters
- ✅ Enhanced data privacy (proprietary prompts never leave your machine)

### Notes

- The service runs continuously - keep it running in a terminal
- First run will download the model (~5GB) - this only happens once
- Images are generated asynchronously after story submission
- The frontend will automatically show images once they're generated
- If the service stops, images will remain in "Pending" state until restarted

## Firebase Configuration Files

### firebase.json

Ensure your `firebase.json` includes:

```json
{
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  },
  "functions": [
    {
      "source": "functions",
      "codebase": "default",
      "runtime": "nodejs18"
    }
  ],
  "hosting": {
    "public": ".next",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  },
  "storage": {
    "rules": "storage.rules"
  }
}
```

### Firestore Rules

Set up appropriate security rules in `firestore.rules`:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Add your rules here
    // Example: Allow authenticated users to read/write
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### Storage Rules

Set up storage rules in `storage.rules`:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
  }
}
```

## Development Workflow

### 1. Create Feature Branch

```bash
git checkout -b feature/your-feature-name
```

### 2. Make Changes

- Edit code
- Test locally
- Commit changes

### 3. Test Before Deploying

```bash
# Build for production
npm run build

# Run linter
npm run lint

# Test locally
npm run dev
```

### 4. Deploy

```bash
# Deploy everything
firebase deploy

# Deploy only frontend
firebase deploy --only hosting

# Deploy only functions
firebase deploy --only functions
```

## Troubleshooting

### Common Issues

#### Port Already in Use

**Windows:**
```powershell
# Find process using port 3000
netstat -ano | findstr :3000

# Kill process (replace <PID> with actual process ID)
taskkill /PID <PID> /F
```

**Mac/Linux:**
```bash
# Find and kill process
lsof -ti:3000 | xargs kill
```

#### Firebase Functions Not Deploying

**Solutions:**
- Check Firebase CLI is logged in: `firebase login`
- Verify project: `firebase use`
- Check function dependencies: `cd functions && npm install`
- Review function logs: `firebase functions:log`

#### Environment Variables Not Loading

**Solutions:**
- Ensure `.env.local` is in the root directory
- Restart development server after adding variables
- Variables must start with `NEXT_PUBLIC_` for client-side access
- Check for typos in variable names

#### Python Functions Errors

**Solutions:**
- Ensure Python 3.9+ is installed
- Activate virtual environment: `.venv\Scripts\activate` (Windows) or `source .venv/bin/activate` (Mac/Linux)
- Install all requirements: `pip install -r requirements.txt`
- Check Python path: `python --version`

#### Local Image Generator Not Working

**Symptoms:** Images remain in "Pending local generation" state

**Solutions:**
1. **Check Generator Status**: Ensure `python local_image_generator.py` is running
2. **Verify Credentials**: Check Firebase service account key exists and path is correct
3. **Check Token**: Verify `HF_API_TOKEN` environment variable is set
4. **Check Logs**: Look for errors in generator console output
5. **Verify GPU**: If using GPU, check CUDA is installed: `nvidia-smi`
6. **Check Firestore Connection**: Verify generator can connect to Firestore

**Debug Steps:**
```powershell
# Check if generator is running
Get-Process python

# Verify environment variable
echo $env:HF_API_TOKEN

# Check Firebase credentials
Test-Path "python\firebase-key.json"

# Check CUDA (if using GPU)
nvidia-smi
```

#### Module Not Found Errors

**Solutions:**
- Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Clear Next.js cache: `rm -rf .next`
- Check package.json for correct dependencies
- Verify Node.js version: `node --version` (should be 18+)

#### Firestore Connection Issues

**Solutions:**
- Verify Firebase project ID in `.env.local`
- Check Firestore is enabled in Firebase Console
- Verify security rules allow access
- Check network connectivity

## Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Functions Documentation](https://firebase.google.com/docs/functions)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [React Documentation](https://react.dev)
- [Python Virtual Environments](https://docs.python.org/3/tutorial/venv.html)

## Support

For setup issues:
1. Check this documentation
2. Review error messages carefully
3. Check Firebase Console for service status
4. Contact the development team

## Next Steps

After completing setup:
1. Review [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for deployment instructions
2. Review [TESTING.md](./TESTING.md) for testing procedures
3. Review [FULL_DOCUMENTATION.md](./FULL_DOCUMENTATION.md) for architecture details
4. Start developing!
