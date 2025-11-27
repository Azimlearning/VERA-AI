// src/components/agents/podcast/TopicInput.js
// Topic input component for Podcast Agent

'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaPodcast, FaDatabase, FaFileAlt } from 'react-icons/fa';
import SampleDataButton from '../SampleDataButton';
import { KNOWLEDGE_BASE_TOPICS, SAMPLE_TOPICS } from './SampleData';

export default function TopicInput({ onTopicSelected, onGenerate }) {
  const [inputMethod, setInputMethod] = useState('knowledge-base'); // 'knowledge-base', 'custom', 'sample'
  const [selectedTopic, setSelectedTopic] = useState('');
  const [customTopic, setCustomTopic] = useState('');
  const [customContent, setCustomContent] = useState('');

  const handleLoadSample = (sampleTopic) => {
    setCustomTopic(sampleTopic);
    setInputMethod('custom');
    onTopicSelected && onTopicSelected(sampleTopic, null);
  };

  const handleGenerate = () => {
    if (inputMethod === 'knowledge-base' && !selectedTopic) {
      alert('Please select a topic from the knowledge base');
      return;
    }
    if (inputMethod === 'custom' && !customTopic.trim()) {
      alert('Please enter a topic');
      return;
    }

    const topic = inputMethod === 'knowledge-base' ? selectedTopic : customTopic;
    const content = inputMethod === 'custom' ? customContent : null;
    
    onGenerate && onGenerate(topic, content);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 md:p-8">
      <h3 className="text-2xl font-bold text-gray-900 mb-4">Choose Your Podcast Topic</h3>
      
      {/* Input Method Selector */}
      <div className="flex gap-2 mb-6 p-1 bg-gray-100 rounded-lg">
        <button
          onClick={() => setInputMethod('knowledge-base')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            inputMethod === 'knowledge-base' ? 'bg-orange-600 text-white' : 'text-gray-700 hover:bg-gray-200'
          }`}
        >
          <FaDatabase className="inline-block mr-2" />
          Knowledge Base
        </button>
        <button
          onClick={() => setInputMethod('custom')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            inputMethod === 'custom' ? 'bg-orange-600 text-white' : 'text-gray-700 hover:bg-gray-200'
          }`}
        >
          <FaFileAlt className="inline-block mr-2" />
          Custom Topic
        </button>
      </div>

      {/* Sample Topics */}
      <div className="mb-6">
        <p className="text-sm text-gray-600 mb-2">Quick samples:</p>
        <div className="flex flex-wrap gap-2">
          {SAMPLE_TOPICS.slice(0, 3).map((topic, idx) => (
            <SampleDataButton
              key={idx}
              onClick={() => handleLoadSample(topic)}
              label={topic}
              className="text-xs"
            />
          ))}
        </div>
      </div>

      {/* Knowledge Base Selection */}
      {inputMethod === 'knowledge-base' && (
        <div className="mb-6">
          <label htmlFor="kb-topic" className="block text-sm font-medium text-gray-700 mb-2">
            Select Topic from Knowledge Base
          </label>
          <select
            id="kb-topic"
            value={selectedTopic}
            onChange={(e) => {
              setSelectedTopic(e.target.value);
              onTopicSelected && onTopicSelected(e.target.value, null);
            }}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="">Select a topic...</option>
            {KNOWLEDGE_BASE_TOPICS.map((topic) => (
              <option key={topic.id} value={topic.id}>
                {topic.name} - {topic.description}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Custom Topic Input */}
      {inputMethod === 'custom' && (
        <div className="mb-6 space-y-4">
          <div>
            <label htmlFor="custom-topic" className="block text-sm font-medium text-gray-700 mb-2">
              Podcast Topic
            </label>
            <input
              id="custom-topic"
              type="text"
              value={customTopic}
              onChange={(e) => {
                setCustomTopic(e.target.value);
                onTopicSelected && onTopicSelected(e.target.value, customContent);
              }}
              placeholder="e.g., Digital Transformation in Upstream"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <div>
            <label htmlFor="custom-content" className="block text-sm font-medium text-gray-700 mb-2">
              Additional Content (Optional)
            </label>
            <textarea
              id="custom-content"
              value={customContent}
              onChange={(e) => {
                setCustomContent(e.target.value);
                onTopicSelected && onTopicSelected(customTopic, e.target.value);
              }}
              placeholder="Provide additional context, specific points to cover, or content to base the podcast on..."
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 resize-y"
            />
          </div>
        </div>
      )}

      {/* Generate Button */}
      <button
        onClick={handleGenerate}
        disabled={(inputMethod === 'knowledge-base' && !selectedTopic) || (inputMethod === 'custom' && !customTopic.trim())}
        className="w-full bg-gradient-to-r from-orange-600 to-red-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-orange-700 hover:to-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        <FaPodcast />
        <span>Generate Podcast Script</span>
      </button>
    </div>
  );
}

