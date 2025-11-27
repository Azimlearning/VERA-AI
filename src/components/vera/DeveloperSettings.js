// src/components/vera/DeveloperSettings.js
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCog, FaTimes } from 'react-icons/fa';

/**
 * DeveloperSettings Component
 * 
 * Settings panel with:
 * - Temperature slider (0-1)
 * - Model selection dropdown
 * - Max tokens slider
 * - Data Injection toggle (Knowledge Base injection)
 * 
 * Defaults match current code settings:
 * - Temperature: Not explicitly set (defaults to model default, typically ~0.7)
 * - Model: Uses fallback chain (x-ai/grok-4.1-fast, gemini-pro, etc.)
 * - Max Tokens: Not explicitly set (defaults to model default)
 * - Data Injection: Enabled by default (RAG is always used)
 */
const DEFAULT_SETTINGS = {
  temperature: 0.7, // Default for most models
  model: 'auto', // Use automatic fallback chain
  maxTokens: 2048, // Common default
  dataInjection: true, // RAG is enabled by default
};

const MODEL_OPTIONS = [
  { value: 'auto', label: 'Auto (Fallback Chain)', description: 'Uses model fallback chain' },
  { value: 'x-ai/grok-4.1-fast', label: 'Grok 4.1 Fast', description: 'Fast, reliable' },
  { value: 'gemini-pro', label: 'Gemini Pro', description: 'Google Gemini' },
  { value: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash', description: 'Fast Gemini variant' },
];

export default function DeveloperSettings({ 
  isOpen, 
  onClose,
  onSettingsChange 
}) {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);

  // Load settings from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('vera-developer-settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSettings({ ...DEFAULT_SETTINGS, ...parsed });
      } catch (err) {
        console.error('Failed to parse saved settings:', err);
      }
    }
  }, []);

  // Save settings to localStorage and notify parent
  useEffect(() => {
    if (isOpen) {
      localStorage.setItem('vera-developer-settings', JSON.stringify(settings));
      if (onSettingsChange) {
        onSettingsChange(settings);
      }
    }
  }, [settings, isOpen, onSettingsChange]);

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />

          {/* Settings Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white border-l border-gray-200 shadow-2xl z-50 overflow-y-auto"
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Developer Settings</h2>
                <button
                  onClick={onClose}
                    className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <FaTimes className="w-5 h-5" />
                </button>
              </div>

              {/* Data Injection Toggle */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Data Injection</h3>
                    <p className="text-sm text-gray-600">Enable Knowledge Base (RAG) integration</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.dataInjection}
                      onChange={(e) => handleSettingChange('dataInjection', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                  </label>
                </div>
                {settings.dataInjection && (
                  <p className="text-xs text-teal-600 mt-2">
                    ✓ RAG is enabled. Responses will include knowledge base context with citations.
                  </p>
                )}
              </div>

              {/* Temperature Slider */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Temperature</h3>
                    <p className="text-sm text-gray-600">Creativity vs. Precision</p>
                  </div>
                  <span className="text-lg font-mono text-teal-600">{settings.temperature.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={settings.temperature}
                  onChange={(e) => handleSettingChange('temperature', parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Precise (0.0)</span>
                  <span>Balanced (0.5)</span>
                  <span>Creative (1.0)</span>
                </div>
              </div>

              {/* Model Selection */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Model Selection</h3>
                <p className="text-sm text-gray-600 mb-3">Speed vs. Intelligence</p>
                <select
                  value={settings.model}
                  onChange={(e) => handleSettingChange('model', e.target.value)}
                  className="w-full p-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  {MODEL_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {MODEL_OPTIONS.find(o => o.value === settings.model)?.description && (
                  <p className="text-xs text-gray-600 mt-2">
                    {MODEL_OPTIONS.find(o => o.value === settings.model)?.description}
                  </p>
                )}
              </div>

              {/* Max Tokens Slider */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Max Tokens</h3>
                    <p className="text-sm text-gray-600">Response length limit</p>
                  </div>
                  <span className="text-lg font-mono text-teal-600">{settings.maxTokens}</span>
                </div>
                <input
                  type="range"
                  min="256"
                  max="4096"
                  step="256"
                  value={settings.maxTokens}
                  onChange={(e) => handleSettingChange('maxTokens', parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Short (256)</span>
                  <span>Medium (2048)</span>
                  <span>Long (4096)</span>
                </div>
              </div>

              {/* Reset Button */}
              <button
                onClick={() => {
                  setSettings(DEFAULT_SETTINGS);
                  localStorage.removeItem('vera-developer-settings');
                }}
                className="w-full px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-900 rounded-lg transition-colors"
              >
                Reset to Defaults
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

