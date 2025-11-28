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
    <div className="space-y-8">
      {/* Generated Content - Clean Document Style */}
      {content && (
        <div className="prose prose-lg max-w-none">
          <pre className="whitespace-pre-wrap font-sans text-gray-800 leading-relaxed bg-transparent p-0 border-0">
            {content}
          </pre>
        </div>
      )}

      {/* Generated Image */}
      {imageUrl && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-50 rounded-lg p-6 border border-gray-200"
        >
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <FaImage className="text-green-600" />
              Generated Image
            </h4>
            <button
              onClick={handleDownloadImage}
              className="flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
            >
              <FaDownload className="w-3 h-3" />
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

