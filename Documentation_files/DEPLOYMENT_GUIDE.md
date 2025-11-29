# VERA AI Deployment Guide

Complete deployment instructions for the VERA AI platform, including frontend, backend Cloud Functions, and local services.

## Overview

VERA AI is an enterprise-grade intelligent AI assistant platform powered by **Retrieval-Augmented Generation (RAG)** technology, **vector embeddings**, and a comprehensive **knowledge base**. Designed for PETRONAS Upstream operations, this guide covers deployment of all components including the Next.js frontend, Firebase Cloud Functions, vector database setup, and local image generation service.

## Prerequisites

### Required Software
- **Node.js**: Version 18.0 or higher
- **npm**: Version 9.0 or higher
- **Python**: Version 3.9 or higher (for local image generation)
- **Firebase CLI**: Latest version (`npm install -g firebase-tools`)
- **Git**: For version control

### Required Accounts & Access
- Firebase project with billing enabled
- Google Cloud Platform account
- API keys for:
  - Google Gemini API
  - OpenRouter API
  - Hugging Face API (for local image generation)

## Pre-Deployment Checklist

- [ ] Firebase project created and linked
- [ ] All environment variables configured
- [ ] Firebase secrets set for Cloud Functions
- [ ] Firestore security rules configured
- [ ] Storage rules configured
- [ ] Local image generator service account key configured (if using local generation)
- [ ] All dependencies installed (`npm install` in root and `functions/`)

## Deployment Steps

### 1. Firebase Project Setup

#### Initialize Firebase
```bash
firebase login
firebase init
```

Select:
- ✅ Firestore
- ✅ Functions
- ✅ Hosting
- ✅ Storage

#### Link to Existing Project
```bash
firebase use <project-id>
```

### 2. Environment Configuration

#### Frontend Environment Variables
Create `.env.local` in the root directory:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

#### Firebase Functions Secrets
Set up secrets for Cloud Functions:
```bash
# Google Gemini API Key
firebase functions:secrets:set GOOGLE_GENAI_API_KEY

# OpenRouter API Key
firebase functions:secrets:set OPENROUTER_API_KEY

# Hugging Face API Token (if using cloud-based image generation)
firebase functions:secrets:set HF_API_TOKEN
```

**Note:** Secrets are entered interactively. Ensure you have the API keys ready.

### 3. Install Dependencies

#### Frontend Dependencies
```bash
npm install
```

#### Firebase Functions Dependencies
```bash
cd functions
npm install
cd ..
```

### 4. Build Frontend

```bash
npm run build
```

This creates the `.next` directory with optimized production build.

### 5. Deploy Firebase Services

#### Deploy Everything
```bash
firebase deploy
```

#### Deploy Individual Services

**Deploy Frontend Only:**
```bash
firebase deploy --only hosting
```

**Deploy Cloud Functions Only:**
```bash
firebase deploy --only functions
```

**Deploy Specific Function:**
```bash
firebase deploy --only functions:askChatbot
```

**Deploy Firestore Rules:**
```bash
firebase deploy --only firestore:rules
```

**Deploy Storage Rules:**
```bash
firebase deploy --only storage
```

### 6. Cloud Functions Deployment

#### Available Functions

The following Cloud Functions are available for deployment:

1. **askChatbot** - VERA AI chatbot with RAG
   - Endpoint: `https://askchatbot-<region>-<project-id>.cloudfunctions.net`
   - Timeout: 120 seconds
   - Memory: 512MiB
   - Secrets: `GOOGLE_GENAI_API_KEY`, `OPENROUTER_API_KEY`

2. **generatePodcast** - Podcast generation
   - Timeout: 300 seconds
   - Memory: 1GiB
   - Secrets: `GOOGLE_GENAI_API_KEY`, `OPENROUTER_API_KEY`

3. **generateQuiz** - Quiz generation
   - Timeout: 300 seconds
   - Memory: 1GiB
   - Secrets: `GOOGLE_GENAI_API_KEY`, `OPENROUTER_API_KEY`

