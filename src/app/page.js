// src/app/page.js
/**
 * About Page - Vera AI Platform
 * 
 * Comprehensive About page covering:
 * - Vera's capabilities and features
 * - How Vera works (technical overview with RAG, knowledge base integration)
 * - Overview of the 6 AI agents
 * - Technology stack and architecture
 * - Use cases and benefits
 */

'use client';

import Header from '../components/Header';
import LoadingAnimation from '../components/LoadingAnimation';
import Footer from '../components/Footer';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  FaRobot, 
  FaDatabase, 
  FaBolt, 
  FaChartLine, 
  FaUsers, 
  FaPodcast, 
  FaFileAlt, 
  FaImages,
  FaQuestionCircle,
  FaArrowRight,
  FaCode,
  FaCloud,
  FaShieldAlt
} from 'react-icons/fa';

export default function AboutPage() {
  const agents = [
    {
      id: 'analytics',
      name: 'Analytics Agent',
      description: 'AI-powered data insights & forecasting. Analyze trends, generate reports, and predict outcomes.',
      icon: FaChartLine,
      href: '/agents/analytics',
      gradient: 'from-blue-400 to-cyan-500',
    },
    {
      id: 'meetings',
      name: 'Meetings Agent',
      description: 'AI meeting analysis & action items. Extract insights, summarize discussions, and track decisions.',
      icon: FaUsers,
      href: '/agents/meetings',
      gradient: 'from-purple-400 to-pink-500',
    },
    {
      id: 'podcast',
      name: 'Podcast Agent',
      description: 'AI podcast creation. Generate scripts, create audio content, and produce engaging podcasts.',
      icon: FaPodcast,
      href: '/agents/podcast',
      gradient: 'from-orange-400 to-red-500',
    },
    {
      id: 'content',
      name: 'Content Agent',
      description: 'AI content & image generation. Create stories, articles, and visuals in Systemic Shifts style.',
      icon: FaFileAlt,
      href: '/agents/content',
      gradient: 'from-green-400 to-emerald-500',
    },
    {
      id: 'visual',
      name: 'Visual Agent',
      description: 'AI visual intelligence. Analyze images, generate tags, and organize visual content.',
      icon: FaImages,
      href: '/agents/visual',
      gradient: 'from-indigo-400 to-purple-500',
    },
    {
      id: 'quiz',
      name: 'Quiz Agent',
      description: 'AI quiz generation. Create quizzes from knowledge base or custom content automatically.',
      icon: FaQuestionCircle,
      href: '/agents/quiz',
      gradient: 'from-yellow-400 to-orange-500',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100 font-sans flex flex-col">
      <LoadingAnimation />
      <Header />
      <main className="flex-grow relative z-10">
        {/* Hero Section */}
        <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-gray-900 via-teal-900 to-cyan-900">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-teal-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob" />
            <div className="absolute top-0 right-1/4 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000" />
          </div>
          
          <div className="relative z-10 w-full max-w-7xl mx-auto px-4 md:px-8 py-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-500/20 backdrop-blur-sm border border-teal-400/30 mb-6">
                <FaBolt className="w-4 h-4 text-teal-300" />
                <span className="text-sm text-teal-200 font-medium">Mega AI Platform</span>
              </div>
              
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-white mb-6">
                About Vera AI
              </h1>
              <p className="text-xl md:text-2xl text-cyan-200 max-w-3xl mx-auto leading-relaxed mb-8">
                The core AI intelligence powering our mega AI platform with RAG-powered knowledge and 6 super AI agents that accelerate workflows
              </p>
              
              <Link href="/vera">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center gap-3 px-8 py-4 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-full shadow-lg hover:shadow-2xl transition-all duration-300"
                >
                  <FaRobot className="text-xl" />
                  <span>Try Vera Now</span>
                  <FaArrowRight />
                </motion.button>
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Vera Capabilities Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Vera&apos;s Capabilities
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Powered by advanced AI technology and integrated with your knowledge base
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  icon: FaDatabase,
                  title: 'RAG-Powered',
                  description: 'Retrieval-Augmented Generation ensures accurate, citation-backed responses from your knowledge base.',
                },
                {
                  icon: FaShieldAlt,
                  title: 'Citation-Backed',
                  description: 'Every response includes source citations, ensuring transparency and verifiability.',
                },
                {
                  icon: FaBolt,
                  title: 'Real-Time Streaming',
                  description: 'Experience live streaming responses with markdown support and syntax highlighting.',
                },
                {
                  icon: FaCode,
                  title: 'Code Generation',
                  description: 'Generate, analyze, and explain code with full syntax highlighting and copy functionality.',
                },
                {
                  icon: FaCloud,
                  title: 'Multimodal Support',
                  description: 'Process images, PDFs, and audio files alongside text for comprehensive understanding.',
                },
                {
                  icon: FaRobot,
                  title: 'Agent Integration',
                  description: 'Seamlessly invoke 6 specialized AI agents for specific workflow acceleration tasks.',
                },
              ].map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="p-6 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 hover:shadow-lg transition-shadow"
                >
                  <div className="w-12 h-12 rounded-lg bg-teal-100 flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-teal-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* How Vera Works Section */}
        <section className="py-20 bg-gradient-to-br from-teal-50 to-cyan-50">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                How Vera Works
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                A technical overview of Vera&apos;s architecture and knowledge integration
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="p-8 rounded-xl bg-white shadow-lg"
              >
                <h3 className="text-2xl font-bold text-gray-900 mb-4">RAG Architecture</h3>
                <p className="text-gray-600 mb-4">
                  Vera uses Retrieval-Augmented Generation (RAG) to provide accurate, context-aware responses:
                </p>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-start">
                    <span className="text-teal-600 mr-2">•</span>
                    <span>Query embedding generation for semantic search</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-teal-600 mr-2">•</span>
                    <span>Knowledge base document retrieval (top-k similarity)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-teal-600 mr-2">•</span>
                    <span>Context injection with source metadata</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-teal-600 mr-2">•</span>
                    <span>LLM generation with citation tracking</span>
                  </li>
                </ul>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="p-8 rounded-xl bg-white shadow-lg"
              >
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Knowledge Base Integration</h3>
                <p className="text-gray-600 mb-4">
                  Vera&apos;s knowledge base is continuously updated and optimized:
                </p>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-start">
                    <span className="text-teal-600 mr-2">•</span>
                    <span>Vector embeddings for semantic search</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-teal-600 mr-2">•</span>
                    <span>Category-based filtering and organization</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-teal-600 mr-2">•</span>
                    <span>Automatic document processing and chunking</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-teal-600 mr-2">•</span>
                    <span>Similarity threshold optimization (0.65 cosine)</span>
                  </li>
                </ul>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="p-8 rounded-xl bg-gradient-to-br from-teal-600 to-cyan-600 text-white"
            >
              <h3 className="text-2xl font-bold mb-4">Technology Stack</h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">Frontend</h4>
                  <p className="text-teal-100">Next.js 14, React, Tailwind CSS, Framer Motion</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Backend</h4>
                  <p className="text-teal-100">Firebase Cloud Functions, Firestore, Cloud Storage</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">AI Models</h4>
                  <p className="text-teal-100">Google Gemini, OpenRouter (multiple models), Embeddings API</p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* AI Agents Overview Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                The 6 Super AI Agents
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Specialized AI agents that accelerate workflows across different domains
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {agents.map((agent, index) => (
                <motion.div
                  key={agent.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="group p-6 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 hover:shadow-xl transition-all duration-300"
                >
                  <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${agent.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <agent.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{agent.name}</h3>
                  <p className="text-gray-600 mb-4">{agent.description}</p>
                  <Link href={agent.href}>
                    <span className="inline-flex items-center text-teal-600 font-semibold hover:text-teal-700 transition-colors">
                      Try Agent <FaArrowRight className="ml-2" />
                    </span>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Use Cases Section */}
        <section className="py-20 bg-gradient-to-br from-gray-900 to-teal-900 text-white">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Use Cases & Benefits
              </h2>
              <p className="text-xl text-cyan-200 max-w-3xl mx-auto">
                How Vera accelerates workflows across your organization
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8">
              {[
                {
                  title: 'Knowledge Discovery',
                  description: 'Quickly find and understand information from your knowledge base with citation-backed answers.',
                },
                {
                  title: 'Content Creation',
                  description: 'Generate articles, stories, and visuals in your brand style using AI-powered content agents.',
                },
                {
                  title: 'Data Analysis',
                  description: 'Get instant insights from your data with the Analytics Agent, including forecasting and trend analysis.',
                },
                {
                  title: 'Meeting Intelligence',
                  description: 'Automatically extract action items, summarize discussions, and track decisions from meeting transcripts.',
                },
                {
                  title: 'Learning & Development',
                  description: 'Create quizzes, generate podcasts, and develop training materials automatically.',
                },
                {
                  title: 'Visual Organization',
                  description: 'Automatically tag, categorize, and organize visual content with AI-powered image analysis.',
                },
              ].map((useCase, index) => (
                <motion.div
                  key={useCase.title}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className="p-6 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20"
                >
                  <h3 className="text-xl font-bold mb-2">{useCase.title}</h3>
                  <p className="text-cyan-200">{useCase.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-white">
          <div className="max-w-4xl mx-auto px-4 md:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Ready to Experience Vera?
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Start using Vera AI today and accelerate your workflows with intelligent automation
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/vera">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-4 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-full shadow-lg hover:shadow-2xl transition-all duration-300"
                  >
                    Try Vera Now
                  </motion.button>
                </Link>
                <Link href="/agents">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-4 bg-white hover:bg-gray-50 text-teal-600 font-semibold rounded-full border-2 border-teal-600 transition-all duration-300"
                  >
                    Explore AI Agents
                  </motion.button>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
