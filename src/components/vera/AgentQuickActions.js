// src/components/vera/AgentQuickActions.js
'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  FaChartLine, 
  FaUsers, 
  FaPodcast, 
  FaCloudUploadAlt, 
  FaImages, 
  FaQuestionCircle,
  FaBolt,
  FaArrowRight
} from 'react-icons/fa';

const AGENTS = [
  {
    id: 'analytics',
    name: 'Analytics Agent',
    icon: FaChartLine,
    href: '/agents/analytics',
    gradient: 'from-blue-400 to-cyan-500',
    color: 'blue',
    description: 'Data insights & forecasting'
  },
  {
    id: 'meetings',
    name: 'Meetings Agent',
    icon: FaUsers,
    href: '/agents/meetings',
    gradient: 'from-purple-400 to-pink-500',
    color: 'purple',
    description: 'Meeting analysis & action items'
  },
  {
    id: 'podcast',
    name: 'Podcast Agent',
    icon: FaPodcast,
    href: '/agents/podcast',
    gradient: 'from-orange-400 to-red-500',
    color: 'orange',
    description: 'Script & audio generation'
  },
  {
    id: 'content',
    name: 'Content Agent',
    icon: FaCloudUploadAlt,
    href: '/agents/content',
    gradient: 'from-green-400 to-emerald-500',
    color: 'green',
    description: 'Content & image generation'
  },
  {
    id: 'visual',
    name: 'Visual Agent',
    icon: FaImages,
    href: '/agents/visual',
    gradient: 'from-indigo-400 to-purple-500',
    color: 'indigo',
    description: 'Image analysis & tagging'
  },
  {
    id: 'quiz',
    name: 'Quiz Agent',
    icon: FaQuestionCircle,
    href: '/agents/quiz',
    gradient: 'from-pink-400 to-rose-500',
    color: 'pink',
    description: 'Quiz generation from content'
  },
];

export default function AgentQuickActions({ onAgentClick }) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-4 border border-gray-200">
      <div className="flex items-center gap-2 mb-4">
        <FaBolt className="text-teal-600" />
        <h3 className="text-lg font-semibold text-gray-900">AI Agents</h3>
      </div>
      <p className="text-sm text-gray-600 mb-4">
        Invoke specialized AI agents to accelerate your workflow
      </p>
      <div className="grid grid-cols-2 gap-2">
        {AGENTS.map((agent, index) => {
          const IconComponent = agent.icon;
          return (
            <motion.div
              key={agent.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link
                href={agent.href}
                onClick={() => onAgentClick && onAgentClick(agent)}
                className="block p-3 rounded-lg border border-gray-200 hover:border-teal-300 hover:shadow-md transition-all bg-gray-50 hover:bg-white"
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className={`p-1.5 rounded bg-gradient-to-br ${agent.gradient} text-white`}>
                    <IconComponent className="text-sm" />
                  </div>
                  <span className="text-xs font-semibold text-gray-900">{agent.name}</span>
                </div>
                <p className="text-xs text-gray-600">{agent.description}</p>
              </Link>
            </motion.div>
          );
        })}
      </div>
      <Link
        href="/agents"
        className="mt-4 flex items-center justify-center gap-2 text-sm text-teal-600 hover:text-teal-700 font-semibold transition-colors"
      >
        <span>View All Agents</span>
        <FaArrowRight className="text-xs" />
      </Link>
    </div>
  );
}

