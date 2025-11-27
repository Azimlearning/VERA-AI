// src/components/agents/quiz/QuizPreview.js
// Quiz preview component for Quiz Agent

'use client';

import { motion } from 'framer-motion';
import { FaQuestionCircle, FaPlay, FaDownload } from 'react-icons/fa';
import Link from 'next/link';

export default function QuizPreview({ quiz, onStartQuiz, loading }) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  if (!quiz) {
    return null;
  }

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

  return (
    <div className="space-y-6">
      {/* Quiz Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-xl p-6 border border-pink-200"
      >
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FaQuestionCircle className="text-pink-600" />
            {quiz.title || 'Generated Quiz'}
          </h4>
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors text-sm"
          >
            <FaDownload />
            <span>Download</span>
          </button>
        </div>
        {quiz.description && (
          <p className="text-gray-700 mb-4">{quiz.description}</p>
        )}
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span>{quiz.questions?.length || 0} Questions</span>
          <span>•</span>
          <span>~{Math.ceil((quiz.questions?.length || 0) * 2)} minutes</span>
        </div>
      </motion.div>

      {/* Questions Preview */}
      {quiz.questions && quiz.questions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl p-6 border border-gray-200"
        >
          <h4 className="text-xl font-bold text-gray-900 mb-4">Questions Preview</h4>
          <div className="space-y-4">
            {quiz.questions.slice(0, 3).map((question, idx) => (
              <div key={idx} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="font-semibold text-gray-900 mb-2">
                  {idx + 1}. {question.question}
                </p>
                <div className="space-y-1 ml-4">
                  {Object.entries(question.options || {}).map(([key, value]) => (
                    <p key={key} className="text-sm text-gray-600">
                      {key}. {value}
                    </p>
                  ))}
                </div>
                <p className="text-xs text-green-600 mt-2">
                  ✓ Correct: {question.correctAnswer}
                </p>
              </div>
            ))}
            {quiz.questions.length > 3 && (
              <p className="text-sm text-gray-500 text-center">
                ... and {quiz.questions.length - 3} more questions
              </p>
            )}
          </div>
        </motion.div>
      )}

      {/* Start Quiz Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-center"
      >
        <button
          onClick={() => onStartQuiz && onStartQuiz(quiz)}
          className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-pink-600 to-rose-600 text-white font-semibold rounded-lg hover:from-pink-700 hover:to-rose-700 transition-all"
        >
          <FaPlay />
          <span>Start Quiz</span>
        </button>
      </motion.div>
    </div>
  );
}

