// src/components/agents/content/PromptInput.js
// Prompt input component for Content Agent

'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaFileAlt, FaImage, FaMagic } from 'react-icons/fa';
import SampleDataButton from '../SampleDataButton';

const SAMPLE_PROMPTS = [
  'Create a story about digital transformation in upstream operations',
  'Generate content about sustainability initiatives at PETRONAS',
  'Write about operational excellence best practices',
  'Create a visual story about portfolio high-grading',
  'Generate content on innovation in upstream technology'
];

export default function PromptInput({ onPromptSet, onGenerate }) {
  const [prompt, setPrompt] = useState('');
  const [generationType, setGenerationType] = useState('both'); // 'content', 'image', 'both'
  const [referenceImage, setReferenceImage] = useState(null);

  const handleLoadSample = (samplePrompt) => {
    setPrompt(samplePrompt);
    onPromptSet && onPromptSet(samplePrompt, generationType);
  };

  const handleGenerate = () => {
    if (!prompt.trim()) {
      alert('Please enter a prompt');
      return;
    }
    onGenerate && onGenerate(prompt, generationType, referenceImage);
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setReferenceImage(e.target.result);
      };
      reader.readAsDataURL(file);
    } else {
      alert('Please select an image file');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 md:p-8">
      <h3 className="text-2xl font-bold text-gray-900 mb-4">Create Content & Images</h3>
      
      {/* Generation Type Selector */}
      <div className="flex gap-2 mb-6 p-1 bg-gray-100 rounded-lg">
        <button
          onClick={() => setGenerationType('content')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            generationType === 'content' ? 'bg-green-600 text-white' : 'text-gray-700 hover:bg-gray-200'
          }`}
        >
          <FaFileAlt className="inline-block mr-2" />
          Content Only
        </button>
        <button
          onClick={() => setGenerationType('image')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            generationType === 'image' ? 'bg-green-600 text-white' : 'text-gray-700 hover:bg-gray-200'
          }`}
        >
          <FaImage className="inline-block mr-2" />
          Image Only
        </button>
        <button
          onClick={() => setGenerationType('both')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            generationType === 'both' ? 'bg-green-600 text-white' : 'text-gray-700 hover:bg-gray-200'
          }`}
        >
          <FaMagic className="inline-block mr-2" />
          Both
        </button>
      </div>

      {/* Sample Prompts */}
      <div className="mb-6">
        <p className="text-sm text-gray-600 mb-2">Try sample prompts:</p>
        <div className="flex flex-wrap gap-2">
          {SAMPLE_PROMPTS.slice(0, 3).map((samplePrompt, idx) => (
            <SampleDataButton
              key={idx}
              onClick={() => handleLoadSample(samplePrompt)}
              label={samplePrompt.substring(0, 40) + '...'}
              className="text-xs"
            />
          ))}
        </div>
      </div>

      {/* Prompt Input */}
      <div className="mb-6">
        <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 mb-2">
          Content Prompt
        </label>
        <textarea
          id="prompt"
          value={prompt}
          onChange={(e) => {
            setPrompt(e.target.value);
            onPromptSet && onPromptSet(e.target.value, generationType);
          }}
          placeholder="Describe what you want to create... (e.g., 'A story about digital transformation in upstream operations')"
          rows={4}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-y"
        />
      </div>

      {/* Reference Image (Optional) */}
      {(generationType === 'image' || generationType === 'both') && (
        <div className="mb-6">
          <label htmlFor="reference-image" className="block text-sm font-medium text-gray-700 mb-2">
            Reference Image (Optional)
          </label>
          <input
            id="reference-image"
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          {referenceImage && (
            <div className="mt-2">
              <img src={referenceImage} alt="Reference" className="max-w-xs rounded-lg border border-gray-200" />
            </div>
          )}
        </div>
      )}

      {/* Generate Button */}
      <button
        onClick={handleGenerate}
        disabled={!prompt.trim()}
        className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        <FaMagic />
        <span>Generate {generationType === 'content' ? 'Content' : generationType === 'image' ? 'Image' : 'Content & Image'}</span>
      </button>
    </div>
  );
}

