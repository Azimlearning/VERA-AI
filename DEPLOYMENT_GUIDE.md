# Cloud Function Deployment Guide

## Quiz Generation Endpoint

### Files Created
1. **`functions/generateQuiz.js`** - Main Cloud Function for quiz generation
2. **`functions/QUIZ_ENDPOINT_README.md`** - Detailed endpoint documentation
3. **`src/components/QuizAgent/QuizGenerator.js`** - Frontend component (already created)

### Deployment Steps

1. **Navigate to functions directory:**
```bash
cd functions
```

2. **Deploy the function:**
```bash
firebase deploy --only functions:generateQuiz
```

3. **Get the deployed URL:**
After deployment, Firebase will output the function URL. It will look like:
```
https://generatequiz-XXXXX-uc.a.run.app
```

4. **Update the frontend component:**
Edit `src/components/QuizAgent/QuizGenerator.js` and update the URL:
```javascript
const generateQuizUrl = 'https://YOUR-ACTUAL-DEPLOYED-URL';
```

### Function Configuration
- **Region**: us-central1
- **Timeout**: 300 seconds (5 minutes)
- **Memory**: 1GiB
- **Secrets Required**: 
  - `GOOGLE_GENAI_API_KEY`
  - `OPENROUTER_API_KEY`

### Testing

#### Test Knowledge Base Mode
```bash
curl -X POST https://YOUR-URL/generateQuiz \
  -H "Content-Type: application/json" \
  -d '{
    "mode": "knowledge-base",
    "topic": "systemic-shifts",
    "numQuestions": 5
  }'
```

#### Test User Content Mode
```bash
curl -X POST https://YOUR-URL/generateQuiz \
  -H "Content-Type: application/json" \
  -d '{
    "mode": "user-content",
    "content": "Your content here...",
    "numQuestions": 5
  }'
```

### Features
- ✅ RAG-powered knowledge base retrieval
- ✅ User content mode support
- ✅ AI-generated questions with explanations
- ✅ Input validation and sanitization
- ✅ Prompt injection detection
- ✅ Error handling and logging

### Troubleshooting

**Issue**: Function not found after deployment
- **Solution**: Check Firebase console for deployment status
- Verify function name matches: `generateQuiz`

**Issue**: RAG retrieval returns no documents
- **Solution**: Ensure knowledge base has documents with embeddings
- Run `generateEmbeddings` function to populate embeddings

**Issue**: AI response not valid JSON
- **Solution**: The function includes JSON parsing with fallback handling
- Check logs for AI response format issues

### Next Steps
1. Deploy the function
2. Update the frontend URL
3. Test both modes
4. Monitor Firebase logs for any issues

