// src/components/agents/content/ContentDisplay.js
// Content display component for Content Agent

'use client';

import { motion } from 'framer-motion';
import { FaFileAlt, FaImage, FaDownload } from 'react-icons/fa';

export default function ContentDisplay({ content, imageUrl, loading }) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!content && !imageUrl) {
    return null;
  }

  const handleDownloadContent = () => {
    if (!content) return;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `generated-content-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadImage = () => {
    if (!imageUrl) return;
    const a = document.createElement('a');
    a.href = imageUrl;
    a.download = `generated-image-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-6">
      {/* Generated Content */}
      {content && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200"
        >
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <FaFileAlt className="text-green-600" />
              Generated Content
            </h4>
            <button
              onClick={handleDownloadContent}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
            >
              <FaDownload />
              <span>Download</span>
            </button>
          </div>
          <div className="bg-white rounded-lg p-6 border border-gray-200 max-h-96 overflow-y-auto">
            <pre className="whitespace-pre-wrap font-sans text-gray-800">
              {content}
            </pre>
          </div>
        </motion.div>
      )}

      {/* Generated Image */}
      {imageUrl && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl p-6 border border-gray-200"
        >
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <FaImage className="text-green-600" />
              Generated Image
            </h4>
            <button
              onClick={handleDownloadImage}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
            >
              <FaDownload />
              <span>Download</span>
            </button>
          </div>
          <div className="flex justify-center">
            <img
              src={imageUrl}
              alt="Generated"
              className="max-w-full rounded-lg border border-gray-200 shadow-lg"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'block';
              }}
            />
            <div className="hidden bg-gray-100 rounded-lg p-8 text-center text-gray-500">
              Image failed to load
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

