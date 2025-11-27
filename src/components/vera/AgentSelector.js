// src/components/vera/AgentSelector.js
'use client';

import { motion } from 'framer-motion';
import { 
  FaChartLine, 
  FaUsers, 
  FaPodcast, 
  FaFileAlt, 
  FaImages,
  FaQuestionCircle,
  FaCheck
} from 'react-icons/fa';

const AGENTS = [
  {
    id: 'analytics',
    name: 'Analytics Agent',
    description: 'AI-powered data insights & forecasting',
    icon: FaChartLine,
    gradient: 'from-blue-400 to-cyan-500',
    color: 'blue',
  },
  {
    id: 'meetings',
    name: 'Meetings Agent',
    description: 'AI meeting analysis & action items',
    icon: FaUsers,
    gradient: 'from-purple-400 to-pink-500',
    color: 'purple',
  },
  {
    id: 'podcast',
    name: 'Podcast Agent',
    description: 'AI podcast creation',
    icon: FaPodcast,
    gradient: 'from-orange-400 to-red-500',
    color: 'orange',
  },
  {
    id: 'content',
    name: 'Content Agent',
    description: 'AI content & image generation',
    icon: FaFileAlt,
    gradient: 'from-green-400 to-emerald-500',
    color: 'green',
  },
  {
    id: 'visual',
    name: 'Visual Agent',
    description: 'AI image analysis & tagging',
    icon: FaImages,
    gradient: 'from-indigo-400 to-purple-500',
    color: 'indigo',
  },
  {
    id: 'quiz',
    name: 'Quiz Agent',
    description: 'AI quiz generation from content',
    icon: FaQuestionCircle,
    gradient: 'from-yellow-400 to-orange-500',
    color: 'yellow',
  },
];

export default function AgentSelector({ selectedAgent, onAgentSelect }) {
  return (
    <div className="w-full space-y-3">
      {AGENTS.map((agent, index) => {
        const IconComponent = agent.icon;
        const isSelected = selectedAgent?.id === agent.id;
        
        return (
          <motion.button
            key={agent.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => onAgentSelect(isSelected ? null : agent)}
            className={`w-full p-4 rounded-xl border-2 transition-all duration-200 ${
              isSelected
                ? 'bg-teal-50 border-teal-500 shadow-md'
                : 'bg-white border-gray-200 hover:border-teal-300 hover:shadow-sm'
            }`}
          >
            <div className="flex items-center gap-4">
              {/* Icon */}
              <div className={`flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br ${agent.gradient} flex items-center justify-center shadow-sm`}>
                <IconComponent className="text-white text-lg" />
              </div>
              
              {/* Content */}
              <div className="flex-1 text-left">
                <div className="flex items-center gap-2">
                  <h3 className={`font-semibold ${isSelected ? 'text-teal-700' : 'text-gray-900'}`}>
                    {agent.name}
                  </h3>
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-5 h-5 rounded-full bg-teal-500 flex items-center justify-center"
                    >
                      <FaCheck className="text-white text-xs" />
                    </motion.div>
                  )}
                </div>
                <p className={`text-sm mt-1 ${isSelected ? 'text-teal-600' : 'text-gray-600'}`}>
                  {agent.description}
                </p>
              </div>
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}

