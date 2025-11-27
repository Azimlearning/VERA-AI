// src/components/VeraDemo.js
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { FaRobot, FaUserCircle, FaPaperPlane, FaArrowRight, FaQuoteLeft } from 'react-icons/fa';

/**
 * Vera Demo Component
 * 
 * Interactive preview showing Vera's capabilities with:
 * - Mini chat interface preview
 * - Sample questions/answers
 * - Animated typing indicators
 * - Citation examples
 * - "Try Vera" CTA
 */

const SAMPLE_CONVERSATIONS = [
  {
    question: "What is PETRONAS 2.0?",
    answer: "PETRONAS 2.0 is PETRONAS's transformation journey toward becoming an integrated energy company by 2035. It focuses on sustainable energy solutions, digital transformation, and strategic partnerships to navigate the energy transition.",
    citations: [
      { title: "PETRONAS 2.0 Overview", sourceUrl: "/petronas-2.0" },
      { title: "Strategic Transformation", sourceUrl: "/systemic-shifts/key-shifts" }
    ]
  },
  {
    question: "What are the key systemic shifts?",
    answer: "The key systemic shifts include strategic focus areas such as Upstream Target initiatives, mindset & behavior changes, and progress tracking across all initiatives. These shifts are designed to accelerate transformation and achieve organizational goals.",
    citations: [
      { title: "Key Shifts", sourceUrl: "/systemic-shifts/key-shifts" },
      { title: "Our Progress", sourceUrl: "/systemic-shifts/our-progress" }
    ]
  },
  {
    question: "How does Vera help with workflow acceleration?",
    answer: "Vera powers 6 specialized AI agents that accelerate workflows: Analytics Agent for data insights, Meetings Agent for action items, Podcast Agent for content creation, Content Agent for story drafting, Visual Agent for image analysis, and Quiz Agent for knowledge testing.",
    citations: [
      { title: "AI Agents", sourceUrl: "/#ai-ecosystem" }
    ]
  }
];

