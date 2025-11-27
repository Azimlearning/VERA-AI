// src/components/agents/TryPageLayout.js
// Shared layout component for all agent try pages

'use client';

import Header from '../Header';
import Footer from '../Footer';
import { motion } from 'framer-motion';
import { FaBolt } from 'react-icons/fa';

export default function TryPageLayout({
  agentName,
  agentBadge,
  agentIcon: AgentIcon,
  agentColor,
  agentGradient,
  description,
  children,
  fullVersionLink
}) {
  return (
    <div className="min-h-screen bg-gray-100 font-sans flex flex-col">
      <Header />
      <main className="flex-grow relative z-10">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-gray-900 via-gray-800 to-teal-900 text-white py-12 md:py-16">
          <div className="container mx-auto px-4 max-w-7xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${agentBadge.bg} border ${agentBadge.border} mb-4`}>
                <FaBolt className={`w-4 h-4 ${agentBadge.iconColor}`} />
                <span className={`text-sm ${agentBadge.textColor} font-medium`}>{agentName}</span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 flex items-center justify-center gap-3">
                {AgentIcon && <AgentIcon className={`text-${agentColor}-400`} />}
                <span>Try {agentName}</span>
              </h1>
              <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto">
                {description}
              </p>
              <p className="text-sm text-gray-400 mt-2">
                Powered by Vera AI with RAG and knowledge base integration
              </p>
            </motion.div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-8 md:py-12">
          <div className="container mx-auto px-4 max-w-6xl">
            {children}
          </div>
        </section>

        {/* Full Version CTA */}
        {fullVersionLink && (
          <section className="bg-gradient-to-br from-slate-50 via-cyan-50 to-teal-50 py-8 border-t border-gray-200">
            <div className="container mx-auto px-4 max-w-6xl text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Ready for the full experience?
                </h3>
                <p className="text-gray-600 mb-4">
                  Access all features, save your work, and manage your data
                </p>
                <a
                  href={fullVersionLink}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-semibold"
                >
                  <span>Use Full Version</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </a>
              </motion.div>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}

