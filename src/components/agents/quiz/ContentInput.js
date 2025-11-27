// src/components/agents/quiz/ContentInput.js
// Content input component for Quiz Agent

'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaDatabase, FaFileAlt, FaQuestionCircle } from 'react-icons/fa';
import SampleDataButton from '../SampleDataButton';
const KNOWLEDGE_BASE_TOPICS = [
  { id: 'petronas-2.0', name: 'PETRONAS 2.0', category: 'petronas-info' },
  { id: 'systemic-shifts', name: 'Systemic Shifts Overview', category: 'systemic-shifts' },
  { id: 'upstream-target', name: 'Upstream Target', category: 'upstream-target' },
  { id: 'key-shifts', name: 'Key Shifts', category: 'systemic-shifts' },
  { id: 'mindset-behaviour', name: 'Mindset & Behaviour', category: 'mindset-behaviour' },
  { id: 'our-progress', name: 'Our Progress', category: 'systemic-shifts' },
  { id: 'articles', name: 'Articles', category: 'articles' },
];

const SAMPLE_CONTENT = `Systemic Shifts Overview

PETRONAS Upstream is undergoing a transformation through "Systemic Shifts" - strategic changes in mindset, behavior, and operations to achieve PETRONAS 2.0 vision by 2035.

Key areas include:
- Portfolio High-Grading: Optimizing asset portfolio for maximum value
- Deliver Advantaged Barrels: Focusing on high-value production
- Operational Excellence: Improving efficiency and safety
- Digital Transformation: Leveraging technology and AI
- Sustainability and Decarbonisation: Reducing environmental impact
- Innovation and Technology: Driving technological advancement
- People and Culture: Developing talent and organizational culture
- Safety and Risk Management: Ensuring safe operations

These shifts represent a comprehensive approach to transforming upstream operations while maintaining focus on value creation and sustainability.`;

export default function ContentInput({ onContentSet, onGenerate }) {
  const [mode, setMode] = useState('knowledge-base'); // 'knowledge-base', 'custom'
  const [selectedTopic, setSelectedTopic] = useState('');
  const [customContent, setCustomContent] = useState('');
  const [numQuestions, setNumQuestions] = useState(5);

  const handleLoadSample = () => {
    setCustomContent(SAMPLE_CONTENT);
    setMode('custom');
    onContentSet && onContentSet(null, SAMPLE_CONTENT);
  };

  const handleGenerate = () => {
    if (mode === 'knowledge-base' && !selectedTopic) {
      alert('Please select a topic from the knowledge base');
      return;
    }
    if (mode === 'custom' && !customContent.trim()) {
      alert('Please provide content');
      return;
    }

    const topic = mode === 'knowledge-base' ? selectedTopic : null;
    const content = mode === 'custom' ? customContent : null;
    
    onGenerate && onGenerate(topic, content, numQuestions);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 md:p-8">
      <h3 className="text-2xl font-bold text-gray-900 mb-4">Generate Quiz from Content</h3>
      
      {/* Mode Selector */}
      <div className="flex gap-2 mb-6 p-1 bg-gray-100 rounded-lg">
        <button
          onClick={() => setMode('knowledge-base')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            mode === 'knowledge-base' ? 'bg-pink-600 text-white' : 'text-gray-700 hover:bg-gray-200'
          }`}
        >
          <FaDatabase className="inline-block mr-2" />
          Knowledge Base
        </button>
        <button
          onClick={() => setMode('custom')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            mode === 'custom' ? 'bg-pink-600 text-white' : 'text-gray-700 hover:bg-gray-200'
          }`}
        >
          <FaFileAlt className="inline-block mr-2" />
          Custom Content
        </button>
      </div>

      {/* Sample Content Button */}
      <div className="mb-6">
        <SampleDataButton
          onClick={handleLoadSample}
          label="Try with Sample Content"
        />
      </div>

      {/* Knowledge Base Selection */}
      {mode === 'knowledge-base' && (
        <div className="mb-6">
          <label htmlFor="kb-topic" className="block text-sm font-medium text-gray-700 mb-2">
            Select Topic from Knowledge Base
          </label>
          <select
            id="kb-topic"
            value={selectedTopic}
            onChange={(e) => {
              setSelectedTopic(e.target.value);
              onContentSet && onContentSet(e.target.value, null);
            }}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
          >
            <option value="">Select a topic...</option>
            {KNOWLEDGE_BASE_TOPICS.map((topic) => (
              <option key={topic.id} value={topic.id}>
                {topic.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Custom Content Input */}
      {mode === 'custom' && (
        <div className="mb-6">
          <label htmlFor="custom-content" className="block text-sm font-medium text-gray-700 mb-2">
            Paste Your Content
          </label>
          <textarea
            id="custom-content"
            value={customContent}
            onChange={(e) => {
              setCustomContent(e.target.value);
              onContentSet && onContentSet(null, e.target.value);
            }}
            placeholder="Paste the content you want to generate a quiz from..."
            rows={8}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 resize-y"
          />
          <p className="text-xs text-gray-500 mt-2">
            {customContent.length} characters (minimum 100 required)
          </p>
        </div>
      )}

      {/* Number of Questions */}
      <div className="mb-6">
        <label htmlFor="num-questions" className="block text-sm font-medium text-gray-700 mb-2">
          Number of Questions
        </label>
        <input
          type="number"
          id="num-questions"
          min="1"
          max="10"
          value={numQuestions}
          onChange={(e) => setNumQuestions(Math.max(1, Math.min(10, parseInt(e.target.value) || 5)))}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
        />
      </div>

      {/* Generate Button */}
      <button
        onClick={handleGenerate}
        disabled={(mode === 'knowledge-base' && !selectedTopic) || (mode === 'custom' && (!customContent.trim() || customContent.length < 100))}
        className="w-full bg-gradient-to-r from-pink-600 to-rose-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-pink-700 hover:to-rose-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        <FaQuestionCircle />
        <span>Generate Quiz</span>
      </button>
    </div>
  );
}