export default function VeraDemo() {
  const [currentConversation, setCurrentConversation] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [displayedAnswer, setDisplayedAnswer] = useState('');
  const [showCitations, setShowCitations] = useState(false);

  useEffect(() => {
    // Auto-cycle through conversations
    const interval = setInterval(() => {
      setIsTyping(true);
      setDisplayedAnswer('');
      setShowCitations(false);
      
      setTimeout(() => {
        setCurrentConversation((prev) => (prev + 1) % SAMPLE_CONVERSATIONS.length);
        setIsTyping(false);
      }, 1000);
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!isTyping && currentConversation < SAMPLE_CONVERSATIONS.length) {
      const conversation = SAMPLE_CONVERSATIONS[currentConversation];
      let index = 0;
      
      const typingInterval = setInterval(() => {
        if (index < conversation.answer.length) {
          setDisplayedAnswer(conversation.answer.slice(0, index + 1));
          index++;
        } else {
          clearInterval(typingInterval);
          setTimeout(() => setShowCitations(true), 500);
        }
      }, 20);

      return () => clearInterval(typingInterval);
    }
  }, [isTyping, currentConversation]);

  const currentConv = SAMPLE_CONVERSATIONS[currentConversation];

  return (
    <section className="relative w-full py-16 md:py-24 bg-gradient-to-br from-gray-900 via-teal-900 to-cyan-900">
      {/* Animated mesh gradient background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-teal-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob" />
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000" />
      </div>

      <div className="relative z-10 container mx-auto px-4 max-w-6xl">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white mb-4">
            Experience <span className="bg-gradient-to-r from-teal-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">Vera</span>
          </h2>
          <p className="text-lg md:text-xl text-cyan-200 max-w-2xl mx-auto">
            See how Vera provides intelligent, citation-backed answers powered by our Knowledge Base
          </p>
        </motion.div>

        {/* Demo Chat Interface */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200"
        >
          {/* Chat Header */}
          <div className="bg-gradient-to-r from-teal-600 to-cyan-600 p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <FaRobot className="text-white text-xl" />
            </div>
            <div>
              <h3 className="text-white font-bold">Vera</h3>
              <p className="text-white/80 text-xs">Core AI Assistant</p>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="p-6 space-y-4 min-h-[400px] bg-gray-50">
            {/* User Message */}
            <motion.div
              key={`user-${currentConversation}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-end gap-3 justify-end"
            >
              <div className="flex flex-col items-end max-w-[75%]">
                <div className="bg-gray-200 text-gray-800 p-4 rounded-2xl rounded-br-md shadow-sm">
                  <p className="whitespace-pre-wrap">{currentConv.question}</p>
                </div>
                <span className="text-xs text-gray-400 mt-2 px-2">You</span>
              </div>
              <FaUserCircle className="text-2xl text-gray-400 flex-shrink-0" />
            </motion.div>

            {/* AI Response */}
            <motion.div
              key={`ai-${currentConversation}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-end gap-3 justify-start"
            >
              <FaRobot className="text-2xl text-teal-600 flex-shrink-0" />
              <div className="flex flex-col items-start max-w-[75%]">
                <div className="bg-teal-600 text-white p-4 rounded-2xl rounded-bl-md shadow-sm">
                  {isTyping ? (
                    <div className="flex space-x-2">
                      <motion.div
                        animate={{ y: [0, -8, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                        className="w-2 h-2 bg-teal-200 rounded-full"
                      />
                      <motion.div
                        animate={{ y: [0, -8, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                        className="w-2 h-2 bg-teal-200 rounded-full"
                      />
                      <motion.div
                        animate={{ y: [0, -8, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                        className="w-2 h-2 bg-teal-200 rounded-full"
                      />
                    </div>
                  ) : (
                    <>
                      <p className="whitespace-pre-wrap leading-relaxed">{displayedAnswer}</p>
                      {displayedAnswer.length < currentConv.answer.length && (
                        <span className="inline-block w-2 h-4 bg-white ml-1 animate-pulse" />
                      )}
                    </>
                  )}
                </div>
                
                {/* Citations */}
                <AnimatePresence>
                  {showCitations && currentConv.citations && currentConv.citations.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ delay: 0.3 }}
                      className="mt-4 pt-4 border-t border-teal-400 border-opacity-30 w-full"
                    >
                      <p className="text-xs font-semibold mb-2 opacity-90 text-teal-700">Sources:</p>
                      <div className="space-y-1.5">
                        {currentConv.citations.map((citation, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 + idx * 0.1 }}
                            className="text-xs opacity-80 hover:opacity-100 transition-opacity"
                          >
                            <Link 
                              href={citation.sourceUrl}
                              className="text-teal-700 hover:text-teal-900 hover:underline"
                            >
                              • {citation.title}
                            </Link>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                <span className="text-xs text-gray-400 mt-2 px-2">Vera</span>
              </div>
            </motion.div>
          </div>

          {/* Conversation Indicator */}
          <div className="bg-gray-100 px-6 py-3 flex items-center justify-center gap-2">
            <div className="flex gap-1">
              {SAMPLE_CONVERSATIONS.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentConversation ? 'bg-teal-600 w-6' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-gray-500 ml-2">
              Sample conversation {currentConversation + 1} of {SAMPLE_CONVERSATIONS.length}
            </span>
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-12"
        >
          <Link href="/vera">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="group flex items-center gap-3 px-8 py-4 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-full shadow-lg hover:shadow-2xl transition-all duration-300 mx-auto"
            >
              <FaRobot className="text-xl" />
              <span>Try Vera Now</span>
              <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </Link>
          <p className="text-cyan-200 text-sm mt-4">
            Get instant answers powered by our Knowledge Base
          </p>
        </motion.div>
      </div>
    </section>
  );
}

