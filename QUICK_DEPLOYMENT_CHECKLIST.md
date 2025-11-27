# Quick Deployment Checklist for Agent Try Pages

Use this checklist to ensure all Cloud Functions are deployed correctly.

## ✅ Pre-Deployment Checklist

- [ ] Firebase CLI installed (`firebase --version`)
- [ ] Logged in to Firebase (`firebase login`)
- [ ] Correct project selected (`firebase use <project-id>`)
- [ ] Function dependencies installed (`cd functions && npm install`)
- [ ] Secrets configured:
  - [ ] `GOOGLE_GENAI_API_KEY` set
  - [ ] `OPENROUTER_API_KEY` set

## 🚀 Deployment Options

### Option 1: Use Deployment Script (Easiest)

**Windows (PowerShell):**
```powershell
.\deploy-agent-functions.ps1
```

**Mac/Linux:**
```bash
chmod +x deploy-agent-functions.sh
./deploy-agent-functions.sh
```

### Option 2: Deploy All at Once
```bash
firebase deploy --only functions:generatePodcast,functions:submitStory,functions:analyzeImage,functions:generateQuiz
```

### Option 3: Deploy Individually
```bash
firebase deploy --only functions:generatePodcast
firebase deploy --only functions:submitStory
firebase deploy --only functions:analyzeImage
firebase deploy --only functions:generateQuiz
```

## ✅ Post-Deployment Verification

### 1. Check Function Status
```bash
firebase functions:list
```

Expected output should show all 4 functions:
- ✅ `generatePodcast`
- ✅ `submitStory`
- ✅ `analyzeImage`
- ✅ `generateQuiz`

### 2. Verify Function URLs

Check that the URLs in your try pages match the deployed functions:

**Current URLs in code:**
- Podcast: `https://generatepodcast-el2jwxb5bq-uc.a.run.app`
- Content: `https://submitstory-el2jwxb5bq-uc.a.run.app`
- Visual: `https://analyzeimage-el2jwxb5bq-uc.a.run.app`
- Quiz: `https://generatequiz-el2jwxb5bq-uc.a.run.app`

**Get actual URLs:**
```bash
firebase functions:list
```

If URLs don't match, update them in:
- `src/app/agents/podcast/page.js`
- `src/app/agents/content/page.js`
- `src/app/agents/visual/page.js`
- `src/app/agents/quiz/page.js`

### 3. Test Each Function

#### Test Podcast Generation
```bash
curl -X POST https://generatepodcast-el2jwxb5bq-uc.a.run.app \
  -H "Content-Type: application/json" \
  -d '{"topic":"systemic-shifts","context":"test"}'
```

#### Test Content Generation
```bash
curl -X POST https://submitstory-el2jwxb5bq-uc.a.run.app \
  -H "Content-Type: application/json" \
  -d '{"storyTitle":"Test","storyContent":"Test content","keyShifts":["Digital"],"focusAreas":["Innovation"]}'
```

#### Test Image Analysis
```bash
curl -X POST https://analyzeimage-el2jwxb5bq-uc.a.run.app \
  -H "Content-Type: application/json" \
  -d '{"imageUrl":"https://example.com/image.jpg"}'
```

#### Test Quiz Generation
```bash
curl -X POST https://generatequiz-el2jwxb5bq-uc.a.run.app \
  -H "Content-Type: application/json" \
  -d '{"mode":"knowledge-base","topic":"systemic-shifts","numQuestions":5}'
```

### 4. Test Try Pages

Visit each try page and test with sample data:
- [ ] `/agents/analytics` - Test with sample CSV
- [ ] `/agents/meetings` - Test with sample transcript
- [ ] `/agents/podcast` - Test with knowledge base topic
- [ ] `/agents/content` - Test with sample prompt
- [ ] `/agents/visual` - Test with sample image
- [ ] `/agents/quiz` - Test with knowledge base topic

## 🔧 Troubleshooting

### Function Not Found
```bash
# Check if function exists
firebase functions:describe generatePodcast

# Check deployment logs
firebase functions:log --only generatePodcast
```

### Secret Not Found
```bash
# List all secrets
firebase functions:secrets:access

# Set missing secret
firebase functions:secrets:set GOOGLE_GENAI_API_KEY
firebase functions:secrets:set OPENROUTER_API_KEY
```

### Function Timeout
- Check function logs: `firebase functions:log --only <function-name>`
- Verify API keys are valid
- Check if API calls are taking too long

### CORS Errors
- Functions should have CORS enabled automatically
- Check function logs for CORS-related errors
- Verify function is handling OPTIONS requests

## 📊 Monitoring

### View Real-time Logs
```bash
# All functions
firebase functions:log --follow

# Specific function
firebase functions:log --only generatePodcast --follow
```

### Check Firebase Console
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Functions**
4. Check status and logs for each function

## ✅ Success Criteria

All functions are successfully deployed when:
- ✅ All 4 functions appear in `firebase functions:list`
- ✅ All functions return 200 status on test requests
- ✅ All try pages can successfully call their respective functions
- ✅ No errors in function logs
- ✅ Secrets are properly configured

## 📝 Notes

- Function URLs follow the pattern: `https://[function-name]-[hash]-uc.a.run.app`
- The hash (`el2jwxb5bq`) is your project-specific identifier
- Functions are deployed to `us-central1` region
- All functions have 5-minute timeout (except analyzeImage which has 2 minutes)

