// src/components/agents/ResultsDisplay.js
// Common results display wrapper component

'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { FaDownload, FaShare, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';

export default function ResultsDisplay({
  title = "Results",
  children,
  loading = false,
  error = null,
  onDownload = null,
  onShare = null,
  downloadLabel = "Download",
  shareLabel = "Share"
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 md:p-8"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-2xl font-bold text-gray-900">{title}</h3>
        {(onDownload || onShare) && (
          <div className="flex items-center gap-2">
            {onDownload && (
              <button
                onClick={onDownload}
                className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
              >
                <FaDownload className="w-4 h-4" />
                <span>{downloadLabel}</span>
              </button>
            )}
            {onShare && (
              <button
                onClick={onShare}
                className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
              >
                <FaShare className="w-4 h-4" />
                <span>{shareLabel}</span>
              </button>
            )}
          </div>
        )}
      </div>

      <AnimatePresence mode="wait">
        {loading && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-12"
          >
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mb-4"></div>
            <p className="text-gray-600">Processing with AI...</p>
          </motion.div>
        )}

        {error && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3"
          >
            <FaExclamationCircle className="text-red-600 text-xl flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-red-800 mb-1">Error</h4>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </motion.div>
        )}

        {!loading && !error && children && (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

