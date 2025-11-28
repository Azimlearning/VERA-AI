// src/components/agents/TryPageLayout.js
// Shared layout component for all agent try pages - Updated to use UnifiedAppLayout

'use client';

import UnifiedAppLayout from '../layout/UnifiedAppLayout';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { FaBolt, FaArrowLeft } from 'react-icons/fa';

export default function TryPageLayout({
  agentName,
  agentBadge,
  agentIcon: AgentIcon,
  agentColor,
  agentGradient,
  description,
  children
}) {
  const router = useRouter();

  const handleNewChat = () => {
    router.push('/vera');
  };

  const handleLoadSession = () => {
    router.push('/vera');
  };

  return (
    <UnifiedAppLayout
      onNewChat={handleNewChat}
      onLoadSession={handleLoadSession}
    >
      <div className="w-full">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-gray-900 via-gray-800 to-teal-900 text-white py-12 md:py-16">
          <div className="container mx-auto px-4 max-w-7xl">
            {/* Back to Agents Button */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
              className="mb-6"
            >
              <button
                onClick={() => router.push('/agents')}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-lg transition-all border border-white/20 hover:border-white/40"
              >
                <FaArrowLeft className="w-4 h-4" />
                <span>Back to AI Agents</span>
              </button>
            </motion.div>

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
                Powered by <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-emerald-500">Vera</span> AI with RAG and knowledge base integration
              </p>
            </motion.div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-8 md:py-12 bg-white">
          <div className="container mx-auto px-4 max-w-6xl">
            {children}
          </div>
        </section>
      </div>
    </UnifiedAppLayout>
  );
}
