// src/components/vera/MessageActions.js
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaSync, FaCopy, FaCheck } from 'react-icons/fa';

/**
 * MessageActions Component
 * 
 * Action buttons for each AI message:
 * - Regenerate: Retry with same prompt
 * - Copy: Copy entire response
 * - Info: Show message info panel
 */
export default function MessageActions({ 
  onRegenerate, 
  content,
  className = ''
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className={`flex items-center gap-2 mt-2 ${className}`}>
      {onRegenerate && (
        <motion.button
          whileHover={{ scale: 1.05, y: -1 }}
          whileTap={{ scale: 0.95 }}
          onClick={onRegenerate}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all shadow-sm hover:shadow"
          title="Regenerate response"
        >
          <FaSync className="w-3 h-3" />
          <span>Regenerate</span>
        </motion.button>
      )}
      
      <motion.button
        whileHover={{ scale: 1.05, y: -1 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleCopy}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 rounded-lg transition-all shadow-sm hover:shadow"
        title="Copy response"
      >
        {copied ? (
          <>
            <FaCheck className="w-3 h-3" />
            <span>Copied</span>
          </>
        ) : (
          <>
            <FaCopy className="w-3 h-3" />
            <span>Copy</span>
          </>
        )}
      </motion.button>
    </div>
  );
}

