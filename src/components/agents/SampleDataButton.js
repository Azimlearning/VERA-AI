// src/components/agents/SampleDataButton.js
// Reusable button component for loading sample data

'use client';

import { motion } from 'framer-motion';
import { FaDatabase, FaSpinner } from 'react-icons/fa';

export default function SampleDataButton({ 
  onClick, 
  loading = false, 
  label = "Try with Sample Data",
  className = ""
}) {
  return (
    <motion.button
      onClick={onClick}
      disabled={loading}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`
        inline-flex items-center gap-2 px-4 py-2 
        bg-gray-200 hover:bg-gray-300 
        text-gray-700 font-medium 
        rounded-lg transition-colors
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
    >
      {loading ? (
        <>
          <FaSpinner className="animate-spin" />
          <span>Loading...</span>
        </>
      ) : (
        <>
          <FaDatabase />
          <span>{label}</span>
        </>
      )}
    </motion.button>
  );
}

