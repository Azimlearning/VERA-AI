// src/components/agents/analytics/DataInput.js
// Data input component for Analytics Agent

'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { FaUpload, FaFileCsv, FaFileAlt, FaPaste, FaTimes } from 'react-icons/fa';
import SampleDataButton from '../SampleDataButton';
import { SAMPLE_CSV_DATA, SAMPLE_JSON_DATA, SAMPLE_TEXT_DATA } from './SampleData';

export default function DataInput({ onDataLoaded, onAnalyze }) {
  const [inputMethod, setInputMethod] = useState('paste'); // 'paste', 'file', 'sample'
  const [textData, setTextData] = useState('');
  const [fileData, setFileData] = useState(null);
  const [fileName, setFileName] = useState('');
  const [dataPreview, setDataPreview] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();

    reader.onload = (e) => {
      const content = e.target.result;
      setFileData({ file, content, type: file.type });
      
      // Preview first few lines
      if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
        const lines = content.split('\n').slice(0, 5);
        setDataPreview({ type: 'csv', preview: lines.join('\n') });
      } else if (file.type === 'application/json' || file.name.endsWith('.json')) {
        try {
          const json = JSON.parse(content);
          setDataPreview({ type: 'json', preview: JSON.stringify(json, null, 2).split('\n').slice(0, 10).join('\n') });
        } catch (err) {
          setDataPreview({ type: 'text', preview: content.substring(0, 200) });
        }
      } else {
        setDataPreview({ type: 'text', preview: content.substring(0, 200) });
      }
    };

    reader.readAsText(file);
  };

  const handleLoadSample = (sampleType) => {
    if (sampleType === 'csv') {
      setTextData(SAMPLE_CSV_DATA);
      setInputMethod('paste');
      setDataPreview({ type: 'csv', preview: SAMPLE_CSV_DATA.split('\n').slice(0, 5).join('\n') });
    } else if (sampleType === 'json') {
      setTextData(JSON.stringify(SAMPLE_JSON_DATA, null, 2));
      setInputMethod('paste');
      setDataPreview({ type: 'json', preview: JSON.stringify(SAMPLE_JSON_DATA, null, 2).split('\n').slice(0, 10).join('\n') });
    } else {
      setTextData(SAMPLE_TEXT_DATA);
      setInputMethod('paste');
      setDataPreview({ type: 'text', preview: SAMPLE_TEXT_DATA.substring(0, 200) });
    }
    onDataLoaded && onDataLoaded(sampleType === 'csv' ? SAMPLE_CSV_DATA : sampleType === 'json' ? SAMPLE_JSON_DATA : SAMPLE_TEXT_DATA);
  };

  const handleAnalyze = () => {
    const dataToAnalyze = inputMethod === 'file' ? fileData?.content : textData;
    if (!dataToAnalyze || dataToAnalyze.trim().length === 0) {
      alert('Please provide data to analyze');
      return;
    }
    onAnalyze && onAnalyze(dataToAnalyze, inputMethod === 'file' ? fileData?.type : 'text');
  };

  const clearData = () => {
    setTextData('');
    setFileData(null);
    setFileName('');
    setDataPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 md:p-8">
      <h3 className="text-2xl font-bold text-gray-900 mb-4">Input Your Data</h3>
      
      {/* Input Method Selector */}
      <div className="flex gap-2 mb-6 p-1 bg-gray-100 rounded-lg">
        <button
          onClick={() => setInputMethod('paste')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            inputMethod === 'paste' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-200'
          }`}
        >
          <FaPaste className="inline-block mr-2" />
          Paste Data
        </button>
        <button
          onClick={() => setInputMethod('file')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            inputMethod === 'file' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-200'
          }`}
        >
          <FaUpload className="inline-block mr-2" />
          Upload File
        </button>
      </div>

      {/* Sample Data Buttons */}
      <div className="mb-6 flex flex-wrap gap-2">
        <SampleDataButton
          onClick={() => handleLoadSample('csv')}
          label="Try with CSV Sample"
        />
        <SampleDataButton
          onClick={() => handleLoadSample('json')}
          label="Try with JSON Sample"
        />
        <SampleDataButton
          onClick={() => handleLoadSample('text')}
          label="Try with Text Sample"
        />
      </div>

      {/* File Upload */}
      {inputMethod === 'file' && (
        <div className="mb-6">
          <label className="block mb-2">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer">
              <FaUpload className="text-4xl text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">Click to upload or drag and drop</p>
              <p className="text-sm text-gray-500">CSV, JSON, or Text files</p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.json,.txt"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          </label>
          {fileName && (
            <div className="flex items-center gap-2 mt-2">
              <FaFileCsv className="text-blue-600" />
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
            value={textData}
            onChange={(e) => {
              setTextData(e.target.value);
              onDataLoaded && onDataLoaded(e.target.value);
            }}
            placeholder="Paste your data here (CSV, JSON, or plain text)..."
            className="w-full h-48 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y font-mono text-sm"
          />
        </div>
      )}

      {/* Data Preview */}
      {dataPreview && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200"
        >
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Preview:</h4>
          <pre className="text-xs text-gray-600 overflow-x-auto max-h-32">
            {dataPreview.preview}
            {dataPreview.preview.length > 200 && '...'}
          </pre>
        </motion.div>
      )}

      {/* Analyze Button */}
      <button
        onClick={handleAnalyze}
        disabled={(!textData && !fileData) || (inputMethod === 'paste' && !textData.trim())}
        className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        <FaFileAlt />
        <span>Analyze with AI</span>
      </button>
    </div>
  );
}

