# VERA AI Testing Guide & Pre-Deployment Checklist

Comprehensive testing procedures and deployment checklist for the VERA AI platform, including RAG-powered knowledge base, vector embeddings, and specialized AI agents.

## Pre-Deployment Checklist

### Code Quality
- [ ] All linting errors resolved (`npm run lint`)
- [ ] Code builds successfully (`npm run build`)
- [ ] No console errors or warnings in browser
- [ ] All TypeScript/JavaScript errors resolved
- [ ] Unused imports and variables removed
- [ ] Code follows project style guidelines

### Environment Configuration
- [ ] All environment variables set in `.env.local`
- [ ] Firebase secrets configured for Cloud Functions
- [ ] API keys valid and accessible
- [ ] Firebase project linked correctly
- [ ] Firestore rules configured appropriately
- [ ] Storage rules configured appropriately
- [ ] Local image generator service account key configured (`python/firebase-key.json`) - if using local generation
- [ ] Hugging Face API token set (`HF_API_TOKEN` environment variable) - if using local generation
- [ ] Local image generator dependencies installed

### Functionality Testing

#### Core Features
- [ ] Homepage loads correctly
- [ ] Navigation works on all pages
- [ ] Header and footer display properly
- [ ] Responsive design works on mobile/tablet/desktop
- [ ] All links are functional

#### VERA AI Chatbot
- [ ] Chatbot loads and responds
- [ ] RAG retrieval works (answers from knowledge base)
- [ ] Citations display correctly
- [ ] Error handling works for failed requests
- [ ] Streaming responses work correctly
- [ ] Chat history saves and loads
- [ ] Session management works
- [ ] Agent selection works
- [ ] Suggested questions appear
- [ ] Message actions (copy, regenerate) work

#### AI Agents
- [ ] **Analytics Agent**: Data insights and analytics work
- [ ] **Meetings Agent**: Meeting analysis and action items work
- [ ] **Podcast Agent**: Podcast generation works
- [ ] **Content Agent**: Content generation works
- [ ] **Visual Agent**: Image analysis works
- [ ] **Quiz Agent**: Quiz generation works


#### StatsX Dashboard Features
- [ ] Dashboard loads with real-time data
- [ ] All metric cards display correctly
- [ ] Charts render properly
- [ ] Filters and cross-filtering function
- [ ] Real-time updates work via Firestore listeners

#### Knowledge Base Management
- [ ] Knowledge base injector works
- [ ] Manual document entry works
- [ ] File upload works (PDF, DOCX, TXT)
- [ ] Text extraction works
- [ ] Embeddings generate correctly
- [ ] Documents appear in RAG search

#### MeetX (Meetings Agent)
- [ ] Meeting list displays
- [ ] Meeting creation works
- [ ] File upload works
- [ ] AI insights generate
- [ ] Action items extracted correctly

#### ULearn (Podcast Agent)
- [ ] Podcast generation works
- [ ] RAG retrieval for podcasts functions
- [ ] Audio playback works
- [ ] Script generation works

#### Upstream Gallery (Visual Agent)
- [ ] Gallery displays images
- [ ] Upload functionality works
- [ ] Categories filter correctly
- [ ] AI tagging works

### Browser Compatibility
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile browsers (iOS Safari, Chrome Mobile)

### Performance Testing
- [ ] Page load times acceptable (< 3 seconds)
- [ ] Images optimized and load efficiently
- [ ] No memory leaks in browser
- [ ] Cloud Functions respond within timeout limits
- [ ] Firestore queries optimized
- [ ] Bundle size is reasonable

### Security
- [ ] Firestore security rules tested
- [ ] Storage security rules tested
- [ ] Authentication required where needed
- [ ] API keys not exposed in client code
- [ ] CORS configured correctly
- [ ] Input validation on forms
- [ ] Prompt injection protection works
- [ ] XSS prevention works

## Testing Procedures

### Manual Testing

#### 1. VERA AI Chatbot Test

