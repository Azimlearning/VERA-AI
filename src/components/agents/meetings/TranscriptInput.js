// src/components/agents/meetings/TranscriptInput.js
// Transcript input component for Meetings Agent

'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { FaUpload, FaFileAlt, FaPaste, FaTimes } from 'react-icons/fa';
import SampleDataButton from '../SampleDataButton';
import { SAMPLE_MEETING_TRANSCRIPT, SAMPLE_MEETING_SHORT } from './SampleData';

export default function TranscriptInput({ onTranscriptLoaded, onAnalyze }) {
  const [inputMethod, setInputMethod] = useState('paste');
  const [transcript, setTranscript] = useState('');
  const [fileData, setFileData] = useState(null);
  const [fileName, setFileName] = useState('');
  const fileInputRef = useRef(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();

    reader.onload = (e) => {
      const content = e.target.result;
      setFileData({ file, content });
      setTranscript(content);
      onTranscriptLoaded && onTranscriptLoaded(content);
    };

    reader.readAsText(file);
  };

  const handleLoadSample = (sampleType) => {
    const sample = sampleType === 'full' ? SAMPLE_MEETING_TRANSCRIPT : SAMPLE_MEETING_SHORT;
    setTranscript(sample);
    setInputMethod('paste');
    onTranscriptLoaded && onTranscriptLoaded(sample);
  };

  const handleAnalyze = () => {
    const transcriptToAnalyze = inputMethod === 'file' ? fileData?.content : transcript;
    if (!transcriptToAnalyze || transcriptToAnalyze.trim().length === 0) {
      alert('Please provide a meeting transcript to analyze');
      return;
    }
    onAnalyze && onAnalyze(transcriptToAnalyze);
  };

  const clearData = () => {
    setTranscript('');
    setFileData(null);
    setFileName('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 md:p-8">
      <h3 className="text-2xl font-bold text-gray-900 mb-4">Input Meeting Transcript</h3>
      
      {/* Input Method Selector */}
      <div className="flex gap-2 mb-6 p-1 bg-gray-100 rounded-lg">
        <button
          onClick={() => setInputMethod('paste')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            inputMethod === 'paste' ? 'bg-purple-600 text-white' : 'text-gray-700 hover:bg-gray-200'
          }`}
        >
          <FaPaste className="inline-block mr-2" />
          Paste Transcript
        </button>
        <button
          onClick={() => setInputMethod('file')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            inputMethod === 'file' ? 'bg-purple-600 text-white' : 'text-gray-700 hover:bg-gray-200'
          }`}
        >
          <FaUpload className="inline-block mr-2" />
          Upload File
        </button>
      </div>

      {/* Sample Data Buttons */}
      <div className="mb-6 flex flex-wrap gap-2">
        <SampleDataButton
          onClick={() => handleLoadSample('full')}
          label="Try with Full Sample"
        />
        <SampleDataButton
          onClick={() => handleLoadSample('short')}
          label="Try with Short Sample"
        />
      </div>

      {/* File Upload */}
      {inputMethod === 'file' && (
        <div className="mb-6">
          <label className="block mb-2">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-purple-400 transition-colors cursor-pointer">
              <FaUpload className="text-4xl text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">Click to upload or drag and drop</p>
              <p className="text-sm text-gray-500">Text or document files</p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.doc,.docx"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          </label>
          {fileName && (
            <div className="flex items-center gap-2 mt-2">
              <FaFileAlt className="text-purple-600" />
              <span className="text-sm text-gray-700">{fileName}</span>
              <button
                onClick={clearData}
                className="ml-auto text-red-600 hover:text-red-700"
              >
                <FaTimes />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Text Input */}
      {inputMethod === 'paste' && (
        <div className="mb-6">
          <textarea
            value={transcript}
            onChange={(e) => {
              setTranscript(e.target.value);
              onTranscriptLoaded && onTranscriptLoaded(e.target.value);
            }}
            placeholder="Paste your meeting transcript here..."
            className="w-full h-64 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-y font-mono text-sm"
          />
          <p className="text-xs text-gray-500 mt-2">
            {transcript.length} characters
          </p>
        </div>
      )}

      {/* Analyze Button */}
      <button
        onClick={handleAnalyze}
        disabled={(!transcript && !fileData) || (inputMethod === 'paste' && !transcript.trim())}
        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        <FaFileAlt />
        <span>Analyze Meeting with AI</span>
      </button>
    </div>
  );
}

