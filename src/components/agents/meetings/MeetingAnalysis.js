// src/components/agents/meetings/MeetingAnalysis.js
// Meeting analysis results display component

'use client';

import { motion } from 'framer-motion';
import { FaCheckCircle, FaExclamationTriangle, FaListUl, FaUsers, FaLightbulb } from 'react-icons/fa';

export default function MeetingAnalysis({ results, loading }) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!results) {
    return null;
  }

  const { summary, actionItems, decisions, alignmentWarnings, zombieTasks } = results;

  return (
    <div className="space-y-6">
      {/* Summary */}
      {summary && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200"
        >
          <div className="flex items-center gap-2 mb-4">
            <FaLightbulb className="text-purple-600 text-2xl" />
            <h4 className="text-xl font-bold text-gray-900">Meeting Summary</h4>
          </div>
          <p className="text-gray-700 whitespace-pre-wrap">{summary}</p>
        </motion.div>
      )}

      {/* Key Decisions */}
      {decisions && decisions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl p-6 border border-gray-200"
        >
          <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FaCheckCircle className="text-green-600" />
            Key Decisions
          </h4>
          <ul className="space-y-3">
            {decisions.map((decision, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <span className="text-green-600 mt-1">✓</span>
                <span className="text-gray-700">{decision}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      )}

      {/* Action Items */}
      {actionItems && actionItems.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl p-6 border border-gray-200"
        >
          <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FaListUl className="text-blue-600" />
            Action Items ({actionItems.length})
          </h4>
          <div className="space-y-3">
            {actionItems.map((item, idx) => (
              <div key={idx} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="font-semibold text-gray-900 mb-2">{item.task || item}</p>
                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                  {item.owner && (
                    <span className="flex items-center gap-1">
                      <FaUsers className="text-gray-400" />
                      Owner: {item.owner}
                    </span>
                  )}
                  {item.dueDate && (
                    <span>Due: {item.dueDate}</span>
                  )}
                  {item.status && (
                    <span>Status: {item.status}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Zombie Tasks */}
      {zombieTasks && zombieTasks.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-red-50 rounded-xl p-6 border border-red-200"
        >
          <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FaExclamationTriangle className="text-red-600" />
            Zombie Tasks ({zombieTasks.length})
          </h4>
          <p className="text-sm text-gray-600 mb-3">
            These action items are missing critical information (owner or due date):
          </p>
          <ul className="space-y-2">
            {zombieTasks.map((task, idx) => (
              <li key={idx} className="flex items-start gap-2 text-gray-700">
                <span className="text-red-600 mt-1">⚠</span>
                <span>{typeof task === 'string' ? task : task.task || task}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      )}

      {/* Alignment Warnings */}
      {alignmentWarnings && alignmentWarnings.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-yellow-50 rounded-xl p-6 border border-yellow-200"
        >
          <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FaExclamationTriangle className="text-yellow-600" />
            Alignment Warnings ({alignmentWarnings.length})
          </h4>
          <div className="space-y-3">
            {alignmentWarnings.map((warning, idx) => (
              <div key={idx} className="p-4 bg-white rounded-lg border border-yellow-300">
                {typeof warning === 'string' ? (
                  <p className="text-gray-700">{warning}</p>
                ) : (
                  <>
                    {warning.type && (
                      <p className="font-semibold text-yellow-800 mb-1">{warning.type}</p>
                    )}
                    <p className="text-gray-700">{warning.message || warning}</p>
                  </>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}