**Test RAG Functionality:**
1. Navigate to VERA page (`/vera`)
2. Ask a question related to PETRONAS or Systemic Shifts
3. Verify answer comes from knowledge base
4. Check citations appear
5. Verify similarity threshold works (low similarity queries don't match)
6. Test streaming responses
7. Test chat history persistence

**Test Agent Selection:**
1. Select different agents from sidebar
2. Verify agent-specific prompts work
3. Test agent switching mid-conversation
4. Verify agent context is maintained

**Test Error Handling:**
1. Disconnect internet and try to send message
2. Verify error message appears
3. Reconnect and verify recovery works

#### 2. Visual Agent Image Analysis Test

1. Navigate to Visual Agent page (`/agents/visual`)
2. Upload an image file
3. Verify image analysis generates
4. Check tags and description are generated correctly
5. Verify AI-generated metadata appears
6. Test with different image types (JPG, PNG, etc.)

#### 3. Knowledge Base Injection Test

1. Navigate to VERA page
2. Open Knowledge Base Injector
3. Test manual entry:
   - Enter title, content, category, tags
   - Submit and verify document appears in knowledge base
4. Test file upload:
   - Upload PDF or DOCX file
   - Verify text extraction works
   - Submit and verify document appears
5. Verify embeddings are generated
6. Test RAG search with new document


#### 5. StatsX Dashboard Test

1. Navigate to StatsX page (`/statsx`)
2. Verify all widgets load correctly
3. Check data displays accurately
4. Test filters and cross-filtering
5. Verify charts render properly
6. Test real-time updates
7. Verify forecasting and anomaly detection work

#### 6. AI Agents Test

**Analytics Agent:**
1. Navigate to Analytics Agent page
2. Upload sample data or use provided sample
3. Verify analysis generates
4. Check insights are relevant

**Meetings Agent:**
1. Navigate to Meetings Agent page
2. Create a new meeting
3. Upload meeting file or enter notes
4. Verify AI insights generate
5. Check action items are extracted

**Podcast Agent:**
1. Navigate to Podcast Agent page
2. Enter topic
3. Generate podcast
4. Verify script and audio are generated
5. Test audio playback

**Content Agent:**
1. Navigate to Content Agent page
2. Enter content requirements
3. Generate content
4. Verify output is relevant

**Visual Agent:**
1. Navigate to Visual Agent page
2. Upload an image
3. Verify analysis generates
4. Check tags and description

**Quiz Agent:**
1. Navigate to Quiz Agent page
2. Select knowledge base or user content mode
3. Generate quiz
4. Verify questions are relevant
5. Check explanations are provided

### Automated Testing (Future)

#### Unit Tests
```bash
npm run test
```

#### Integration Tests
```bash
npm run test:integration
```

#### E2E Tests
```bash
npm run test:e2e
```

## Deployment Testing

### Staging Deployment
1. Deploy to staging environment
2. Run full test suite
3. Verify all features work
4. Check analytics tracking
5. Test error scenarios
6. Verify performance metrics

### Production Deployment
1. Final code review
2. Backup current production
3. Deploy functions first
4. Deploy frontend
5. Monitor for errors
6. Verify critical paths
7. Test rollback procedure

## Post-Deployment Verification

### Immediate Checks (Within 5 minutes)
- [ ] Site loads correctly
- [ ] No console errors
- [ ] Critical features work
- [ ] Firebase Functions respond
- [ ] Database connections work
- [ ] Authentication works

### Extended Monitoring (24 hours)
- [ ] Monitor error logs
- [ ] Check analytics
- [ ] Verify user feedback
- [ ] Monitor performance metrics
- [ ] Check Cloud Function execution times
- [ ] Monitor API usage and system performance

## Error Scenarios to Test

### Network Failures
- [ ] Offline behavior
- [ ] Slow connection handling
- [ ] Request timeout handling
- [ ] Connection recovery

### API Failures
- [ ] Gemini API failure
- [ ] OpenRouter API failure
- [ ] Hugging Face API failure
- [ ] Firestore connection issues
- [ ] Local image generator service stops
- [ ] GPU/CUDA errors in local generator

### Data Validation
- [ ] Invalid form submissions
- [ ] Missing required fields
- [ ] File upload errors
- [ ] Large file handling
- [ ] Malformed data handling

### Security Testing
- [ ] Unauthorized access attempts
- [ ] SQL injection attempts (N/A for Firestore)
- [ ] XSS attempts
- [ ] CSRF protection
- [ ] Prompt injection attempts
- [ ] File upload security

## Performance Benchmarks

### Target Metrics
- **First Contentful Paint**: < 1.5s
- **Time to Interactive**: < 3.5s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1
- **Total Blocking Time**: < 200ms

### Cloud Functions
- **Response Time**: < 5s for most functions
- **Image Generation**: < 60s (local) or < 300s (cloud)
- **Chatbot Response**: < 10s
- **Podcast Generation**: < 60s

### Firestore
- **Query Time**: < 500ms for simple queries
- **Write Time**: < 200ms for single writes
- **Real-time Updates**: < 1s latency

## Browser Testing Checklist

### Desktop
- [ ] Chrome (Windows/Mac)
- [ ] Firefox (Windows/Mac)
- [ ] Safari (Mac)
- [ ] Edge (Windows)

### Mobile
- [ ] iOS Safari
- [ ] Chrome Mobile (Android)
- [ ] Samsung Internet

### Screen Sizes
- [ ] Mobile (375px)
- [ ] Tablet (768px)
- [ ] Desktop (1024px)
- [ ] Large Desktop (1920px)

## Accessibility Testing

- [ ] Keyboard navigation works
- [ ] Screen reader compatibility
- [ ] Color contrast meets WCAG AA
- [ ] Alt text on images
- [ ] Form labels associated correctly
- [ ] Focus indicators visible
- [ ] ARIA labels where needed

## Security Testing

- [ ] XSS prevention
- [ ] CSRF protection
- [ ] SQL injection prevention (N/A for Firestore)
- [ ] Authentication required for sensitive operations
- [ ] API rate limiting
- [ ] Input sanitization
- [ ] Prompt injection protection
- [ ] File upload validation

## Load Testing

### Concurrent Users
- [ ] 10 concurrent users
- [ ] 50 concurrent users
- [ ] 100 concurrent users

### Data Volume
- [ ] Large knowledge base (1000+ documents)
- [ ] Multiple simultaneous chat sessions
- [ ] High volume of agent interactions

## Rollback Plan

If issues are detected:
1. Revert to previous deployment
2. Investigate issue
3. Fix in development
4. Test thoroughly
5. Redeploy

### Rollback Commands

**Frontend:**
```bash
firebase deploy --only hosting --project <project-id>
```

**Functions:**
```bash
firebase deploy --only functions --project <project-id>
```

## Testing Tools

### Recommended Tools
- **Browser DevTools**: For debugging
- **Firebase Console**: For monitoring
- **Postman**: For API testing
- **Lighthouse**: For performance testing
- **WAVE**: For accessibility testing

### Monitoring
- Firebase Console → Functions → Logs
- Firebase Console → Firestore → Usage
- Firebase Console → Storage → Usage
- Browser Console for frontend errors

## Contact

For testing issues or questions, contact the development team.

## Additional Resources

- [Firebase Testing Guide](https://firebase.google.com/docs/emulator-suite)
- [Next.js Testing](https://nextjs.org/docs/testing)
- [React Testing Library](https://testing-library.com/react)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
