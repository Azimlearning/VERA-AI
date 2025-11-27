// src/components/QuizAgent/QuizGenerator.js
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaDatabase, FaFileAlt, FaSpinner, FaCheckCircle } from 'react-icons/fa';

const KNOWLEDGE_BASE_TOPICS = [
  { id: 'petronas-2.0', name: 'PETRONAS 2.0', category: 'petronas-info' },
  { id: 'systemic-shifts', name: 'Systemic Shifts Overview', category: 'systemic-shifts' },
  { id: 'upstream-target', name: 'Upstream Target', category: 'upstream-target' },
  { id: 'key-shifts', name: 'Key Shifts', category: 'systemic-shifts' },
  { id: 'mindset-behaviour', name: 'Mindset & Behaviour', category: 'mindset-behaviour' },
  { id: 'our-progress', name: 'Our Progress', category: 'systemic-shifts' },
  { id: 'articles', name: 'Articles', category: 'articles' },
];

export default function QuizGenerator({ onQuizGenerated }) {
  const [mode, setMode] = useState('knowledge-base'); // 'knowledge-base' or 'user-content'
  const [selectedTopic, setSelectedTopic] = useState('');
  const [userContent, setUserContent] = useState('');
  const [numQuestions, setNumQuestions] = useState(5);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    setGenerating(true);
    setError('');

    try {
      // This will call a Cloud Function endpoint for quiz generation
      // For now, we'll create a placeholder structure
      // Cloud Function URL - Update this after deployment
      const generateQuizUrl = 'https://generatequiz-el2jwxb5bq-uc.a.run.app';
      
      const response = await fetch(generateQuizUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mode,
          topic: mode === 'knowledge-base' ? selectedTopic : null,
          content: mode === 'user-content' ? userContent : null,
          numQuestions,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to generate quiz' }));
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success && data.quiz) {
        onQuizGenerated && onQuizGenerated(data.quiz);
      } else {
        throw new Error(data.error || 'Failed to generate quiz');
      }
    } catch (err) {
      console.error('Error generating quiz:', err);
      setError(err.message || 'Failed to generate quiz. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Generate New Quiz</h3>
        <p className="text-gray-600">Create a quiz using AI from knowledge base or your content</p>
      </div>

      {/* Mode Toggle */}
      <div className="mb-6">
        <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
          <button
            onClick={() => {
              setMode('knowledge-base');
              setError('');
            }}
            className={`flex-1 px-4 py-2 rounded-md font-semibold transition-all ${
              mode === 'knowledge-base'
                ? 'bg-teal-600 text-white shadow-md'
                : 'text-gray-700 hover:bg-gray-200'
            }`}
          >
            <FaDatabase className="inline mr-2" />
            From Knowledge Base
          </button>
          <button
            onClick={() => {
              setMode('user-content');
              setError('');
            }}
            className={`flex-1 px-4 py-2 rounded-md font-semibold transition-all ${
              mode === 'user-content'
                ? 'bg-teal-600 text-white shadow-md'
                : 'text-gray-700 hover:bg-gray-200'
            }`}
          >
            <FaFileAlt className="inline mr-2" />
            From Your Content
          </button>
        </div>
      </div>

      {/* Knowledge Base Mode */}
      {mode === 'knowledge-base' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Topic
            </label>
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900"
            >
              <option value="">Choose a topic...</option>
              {KNOWLEDGE_BASE_TOPICS.map((topic) => (
                <option key={topic.id} value={topic.id}>
                  {topic.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* User Content Mode */}
      {mode === 'user-content' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Enter Content
            </label>
            <textarea
              value={userContent}
              onChange={(e) => setUserContent(e.target.value)}
              placeholder="Paste or type the content you want to create a quiz from..."
              rows={8}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900 resize-none"
            />
            <p className="text-xs text-gray-500 mt-1">
              The AI will analyze your content and generate relevant quiz questions
            </p>
          </div>
        </div>
      )}

      {/* Number of Questions */}
      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Number of Questions
        </label>
        <input
          type="number"
          min="3"
          max="20"
          value={numQuestions}
          onChange={(e) => setNumQuestions(parseInt(e.target.value) || 5)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900"
        />
      </div>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800"
        >
          <p className="text-sm">{error}</p>
        </motion.div>
      )}

      {/* Generate Button */}
      <button
        onClick={handleGenerate}
        disabled={generating || (mode === 'knowledge-base' && !selectedTopic) || (mode === 'user-content' && !userContent.trim())}
        className="mt-6 w-full bg-purple-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-purple-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {generating ? (
          <>
            <FaSpinner className="animate-spin" />
            Generating Quiz...
          </>
        ) : (
          <>
            <FaCheckCircle />
            Generate Quiz
          </>
        )}
      </button>

      {/* Info Note */}
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-xs text-blue-800">
          <strong>Note:</strong> Quiz generation uses RAG (Retrieval-Augmented Generation) to access our knowledge base and create contextually relevant questions with explanations.
        </p>
      </div>
    </div>
  );
}

