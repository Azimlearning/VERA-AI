// src/app/agents/quiz/page.js
// Quiz Agent Try Page - Interactive quiz generation experience

'use client';

import { useState } from 'react';
import TryPageLayout from '../../../components/agents/TryPageLayout';
import ContentInput from '../../../components/agents/quiz/ContentInput';
import QuizPreview from '../../../components/agents/quiz/QuizPreview';
import ResultsDisplay from '../../../components/agents/ResultsDisplay';
import { FaQuestionCircle } from 'react-icons/fa';

export default function QuizAgentTryPage() {
  const [content, setContent] = useState(null);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showQuiz, setShowQuiz] = useState(false);

  const handleContentSet = (topic, customContent) => {
    setContent({ topic, content: customContent });
    setResults(null);
    setError(null);
  };

  const handleGenerate = async (topic, customContent, numQuestions) => {
    setLoading(true);
    setError(null);
    setResults(null);

    try {
      // Use existing Cloud Function for quiz generation
      const generateQuizUrl = 'https://generatequiz-el2jwxb5bq-uc.a.run.app';
      
      const response = await fetch(generateQuizUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mode: topic ? 'knowledge-base' : 'user-content',
          topic: topic || null,
          content: customContent || null,
          numQuestions
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to generate quiz' }));
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.quiz) {
        setResults(data.quiz);
      } else {
        throw new Error(data.error || 'Failed to generate quiz');
      }
    } catch (err) {
      console.error('Quiz generation error:', err);
      setError(err.message || 'Failed to generate quiz. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleStartQuiz = (quiz) => {
    // Navigate to full quiz page with the generated quiz
    // For now, we'll show it in a modal or navigate to the full page
    setShowQuiz(true);
    // You could also navigate: router.push(`/ulearn/quizzes?quiz=${encodeURIComponent(JSON.stringify(quiz))}`);
  };

  const handleDownload = () => {
    if (!results) return;
    
    const content = JSON.stringify(results, null, 2);
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quiz-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <TryPageLayout
      agentName="Quiz Agent"
      agentBadge={{
        bg: 'bg-pink-100',
        border: 'border-pink-300',
        iconColor: 'text-pink-600',
        textColor: 'text-pink-700'
      }}
      agentIcon={FaQuestionCircle}
      agentColor="pink"
      agentGradient="from-pink-400 to-rose-500"
      description="AI-powered quiz generation. Create quizzes from knowledge base topics or your own content with AI-generated questions and answers."
    >
      <div className="space-y-8">
        {/* Content Input Section */}
        <ContentInput
          onContentSet={handleContentSet}
          onGenerate={handleGenerate}
        />

        {/* Results Section */}
        {content && (
          <ResultsDisplay
            title="Generated Quiz"
            loading={loading}
            error={error}
            onDownload={handleDownload}
            downloadLabel="Download Quiz"
          >
            {results && (
              <QuizPreview
                quiz={results}
                onStartQuiz={handleStartQuiz}
              />
            )}
          </ResultsDisplay>
        )}
      </div>
    </TryPageLayout>
  );
}
