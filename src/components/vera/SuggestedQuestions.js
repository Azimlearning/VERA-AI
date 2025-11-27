// src/components/vera/SuggestedQuestions.js
'use client';

import { motion } from 'framer-motion';
import { FaLightbulb, FaFileAlt, FaChartLine, FaUsers } from 'react-icons/fa';

const SUGGESTED_QUESTIONS = [
  {
    title: "What are the key milestones for Net Zero 2050?",
    text: "What are the key milestones for Net Zero 2050?",
    icon: FaLightbulb,
  },
  {
    title: "How do Systemic Shifts impact our portfolio?",
    text: "How do Systemic Shifts impact our portfolio?",
    icon: FaFileAlt,
  },
  {
    title: "How can I analyze data trends and generate insights?",
    text: "How can I analyze data trends and generate insights?",
    icon: FaChartLine,
  },
  {
    title: "Summarize the key points from the last meeting",
    text: "Summarize the key points from the last meeting",
    icon: FaUsers,
  },
];

export default function SuggestedQuestions({ onQuestionClick, className = '' }) {
  return (
    <div className={`suggestion-container-bottom ${className}`}>
      {SUGGESTED_QUESTIONS.map((question, index) => {
        const IconComponent = question.icon;
        return (
          <motion.button
            key={index}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onQuestionClick(question.text)}
            className="suggestion-pill"
          >
            <IconComponent className="text-gray-400 hover:text-gray-600 text-xs flex-shrink-0 transition-colors" />
            <span>{question.title}</span>
            <span className="opacity-50 ml-1">↗</span>
          </motion.button>
        );
      })}
    </div>
  );
}

