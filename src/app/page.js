"use client";

import UnifiedAppLayout from "../components/layout/UnifiedAppLayout";
import { useRouter } from "next/navigation";
import { FaEnvelope, FaChartLine, FaFileAlt, FaImage, FaDatabase, FaBolt, FaShieldAlt, FaCloud, FaRobot, FaUsers, FaPodcast, FaImages, FaQuestionCircle, FaArrowRight, FaBrain } from "react-icons/fa";
import { motion } from "framer-motion";
import Link from "next/link";

export default function Dashboard() {
  const router = useRouter();

  const handleNewChat = () => {
    router.push('/vera');
  };

  const handleLoadSession = () => {
    router.push('/vera');
  };

  const quickActions = [
    { 
      title: "Draft Email", 
      icon: FaEnvelope, 
      desc: "Generate professional comms", 
      path: "/vera?agent=content" 
    },
    { 
      title: "Analyze Data", 
      icon: FaChartLine, 
      desc: "Upload CSVs or charts", 
      path: "/vera?agent=analytics" 
    },
    { 
      title: "Summarize", 
      icon: FaFileAlt, 
      desc: "Condense long documents", 
      path: "/vera?agent=default" 
    },
    { 
      title: "Create Image", 
      icon: FaImage, 
      desc: "Generate visual assets", 
      path: "/vera?agent=content" 
    },
  ];

  return (
    <UnifiedAppLayout
      onNewChat={handleNewChat}
      onLoadSession={handleLoadSession}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        {/* 1. GREETING - With Gradient Text */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-3 tracking-tight">
            Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-emerald-500">VERA</span>
          </h1>
          <p className="text-lg text-gray-500 max-w-2xl">
            Your intelligent assistant for <span className="font-semibold text-teal-700">PETRONAS Upstream</span> initiatives.
            <br/>Select an action below to get started.
          </p>
        </div>

        {/* 2. QUICK START GRID - Tier 1 Style */}
        <h2 className="text-lg font-semibold text-gray-800 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
          {quickActions.map((action, i) => {
            const IconComponent = action.icon;
            return (
              <button 
                key={i}
                onClick={() => router.push(action.path)}
                className="group p-6 bg-white border border-gray-200 rounded-2xl hover:border-teal-500/50 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 text-left relative overflow-hidden"
              >
                {/* Gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-teal-50/0 to-teal-50/50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                
                {/* Icon Container - Squircle */}
                <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center text-xl mb-4 group-hover:scale-110 transition-transform relative z-10">
                  <IconComponent className="text-xl" />
                </div>
                
                <h3 className="font-semibold text-gray-900 text-lg mb-1 relative z-10">{action.title}</h3>
                <p className="text-sm text-gray-500 relative z-10">{action.desc}</p>
              </button>
            );
          })}
        </div>

        {/* 3. ABOUT VERA SECTION - Minimalist */}
        <motion.section 
          className="mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-6"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">About <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-emerald-500">VERA</span></h2>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="rounded-xl p-8 mb-8 bg-white border border-gray-200"
          >
            <p className="text-gray-700 leading-relaxed mb-4">
              <strong className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-emerald-500">VERA</strong> is an intelligent AI assistant designed specifically for <strong className="text-teal-700">PETRONAS Upstream</strong> operations, initiatives, and employee support. 
              With knowledge about <strong>PETRONAS 2.0</strong> and <strong>Systemic Shifts</strong> as supporting context, <strong className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-emerald-500">VERA</strong> helps accelerate workflows across your organization.
            </p>
            <p className="text-gray-700 leading-relaxed">
              <strong className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-emerald-500">VERA</strong> leverages Retrieval-Augmented Generation (RAG) technology to provide accurate, citation-backed responses from your knowledge base, 
              ensuring you have access to the latest information about PETRONAS Upstream operations and strategic initiatives.
            </p>
          </motion.div>
        </motion.section>

        {/* 4. VERA CAPABILITIES SECTION */}
        <section className="py-12 mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-emerald-500">Vera</span>&apos;s Capabilities
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Powered by advanced AI technology and integrated with your knowledge base
            </p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                icon: FaBrain,
                title: 'Specialized Knowledge',
                description: 'Deep understanding of PETRONAS Upstream operations, PETRONAS 2.0, and Systemic Shifts initiatives.',
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
                className="p-6 rounded-xl bg-white border border-gray-200 hover:shadow-lg transition-shadow"
              >
                <div className="w-12 h-12 rounded-lg bg-teal-100 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-teal-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* 5. HOW VERA WORKS SECTION */}
        <section className="py-12 mb-16 bg-gradient-to-br from-teal-50 to-cyan-50 rounded-2xl">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                How <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-emerald-500">Vera</span> Works
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                A technical overview of <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-emerald-500">Vera</span>&apos;s architecture and knowledge integration
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
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-emerald-500">Vera</span> uses Retrieval-Augmented Generation (RAG) to provide accurate, context-aware responses:
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
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-emerald-500">Vera</span>&apos;s knowledge base is continuously updated and optimized:
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

        {/* 6. USE CASES SECTION */}
        <section className="py-12 mb-16 bg-gradient-to-br from-gray-900 to-teal-900 text-white rounded-2xl">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Use Cases & Benefits
              </h2>
              <p className="text-xl text-cyan-200 max-w-3xl mx-auto">
                How <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-emerald-500">Vera</span> accelerates workflows across your organization
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

        {/* 7. CTA SECTION */}
        <section className="py-12">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Ready to Experience <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-emerald-500">Vera</span>?
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Start using <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-emerald-500">Vera</span> AI today and accelerate your workflows with intelligent automation
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
      </div>
    </UnifiedAppLayout>
  );
}
