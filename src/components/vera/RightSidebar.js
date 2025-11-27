// src/components/vera/RightSidebar.js
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaFileAlt, FaDatabase, FaLink, FaBook, FaLightbulb } from 'react-icons/fa';

export default function RightSidebar({ isOpen, onClose, contextData = {} }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="lg:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
          />
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-80 bg-white border-l border-gray-200 shadow-xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
              <h2 className="font-semibold text-gray-900">Context & Resources</h2>
              <button
                onClick={onClose}
                className="p-2 text-gray-500 hover:text-gray-700"
              >
                <FaTimes className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 chat-history-scrollbar">
              {/* Document Viewer */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <FaFileAlt className="text-teal-600" />
                  <h3 className="text-sm font-semibold text-gray-900">Documents</h3>
                </div>
                <div className="text-xs text-gray-600 bg-gray-50 p-3 rounded-lg">
                  No documents attached
                </div>
              </div>

              {/* Context Memory */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <FaDatabase className="text-teal-600" />
                  <h3 className="text-sm font-semibold text-gray-900">Context Memory</h3>
                </div>
                <div className="text-xs text-gray-600 bg-gray-50 p-3 rounded-lg">
                  {contextData.memory || 'No context stored'}
                </div>
              </div>

              {/* RAG References */}
              {contextData.references && contextData.references.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <FaBook className="text-teal-600" />
                    <h3 className="text-sm font-semibold text-gray-900">RAG References</h3>
                  </div>
                  <div className="space-y-2">
                    {contextData.references.map((ref, idx) => (
                      <div key={idx} className="text-xs text-gray-600 bg-gray-50 p-3 rounded-lg">
                        <p className="font-medium text-gray-900">{ref.title}</p>
                        {ref.url && (
                          <a
                            href={ref.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-teal-600 hover:underline mt-1 block"
                          >
                            {ref.url}
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Related Topics */}
              {contextData.relatedTopics && contextData.relatedTopics.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <FaLightbulb className="text-teal-600" />
                    <h3 className="text-sm font-semibold text-gray-900">Related Topics</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {contextData.relatedTopics.map((topic, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-teal-50 text-teal-700 rounded-full text-xs"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Links */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <FaLink className="text-teal-600" />
                  <h3 className="text-sm font-semibold text-gray-900">Quick Links</h3>
                </div>
                <div className="space-y-1">
                  <a
                    href="/knowledge-base"
                    className="block text-xs text-teal-600 hover:text-teal-700 hover:underline p-2 rounded"
                  >
                    Knowledge Base
                  </a>
                  <a
                    href="/agents"
                    className="block text-xs text-teal-600 hover:text-teal-700 hover:underline p-2 rounded"
                  >
                    AI Agents
                  </a>
                  <a
                    href="/submit-story"
                    className="block text-xs text-teal-600 hover:text-teal-700 hover:underline p-2 rounded"
                  >
                    Submit Story
                  </a>
                </div>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

