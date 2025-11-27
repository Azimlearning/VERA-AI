// src/components/vera/MessageInfoPanel.js
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaInfoCircle, FaTimes, FaCopy, FaClock, FaRobot, FaUser } from 'react-icons/fa';

export default function MessageInfoPanel({ message, onClose }) {
  const [copied, setCopied] = useState(false);

  const copyJSON = () => {
    const jsonData = JSON.stringify(message, null, 2);
    navigator.clipboard.writeText(jsonData);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50"
        onClick={onClose}
      />
      <motion.div
        key="panel"
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed right-0 top-0 bottom-0 w-80 bg-white border-l border-gray-200 shadow-xl z-50 overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
          <h3 className="text-sm font-semibold text-gray-900">Message Info</h3>
          <button
            onClick={onClose}
            className="p-1 text-gray-500 hover:text-gray-700"
          >
            <FaTimes className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Message Metadata */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              {message.role === 'ai' ? (
                <FaRobot className="text-teal-600" />
              ) : (
                <FaUser className="text-gray-600" />
              )}
              <span className="text-sm font-semibold text-gray-900 capitalize">{message.role}</span>
            </div>
            {message.timestamp && (
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <FaClock className="w-3 h-3" />
                <span>{new Date(message.timestamp).toLocaleString()}</span>
              </div>
            )}
          </div>

          {/* Model Used */}
          {message.model && (
            <div>
              <h4 className="text-xs font-semibold text-gray-700 mb-1">Model</h4>
              <p className="text-sm text-gray-900">{message.model}</p>
            </div>
          )}

          {/* Source References */}
          {message.citations && message.citations.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-gray-700 mb-2">Source References</h4>
              <div className="space-y-2">
                {message.citations.map((citation, idx) => (
                  <div key={`citation-${idx}-${citation.title || idx}`} className="p-2 bg-gray-50 rounded text-xs">
                    <p className="font-medium text-gray-900">{citation.title}</p>
                    {citation.sourceUrl && (
                      <a
                        href={citation.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-teal-600 hover:underline"
                      >
                        {citation.sourceUrl}
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* RAG Citations */}
          {message.ragCitations && message.ragCitations.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-gray-700 mb-2">RAG Citations</h4>
              <div className="space-y-1">
                {message.ragCitations.map((citation, idx) => (
                  <div key={`rag-${idx}-${typeof citation === 'string' ? citation.substring(0, 20) : idx}`} className="text-xs text-gray-600 p-2 bg-gray-50 rounded">
                    {citation}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Copy JSON Data */}
          <div className="pt-4 border-t border-gray-200">
            <button
              onClick={copyJSON}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors text-sm"
            >
              <FaCopy className="w-3 h-3" />
              <span>{copied ? 'Copied!' : 'Copy JSON Data'}</span>
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

