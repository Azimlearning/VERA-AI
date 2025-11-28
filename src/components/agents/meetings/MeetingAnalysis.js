// src/components/agents/meetings/MeetingAnalysis.js
// Meeting analysis results display component

'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaCheckCircle, FaExclamationTriangle, FaListUl, FaUsers, FaLightbulb, FaDatabase, FaSpinner } from 'react-icons/fa';

export default function MeetingAnalysis({ results, loading, onSaveToKB, meetingTitle, meetingContent }) {
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);

  const handleSaveToKB = async () => {
    if (!results || !meetingTitle) {
      alert('Meeting title is required to save to knowledge base');
      return;
    }

    setIsSaving(true);
    setSaveStatus(null);

    try {
      const response = await fetch('/api/saveMeetingToKB', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: meetingTitle,
          content: meetingContent || '',
          analysis: results
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to save meeting' }));
        throw new Error(errorData.error || 'Failed to save meeting to knowledge base');
      }

      const data = await response.json();
      setSaveStatus({ success: true, message: 'Meeting saved to knowledge base successfully!' });
      
      // Call parent callback if provided
      if (onSaveToKB) {
        onSaveToKB(data);
      }

      // Clear success message after 3 seconds
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (error) {
      console.error('Error saving meeting to KB:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        title: meetingTitle,
        hasAnalysis: !!results,
        analysisKeys: results ? Object.keys(results) : []
      });
      setSaveStatus({ success: false, message: error.message || 'Failed to save meeting to knowledge base' });
    } finally {
      setIsSaving(false);
    }
  };
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
    <div className="space-y-8">
      {/* Save to Knowledge Base Button */}
      {results && meetingTitle && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-50 rounded-lg p-4 border border-blue-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-1">Save to Knowledge Base</h4>
              <p className="text-xs text-gray-600">
                Save this meeting analysis to the knowledge base so it can be retrieved in future RAG queries
              </p>
            </div>
            <button
              onClick={handleSaveToKB}
              disabled={isSaving}
              className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
            >
              {isSaving ? (
                <>
                  <FaSpinner className="animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <FaDatabase />
                  <span>Save to KB</span>
                </>
              )}
            </button>
          </div>
          {saveStatus && (
            <div className={`mt-3 p-2 rounded text-sm ${
              saveStatus.success 
                ? 'bg-green-100 text-green-800 border border-green-300' 
                : 'bg-red-100 text-red-800 border border-red-300'
            }`}>
              {saveStatus.message}
            </div>
          )}
        </motion.div>
      )}

      {/* Summary */}
      {summary && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-purple-50 rounded-lg p-6 border border-purple-100"
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
          className="bg-white rounded-lg p-6 border border-gray-200"
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
          className="bg-white rounded-lg p-6 border border-gray-200"
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
          className="bg-red-50 rounded-lg p-6 border border-red-200"
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
          className="bg-yellow-50 rounded-lg p-6 border border-yellow-200"
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