4. **analyzeStorySubmission** - Story analysis trigger
   - Trigger: Firestore document creation
   - Timeout: 540 seconds
   - Memory: 1GiB
   - Secrets: `GOOGLE_GENAI_API_KEY`, `OPENROUTER_API_KEY`

5. **injectKnowledgeBase** - Knowledge base injection
   - Timeout: 60 seconds
   - Memory: 512MiB
   - Secrets: `GOOGLE_GENAI_API_KEY`, `OPENROUTER_API_KEY`

6. **uploadKnowledgeBase** - File upload and extraction
   - Timeout: 300 seconds
   - Memory: 1GiB
   - Secrets: `GOOGLE_GENAI_API_KEY`, `OPENROUTER_API_KEY`

7. **generateMeetingInsights** - Meeting analysis
   - Timeout: 540 seconds
   - Memory: 1GiB
   - Secrets: `GOOGLE_GENAI_API_KEY`, `OPENROUTER_API_KEY`

8. **processMeetingFile** - Meeting file processing
   - Timeout: 300 seconds
   - Memory: 1GiB
   - Secrets: `GOOGLE_GENAI_API_KEY`, `OPENROUTER_API_KEY`

9. **analyzeImage** - Image analysis
   - Timeout: 120 seconds
   - Memory: 512MiB
   - Secrets: `GOOGLE_GENAI_API_KEY`, `OPENROUTER_API_KEY`

10. **generateEmbeddings** - Embedding generation (admin)
    - Timeout: 540 seconds
    - Memory: 1GiB
    - Secrets: `GOOGLE_GENAI_API_KEY`, `OPENROUTER_API_KEY`

11. **populateKnowledgeBase** - Knowledge base population (admin)
    - Timeout: 300 seconds
    - Memory: 1GiB
    - Secrets: `GOOGLE_GENAI_API_KEY`, `OPENROUTER_API_KEY`

#### Deploy All Functions
```bash
cd functions
firebase deploy --only functions
```

#### Deploy Single Function
```bash
firebase deploy --only functions:askChatbot
```

### 7. Local Image Generator Setup (Optional)

The project supports local image generation using GPU-accelerated inference. This is recommended for enhanced data privacy, reduced latency, and improved performance.

#### Prerequisites
- Python 3.9+
- NVIDIA GPU (recommended) or CPU
- CUDA toolkit (for GPU)
- Firebase service account key

#### Setup Steps

1. **Install Python Dependencies**
```powershell
cd python
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
```

2. **Install PyTorch with CUDA** (if using GPU)
```powershell
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121
```

3. **Set Up Firebase Authentication**

**Option A: Service Account Key (Recommended)**
- Go to Firebase Console → Project Settings → Service Accounts
- Click "Generate new private key"
- Save as `firebase-key.json` in the `python/` folder
- Set environment variable:
```powershell
$env:GOOGLE_APPLICATION_CREDENTIALS="C:\path\to\python\firebase-key.json"
```

**Option B: Application Default Credentials**
```powershell
gcloud auth application-default login
```

4. **Set Hugging Face Token**
```powershell
$env:HF_API_TOKEN="your_huggingface_token_here"
```

5. **Run Local Generator**
```powershell
cd python
.\run_local_generator.ps1
```

Or manually:
```powershell
python local_image_generator.py
```

**Note:** The service runs continuously and monitors Firestore every 30 seconds for stories needing image generation.

## Post-Deployment Verification

### 1. Verify Frontend Deployment
- Visit the deployed URL (provided after `firebase deploy --only hosting`)
- Check that all pages load correctly
- Verify navigation works
- Test responsive design on mobile/tablet

### 2. Verify Cloud Functions
- Test VERA chatbot: Send a POST request to `askChatbot` endpoint
- Check Firebase Console → Functions for deployment status
- Review logs for any errors

### 3. Verify Firestore
- Check that collections are accessible
- Verify security rules are working
- Test read/write operations

### 4. Verify Storage
- Test file upload functionality
- Verify storage rules are working
- Check file access permissions

### 5. Verify Local Services (if applicable)
- Check that local image generator is running
- Submit a test story and verify image generation
- Check Firestore for image URL updates

## Testing Deployed Functions

