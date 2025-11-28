// src/components/agents/quiz/QuizPreview.js
// Interactive Quiz Component - Tier 1 Learning Experience

'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaQuestionCircle, FaPlay, FaDownload, FaCheck, FaTimes, FaRedo, FaArrowRight } from 'react-icons/fa';

export default function QuizPreview({ quiz, onStartQuiz, loading }) {
  const [quizState, setQuizState] = useState('cover'); // 'cover' | 'active' | 'complete'
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState(0);
  const [answerHistory, setAnswerHistory] = useState([]);

  // Reset quiz when quiz prop changes
  useEffect(() => {
    if (quiz) {
      setQuizState('cover');
      setCurrentQuestionIndex(0);
      setSelectedAnswers({});
      setShowFeedback(false);
      setScore(0);
      setAnswerHistory([]);
    }
  }, [quiz]);


  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  if (!quiz || !quiz.questions || quiz.questions.length === 0) {
    return null;
  }

  const totalQuestions = quiz.questions.length;
  const currentQuestion = quiz.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;

  const handleStartQuiz = () => {
    setQuizState('active');
    setCurrentQuestionIndex(0);
    setShowFeedback(false);
  };

  const handleAnswerSelect = (optionKey) => {
    if (showFeedback) return; // Prevent re-selection after feedback shown

    const isCorrect = optionKey.toLowerCase() === currentQuestion.correctAnswer.toLowerCase();
    const newScore = isCorrect ? score + 1 : score;
    
    setSelectedAnswers({ ...selectedAnswers, [currentQuestionIndex]: optionKey });
    setScore(newScore);
    setShowFeedback(true);

    // Record answer for results screen
    setAnswerHistory([
      ...answerHistory,
      {
        questionIndex: currentQuestionIndex,
        selectedAnswer: optionKey,
        correctAnswer: currentQuestion.correctAnswer,
        isCorrect,
        question: currentQuestion.question,
        explanation: currentQuestion.explanation
      }
    ]);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setShowFeedback(false);
    } else {
      // Quiz complete
      setQuizState('complete');
      setShowFeedback(false);
    }
  };


  const handleRetakeQuiz = () => {
    setQuizState('cover');
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setShowFeedback(false);
    setScore(0);
    setAnswerHistory([]);
  };

  const handleDownload = () => {
    const content = JSON.stringify(quiz, null, 2);
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

  // Cover Sheet View
  if (quizState === 'cover') {
    const estimatedMinutes = Math.ceil(totalQuestions * 1.5);
    const selectedAnswer = selectedAnswers[currentQuestionIndex];
    const isCorrect = selectedAnswer && selectedAnswer.toLowerCase() === currentQuestion?.correctAnswer?.toLowerCase();

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="quiz-cover-container"
      >
        {/* Quiz Header - Large Icon + Title */}
        <div className="quiz-header-large">
          <div className="quiz-icon-large">
            🧠
          </div>
          <h1 className="quiz-title-large">{quiz.title || 'Generated Quiz'}</h1>
          {quiz.description && (
            <p className="quiz-description-large">{quiz.description}</p>
          )}
        </div>

        {/* Metadata Pills */}
        <div className="quiz-stats-row">
          <div className="stat-pill">
            ⚡ {totalQuestions} {totalQuestions === 1 ? 'Question' : 'Questions'}
          </div>
          <div className="stat-pill">
            ⏱️ {estimatedMinutes} {estimatedMinutes === 1 ? 'Min' : 'Mins'}
          </div>
          <div className="stat-pill">
            📚 Knowledge Check
          </div>
        </div>

        {/* Start Button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="quiz-start-button-container"
        >
          <button
            onClick={handleStartQuiz}
            className="start-quiz-btn"
          >
            <FaPlay className="w-5 h-5" />
            <span>Start Assessment</span>
          </button>
        </motion.div>
      </motion.div>
    );
  }

  // Active Quiz View - One Question at a Time
  if (quizState === 'active') {
    const selectedAnswer = selectedAnswers[currentQuestionIndex];
    const isCorrect = selectedAnswer && selectedAnswer.toLowerCase() === currentQuestion?.correctAnswer?.toLowerCase();

    return (
      <div className="quiz-active-container">
        {/* Progress Header */}
        <div className="quiz-progress-header">
          <div className="quiz-progress-info">
            <span className="quiz-progress-text">
              Question {currentQuestionIndex + 1} of {totalQuestions}
            </span>
          </div>
          <div className="quiz-progress-bar-container">
            <div 
              className="quiz-progress-bar-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question Section */}
        <motion.div
          key={currentQuestionIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="quiz-question-section"
        >
          <h2 className="quiz-question-text">{currentQuestion.question}</h2>

          {/* Option Cards */}
          <div className="quiz-options-container">
            {Object.entries(currentQuestion.options || {}).map(([key, value]) => {
              const isSelected = selectedAnswer === key;
              const isCorrectOption = key.toLowerCase() === currentQuestion.correctAnswer.toLowerCase();
              const showResult = showFeedback && (isSelected || isCorrectOption);

              let cardClass = 'quiz-option-card';
              if (showResult) {
                if (isCorrectOption) {
                  cardClass += ' correct';
                } else if (isSelected && !isCorrect) {
                  cardClass += ' incorrect';
                }
              } else if (isSelected) {
                cardClass += ' selected';
              }

              return (
                <button
                  key={key}
                  onClick={() => handleAnswerSelect(key)}
                  disabled={showFeedback}
                  className={cardClass}
                >
                  <span className="quiz-option-label">{key.toUpperCase()}.</span>
                  <span className="quiz-option-text">{value}</span>
                  {showResult && isCorrectOption && (
                    <FaCheck className="quiz-option-icon quiz-option-icon-correct" />
                  )}
                  {showResult && isSelected && !isCorrect && (
                    <FaTimes className="quiz-option-icon quiz-option-icon-incorrect" />
                  )}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Feedback Footer - Sticky at bottom */}
        {showFeedback && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="quiz-feedback-bar-container"
          >
            <QuizFeedback
              quiz={quiz}
              currentQuestionIndex={currentQuestionIndex}
              selectedAnswers={selectedAnswers}
              showFeedback={showFeedback}
              onNext={handleNextQuestion}
            />
          </motion.div>
        )}
      </div>
    );
  }

  // Results Screen
  if (quizState === 'complete') {
    const percentage = Math.round((score / totalQuestions) * 100);
    const scoreEmoji = percentage >= 80 ? '🎉' : percentage >= 60 ? '👍' : '📚';

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="quiz-results-container"
      >
        {/* Score Display */}
        <div className="quiz-results-score">
          <div className="quiz-results-emoji">{scoreEmoji}</div>
          <h1 className="quiz-results-title">
            You got {score} out of {totalQuestions}!
          </h1>
          <div className="quiz-results-percentage">{percentage}%</div>
        </div>

        {/* Performance Breakdown */}
        <div className="quiz-results-breakdown">
          <h3 className="quiz-results-breakdown-title">Performance Breakdown</h3>
          <div className="quiz-results-questions">
            {quiz.questions.map((question, idx) => {
              const answerData = answerHistory.find(h => h.questionIndex === idx);
              const isCorrect = answerData?.isCorrect || false;

              return (
                <div
                  key={idx}
                  className={`quiz-results-question ${isCorrect ? 'correct' : 'incorrect'}`}
                >
                  <div className="quiz-results-question-header">
                    <div className="quiz-results-question-number">
                      {isCorrect ? <FaCheck className="text-green-600" /> : <FaTimes className="text-red-600" />}
                      <span>Question {idx + 1}</span>
                    </div>
                  </div>
                  <p className="quiz-results-question-text">{question.question}</p>
                  {answerData && (
                    <div className="quiz-results-question-details">
                      <div className={`quiz-results-answer ${isCorrect ? 'correct' : 'incorrect'}`}>
                        Your answer: {answerData.selectedAnswer.toUpperCase()}
                        {!isCorrect && (
                          <span className="quiz-results-correct-answer">
                            (Correct: {question.correctAnswer.toUpperCase()})
                          </span>
                        )}
                      </div>
                      <p className="quiz-results-explanation">{question.explanation}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="quiz-results-actions">
          <button
            onClick={handleRetakeQuiz}
            className="quiz-results-btn quiz-results-btn-primary"
          >
            <FaRedo />
            <span>Retake Quiz</span>
          </button>
          <button
            onClick={handleDownload}
            className="quiz-results-btn quiz-results-btn-secondary"
          >
            <FaDownload />
            <span>Download Results</span>
          </button>
        </div>
      </motion.div>
    );
  }

  return null;
}

// Export feedback component for ArtifactPanel
export function QuizFeedback({ 
  quiz, 
  currentQuestionIndex, 
  selectedAnswers, 
  showFeedback,
  onNext 
}) {
  if (!showFeedback || !quiz || !quiz.questions) return null;

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const selectedAnswer = selectedAnswers[currentQuestionIndex];
  const isCorrect = selectedAnswer && selectedAnswer.toLowerCase() === currentQuestion?.correctAnswer?.toLowerCase();
  const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;

  return (
    <div className={`quiz-feedback-bar ${isCorrect ? 'correct' : 'incorrect'}`}>
      <div className="quiz-feedback-content">
        <div className="quiz-feedback-icon">
          {isCorrect ? '✅' : '❌'}
        </div>
        <div className="quiz-feedback-text">
          <div className="quiz-feedback-message">
            {isCorrect ? 'Correct!' : 'Incorrect'}
          </div>
          {currentQuestion.explanation && (
            <div className="quiz-feedback-explanation">
              {currentQuestion.explanation}
            </div>
          )}
        </div>
      </div>
      <button
        onClick={onNext}
        className="quiz-feedback-next-btn"
      >
        {isLastQuestion ? 'View Results' : 'Next Question'}
        <FaArrowRight className="ml-2" />
      </button>
    </div>
  );
}
