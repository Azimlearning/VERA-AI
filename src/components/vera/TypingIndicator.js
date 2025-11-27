// src/components/vera/TypingIndicator.js
'use client';

import { motion } from 'framer-motion';
import { FaRobot } from 'react-icons/fa';

export default function TypingIndicator() {
  return (
    <div className="flex items-start gap-4 justify-start">
      <motion.div
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        className="flex-shrink-0 mt-1"
      >
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center shadow-md">
          <FaRobot className="text-white text-sm" />
        </div>
      </motion.div>
      <div className="flex flex-col items-start">
        <div className="bg-white text-gray-900 p-4 rounded-2xl rounded-bl-md shadow-sm border border-gray-200">
          <div className="flex space-x-2 items-center">
            <motion.div
              animate={{ y: [0, -8, 0], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
              className="w-2 h-2 bg-teal-500 rounded-full"
            />
            <motion.div
              animate={{ y: [0, -8, 0], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
              className="w-2 h-2 bg-teal-500 rounded-full"
            />
            <motion.div
              animate={{ y: [0, -8, 0], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
              className="w-2 h-2 bg-teal-500 rounded-full"
            />
            <motion.div
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="ml-2 text-xs text-teal-600 font-medium"
            >
              Thinking...
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