### Test askChatbot Function
```bash
curl -X POST https://askchatbot-<region>-<project-id>.cloudfunctions.net \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What is PETRONAS 2.0?",
    "sessionId": "test-session"
  }'
```

### Test generatePodcast Function
```bash
curl -X POST https://generatepodcast-<region>-<project-id>.cloudfunctions.net \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "Systemic Shifts",
    "context": "PETRONAS Upstream transformation"
  }'
```

## Configuration Files

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
Ensure appropriate security rules in `firestore.rules`:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Add your security rules here
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## Troubleshooting

### Common Deployment Issues

#### 1. Functions Not Deploying
**Symptoms:** Functions fail to deploy or timeout

**Solutions:**
- Check Firebase CLI is logged in: `firebase login`
- Verify project: `firebase use`
- Check function dependencies: `cd functions && npm install`
- Review function logs: `firebase functions:log`

#### 2. Frontend Build Fails
**Symptoms:** `npm run build` fails

**Solutions:**
- Check for TypeScript/ESLint errors: `npm run lint`
- Verify all environment variables are set
- Check for missing dependencies: `npm install`
- Review build logs for specific errors

#### 3. Functions Timeout
**Symptoms:** Functions exceed timeout limits

**Solutions:**
- Increase timeout in function definition
- Optimize function code
- Check for infinite loops or blocking operations
- Review function logs for bottlenecks

#### 4. Missing Secrets
**Symptoms:** Functions fail with authentication errors

**Solutions:**
- Verify secrets are set: `firebase functions:secrets:access GOOGLE_GENAI_API_KEY`
- Re-deploy functions after setting secrets
- Check secret names match function code

#### 5. CORS Errors
**Symptoms:** Frontend cannot call Cloud Functions

**Solutions:**
- Verify CORS is configured in function code
- Check function URLs are correct
- Verify Firebase project ID matches

### Debug Commands

```bash
# View function logs
firebase functions:log

# View specific function logs
firebase functions:log --only askChatbot

# Check deployment status
firebase deploy --only functions --dry-run

# Test function locally
cd functions
npm run serve
```

## Rollback Procedures

If issues are detected after deployment:

### Rollback Frontend
```bash
# Deploy previous version
firebase deploy --only hosting --project <project-id>
```

### Rollback Functions
```bash
# Deploy previous function version
firebase deploy --only functions:askChatbot --project <project-id>
```

### Rollback Firestore Rules
```bash
# Revert to previous rules
git checkout HEAD~1 firestore.rules
firebase deploy --only firestore:rules
```

## Performance Optimization

### Frontend
- Enable Next.js Image Optimization
- Use code splitting for large components
- Implement lazy loading
- Optimize bundle size

### Cloud Functions
- Use caching where appropriate
- Optimize database queries
- Implement connection pooling
- Monitor execution times

### Firestore
- Create composite indexes for complex queries
- Use pagination for large datasets
- Implement caching strategies
- Optimize read/write operations

## Security Best Practices

1. **Never commit secrets** - Use Firebase secrets management
2. **Enforce Firestore rules** - Restrict access appropriately
3. **Validate inputs** - Sanitize all user inputs
4. **Use HTTPS** - Enforce secure connections
5. **Monitor access** - Review Firebase logs regularly
6. **Rotate API keys** - Update secrets periodically
7. **Implement rate limiting** - Prevent abuse

## Monitoring and Maintenance

### Firebase Console
- Monitor function execution times
- Review error rates
- Check storage usage
- Track Firestore read/write operations

### Cloud Logging
- Set up alerts for errors
- Monitor function performance
- Track API usage
- Review security events

### Regular Maintenance Tasks
- Update dependencies monthly
- Review and optimize Firestore indexes
- Clean up unused storage files
- Rotate API keys quarterly
- Review and update security rules

## Support

For deployment issues:
1. Check Firebase Console for error messages
2. Review function logs
3. Consult this documentation
4. Contact the development team

## Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)
- [Firebase Functions Documentation](https://firebase.google.com/docs/functions)
- [Cloud Functions Best Practices](https://firebase.google.com/docs/functions/best-practices)
