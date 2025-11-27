# Quiz Generation Endpoint

## Overview
The `generateQuiz` Cloud Function generates AI-powered quizzes from either knowledge base content or user-provided content.

## Endpoint
- **URL**: `https://generatequiz-el2jwxb5bq-uc.a.run.app` (update after deployment)
- **Method**: POST
- **Region**: us-central1

## Request Body

### Knowledge Base Mode
```json
{
  "mode": "knowledge-base",
  "topic": "systemic-shifts",
  "numQuestions": 5
}
```

### User Content Mode
```json
{
  "mode": "user-content",
  "content": "Your content here...",
  "numQuestions": 5
}
```

### Parameters
- `mode` (required): Either `"knowledge-base"` or `"user-content"`
- `topic` (required if mode is `knowledge-base`): Topic ID from knowledge base
- `content` (required if mode is `user-content`): User-provided content (min 100 chars)
- `numQuestions` (optional): Number of questions to generate (3-20, default: 5)

## Response

### Success
```json
{
  "success": true,
  "quiz": {
    "id": "generated_1234567890",
    "title": "Quiz Title",
    "description": "Quiz description",
    "questions": [
      {
        "question": "Question text",
        "options": {
          "a": "Option A",
          "b": "Option B",
          "c": "Option C",
          "d": "Option D"
        },
        "correctAnswer": "a",
        "explanation": "Explanation text"
      }
    ],
    "metadata": {
      "mode": "knowledge-base",
      "topic": "systemic-shifts",
      "numQuestions": 5,
      "generatedAt": "2025-01-XX...",
      "ragMetadata": { ... }
    }
  }
}
```

### Error
```json
{
  "error": "Error message",
  "details": "Additional error details"
}
```

## Deployment

1. Deploy the function:
```bash
cd functions
firebase deploy --only functions:generateQuiz
```

2. Update the URL in `src/components/QuizAgent/QuizGenerator.js`:
```javascript
const generateQuizUrl = 'https://YOUR-DEPLOYED-URL';
```

## Features

- **RAG Integration**: Uses knowledge base retrieval for context-aware quiz generation
- **Dual Mode**: Supports both knowledge base and user content modes
- **AI-Powered**: Generates questions, options, correct answers, and explanations
- **Validation**: Ensures quiz structure and question validity
- **Security**: Includes prompt injection detection and input sanitization

## Knowledge Base Topics

Available topics for knowledge-base mode:
- `petronas-2.0` - PETRONAS 2.0 content
- `systemic-shifts` - Systemic Shifts overview
- `upstream-target` - Upstream Target
- `key-shifts` - Key Shifts
- `mindset-behaviour` - Mindset & Behaviour
- `our-progress` - Our Progress
- `articles` - Articles

## Notes

- The function uses RAG to retrieve relevant documents from the knowledge base
- Questions are generated with 4 multiple-choice options (A, B, C, D)
- Each question includes an explanation
- The function validates and fixes invalid quiz structures when possible

