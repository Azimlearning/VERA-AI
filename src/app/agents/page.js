// src/app/agents/page.js
'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
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
    fullName: 'AI Analytics & Forecasting Agent',
    description: 'Analyzes data trends, predicts outcomes, and provides insights from knowledge base',
    icon: FaChartLine,
    href: '/agents/analytics',
    gradient: 'from-blue-400 to-cyan-500',
    color: 'blue',
    features: [
      'Data trend analysis',
      'Predictive forecasting',
      'Knowledge base insights',
      'RAG-powered analytics'
    ]
  },
  {
    id: 'meetings',
    name: 'Meetings Agent',
    fullName: 'AI Meeting Intelligence Agent',
    description: 'Extracts insights, action items, and analyzes meeting alignment with knowledge base context',
    icon: FaUsers,
    href: '/agents/meetings',
    gradient: 'from-purple-400 to-pink-500',
    color: 'purple',
    features: [
      'Meeting transcription',
      'Action item extraction',
      'Alignment analysis',
      'RAG-powered context'
    ]
  },
  {
    id: 'podcast',
    name: 'Podcast Agent',
    fullName: 'AI Podcast Creation Agent',
    description: 'Uses Vera AI to generate scripts and audio from knowledge base topics',
    icon: FaPodcast,
    href: '/agents/podcast',
    gradient: 'from-orange-400 to-red-500',
    color: 'orange',
    features: [
      'Script generation',
      'Audio creation',
      'Vera AI integration',
      'Knowledge base topics'
    ]
  },
  {
    id: 'content',
    name: 'Content Agent',
    fullName: 'AI Content & Image Generation Agent',
    description: 'Generates images in Systemic Shifts style using RAG-powered knowledge base',
    icon: FaCloudUploadAlt,
    href: '/agents/content',
    gradient: 'from-green-400 to-emerald-500',
    color: 'green',
    features: [
      'Content generation',
      'Style-specific images',
      'RAG-powered context',
      'Systemic Shifts style'
    ]
  },
  {
    id: 'visual',
    name: 'Visual Agent',
    fullName: 'AI Visual Intelligence Agent',
    description: 'Extracts data from images, analyzes content, auto-tags and sorts using AI',
    icon: FaImages,
    href: '/agents/visual',
    gradient: 'from-indigo-400 to-purple-500',
    color: 'indigo',
    features: [
      'Image data extraction',
      'Content analysis',
      'Auto-tagging',
      'Intelligent sorting'
    ]
  },
  {
    id: 'quiz',
    name: 'Quiz Agent',
    fullName: 'AI Quiz Generation Agent',
    description: 'Creates quizzes from knowledge base or user content using AI',
    icon: FaQuestionCircle,
    href: '/agents/quiz',
    gradient: 'from-pink-400 to-rose-500',
    color: 'pink',
    features: [
      'RAG-powered generation',
      'User content generation',
      'Auto question creation',
      'Knowledge base integration'
    ]
  },
];

export default function AgentsPage() {
  return (
    <div className="min-h-screen bg-gray-100 font-sans flex flex-col">
      <Header />
      <main className="flex-grow relative z-10">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-gray-900 via-gray-800 to-teal-900 text-white py-16 md:py-24">
          <div className="container mx-auto px-4 max-w-7xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-500/20 backdrop-blur-sm border border-teal-300/50 mb-6">
                <FaBolt className="w-4 h-4 text-teal-300" />
                <span className="text-sm text-teal-200 font-medium">Super AI Agents</span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4">
                AI Agents
              </h1>
              <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto mb-2">
                Super AI Agents That Accelerate Workflows
              </p>
              <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                Powered by Vera AI and connected to our knowledge base through RAG
              </p>
            </motion.div>
          </div>
        </section>

        {/* Agents Grid */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {AGENTS.map((agent, index) => {
                const IconComponent = agent.icon;
                return (
                  <motion.div
                    key={agent.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.4 }}
                    whileHover={{ scale: 1.02, y: -4 }}
                    className="group"
                  >
                    <Link href={agent.href}>
                      <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 h-full border border-gray-200 hover:border-teal-300 flex flex-col">
                        {/* Icon */}
                        <div className={`mb-4 inline-flex items-center justify-center w-16 h-16 rounded-lg bg-gradient-to-br ${agent.gradient} text-white`}>
                          <IconComponent className="text-2xl" />
                        </div>

                        {/* Name */}
                        <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-teal-600 transition-colors">
                          {agent.name}
                        </h3>
                        <p className="text-sm text-gray-500 mb-3">{agent.fullName}</p>

                        {/* Description */}
                        <p className="text-gray-700 mb-4 flex-grow">
                          {agent.description}
                        </p>

                        {/* Features */}
                        <div className="mb-4">
                          <ul className="space-y-1">
                            {agent.features.map((feature, idx) => (
                              <li key={idx} className="text-sm text-gray-600 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-teal-500"></span>
                                {feature}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* CTA */}
                        <div className="mt-auto pt-4 border-t border-gray-200">
                          <div className="flex items-center text-teal-600 font-semibold group-hover:text-teal-700 transition-colors">
                            <span className="text-sm">Try Agent</span>
                            <FaArrowRight className="ml-2 text-xs group-hover:translate-x-1 transition-transform" />
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Info Section */}
        <section className="bg-gradient-to-br from-slate-50 via-cyan-50 to-teal-50 py-16 md:py-24">
          <div className="container mx-auto px-4 max-w-4xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Powered by <span className="bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 bg-clip-text text-transparent">Vera AI</span>
              </h2>
              <p className="text-lg text-gray-700 mb-6">
                All agents are connected to our knowledge base through RAG (Retrieval-Augmented Generation), 
                ensuring they have access to the latest information and can provide context-aware responses.
              </p>
              <Link 
                href="/vera"
                className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-semibold"
              >
                <span>Try Vera AI</span>
                <FaArrowRight />
              </Link>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

