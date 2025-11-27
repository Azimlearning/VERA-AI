// src/components/agents/podcast/ScriptDisplay.js
// Script display component for Podcast Agent

'use client';

import { motion } from 'framer-motion';
import { FaPodcast, FaPlay, FaDownload } from 'react-icons/fa';

export default function ScriptDisplay({ script, audioUrl, loading }) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  if (!script) {
    return null;
  }

  const handleDownloadScript = () => {
    const content = typeof script === 'string' ? script : JSON.stringify(script, null, 2);
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `podcast-script-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Format script for display
  const formatScript = (scriptData) => {
    if (typeof scriptData === 'string') {
      return scriptData;
    }

    let formatted = '';
    
    if (scriptData.outline) {
      formatted += `OUTLINE:\n${scriptData.outline}\n\n`;
    }
    
    if (scriptData.script) {
      formatted += `SCRIPT:\n${scriptData.script}\n\n`;
    }
    
    if (scriptData.sections && Array.isArray(scriptData.sections)) {
      formatted += 'SECTIONS:\n\n';
      scriptData.sections.forEach((section, idx) => {
        formatted += `--- Section ${idx + 1}: ${section.title || 'Untitled'} ---\n`;
        if (section.content) {
          formatted += `${section.content}\n\n`;
        }
        if (section.qa && Array.isArray(section.qa)) {
          section.qa.forEach((qa, qIdx) => {
            formatted += `Q${qIdx + 1}: ${qa.question || ''}\n`;
            formatted += `A${qIdx + 1}: ${qa.answer || ''}\n\n`;
          });
        }
        formatted += '\n';
      });
    }

    return formatted || JSON.stringify(scriptData, null, 2);
  };

  const formattedScript = formatScript(script);

  return (
    <div className="space-y-6">
      {/* Script Display */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-6 border border-orange-200"
      >
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <FaPodcast className="text-orange-600" />
            Generated Podcast Script
          </h4>
          <button
            onClick={handleDownloadScript}
            className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm"
          >
            <FaDownload />
            <span>Download Script</span>
          </button>
        </div>
        <div className="bg-white rounded-lg p-6 border border-gray-200 max-h-96 overflow-y-auto">
          <pre className="whitespace-pre-wrap font-mono text-sm text-gray-800">
            {formattedScript}
          </pre>
        </div>
      </motion.div>

      {/* Audio Player (if available) */}
      {audioUrl && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl p-6 border border-gray-200"
        >
          <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FaPlay className="text-orange-600" />
            Generated Audio
          </h4>
          <audio controls className="w-full">
            <source src={audioUrl} type="audio/mpeg" />
            Your browser does not support the audio element.
          </audio>
        </motion.div>
      )}
    </div>
  );
}

