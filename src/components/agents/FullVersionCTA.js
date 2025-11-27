// src/components/agents/FullVersionCTA.js
// Call-to-action component linking to full production version

'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { FaArrowRight, FaRocket } from 'react-icons/fa';

export default function FullVersionCTA({ 
  href, 
  agentName,
  className = ""
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={`bg-gradient-to-r from-teal-600 to-cyan-600 rounded-xl p-6 md:p-8 text-white ${className}`}
    >
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h3 className="text-2xl font-bold mb-2 flex items-center gap-2">
            <FaRocket />
            Ready for the full experience?
          </h3>
          <p className="text-teal-100">
            Access all {agentName} features, save your work, and manage your data with the full version
          </p>
        </div>
        <Link
          href={href}
          className="inline-flex items-center gap-2 px-6 py-3 bg-white text-teal-600 rounded-lg hover:bg-gray-100 transition-colors font-semibold whitespace-nowrap"
        >
          <span>Use Full Version</span>
          <FaArrowRight />
        </Link>
      </div>
    </motion.div>
  );
}

