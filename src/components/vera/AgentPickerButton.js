// src/components/vera/AgentPickerButton.js
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaRobot, FaTimes, FaCheck } from 'react-icons/fa';
import { 
  FaChartLine, 
  FaUsers, 
  FaPodcast, 
  FaFileAlt, 
  FaImages,
  FaQuestionCircle,
} from 'react-icons/fa';

const AGENTS = [
  {
    id: 'analytics',
    name: 'Analytics Agent',
    description: 'Data insights & forecasting',
    icon: FaChartLine,
    gradient: 'from-blue-400 to-cyan-500',
  },
  {
    id: 'meetings',
    name: 'Meetings Agent',
    description: 'Meeting analysis & action items',
    icon: FaUsers,
    gradient: 'from-purple-400 to-pink-500',
  },
  {
    id: 'podcast',
    name: 'Podcast Agent',
    description: 'Script & audio generation',
    icon: FaPodcast,
    gradient: 'from-orange-400 to-red-500',
  },
  {
    id: 'content',
    name: 'Content Agent',
    description: 'Content & image generation',
    icon: FaFileAlt,
    gradient: 'from-green-400 to-emerald-500',
  },
  {
    id: 'visual',
    name: 'Visual Agent',
    description: 'Image analysis & tagging',
    icon: FaImages,
    gradient: 'from-indigo-400 to-purple-500',
  },
  {
    id: 'quiz',
    name: 'Quiz Agent',
    description: 'Quiz generation from content',
    icon: FaQuestionCircle,
    gradient: 'from-yellow-400 to-orange-500',
  },
];

export default function AgentPickerButton({ selectedAgent, onAgentSelect }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="tool-btn"
        title={selectedAgent ? `Selected: ${selectedAgent.name}` : 'Select AI Agent'}
      >
        <span className="plus-icon">+</span>
        <span>Tools</span>
      </motion.button>

      {/* Agent Picker Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-40"
            />
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="absolute bottom-full left-0 mb-2 w-80 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden"
            >
              <div className="p-3 border-b border-gray-200 flex items-center justify-between bg-gray-50">
                <h3 className="text-sm font-semibold text-gray-900">Select AI Agent</h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 text-gray-500 hover:text-gray-700"
                >
                  <FaTimes className="w-4 h-4" />
                </button>
              </div>
              <div className="max-h-96 overflow-y-auto p-2">
                {/* None option */}
                <button
                  onClick={() => {
                    onAgentSelect(null);
                    setIsOpen(false);
                  }}
                  className={`w-full p-3 rounded-lg text-left transition-colors mb-2 ${
                    !selectedAgent
                      ? 'bg-teal-50 border-2 border-teal-300'
                      : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center">
                      <FaRobot className="text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">Vera (Default)</div>
                      <div className="text-xs text-gray-600">General AI assistant with RAG</div>
                    </div>
                    {!selectedAgent && (
                      <FaCheck className="text-teal-600" />
                    )}
                  </div>
                </button>

                {/* Agent options */}
                {AGENTS.map((agent) => {
                  const IconComponent = agent.icon;
                  const isSelected = selectedAgent?.id === agent.id;
                  
                  return (
                    <button
                      key={agent.id}
                      onClick={() => {
                        onAgentSelect(agent);
                        setIsOpen(false);
                      }}
                      className={`w-full p-3 rounded-lg text-left transition-colors mb-2 ${
                        isSelected
                          ? 'bg-teal-50 border-2 border-teal-300'
                          : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${agent.gradient} flex items-center justify-center`}>
                          <IconComponent className="text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900">{agent.name}</div>
                          <div className="text-xs text-gray-600">{agent.description}</div>
                        </div>
                        {isSelected && (
                          <FaCheck className="text-teal-600" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}


