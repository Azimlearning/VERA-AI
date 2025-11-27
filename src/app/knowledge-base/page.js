// src/app/knowledge-base/page.js
'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { FaBook, FaFileAlt, FaNewspaper, FaRocket, FaChartLine } from 'react-icons/fa';
import FadeInWhenVisible from '../../components/animations/FadeInWhenVisible';

const knowledgeBaseSections = [
  {
    id: 'petronas-2.0',
    title: 'PETRONAS 2.0',
    description: 'Explore PETRONAS transformation journey toward becoming an integrated energy company by 2035',
    icon: FaRocket,
    href: '/petronas-2.0',
    gradient: 'from-blue-500 to-cyan-500',
    color: 'blue'
  },
  {
    id: 'systemic-shifts',
    title: 'Systemic Shifts',
    description: 'Strategic shifts, key initiatives, mindset & behavior changes, and progress tracking',
    icon: FaChartLine,
    href: '/systemic-shifts/upstream-target',
    gradient: 'from-teal-500 to-green-500',
    color: 'teal',
    subSections: [
      { name: 'Upstream Target', href: '/systemic-shifts/upstream-target' },
      { name: 'Key Shifts', href: '/systemic-shifts/key-shifts' },
      { name: 'Mindset & Behaviour', href: '/systemic-shifts/mindset-behaviour' },
      { name: 'Our Progress', href: '/systemic-shifts/our-progress' },
    ]
  },
  {
    id: 'articles',
    title: 'Articles',
    description: 'Insights, updates, and stories from across PETRONAS Upstream',
    icon: FaNewspaper,
    href: '/articles',
    gradient: 'from-purple-500 to-pink-500',
    color: 'purple'
  },
  {
    id: 'upstreambuzz',
    title: 'UpstreamBuzz',
    description: 'Your source for PETRONAS Upstream stories and insights',
    icon: FaFileAlt,
    href: '/knowledge-base/upstreambuzz',
    gradient: 'from-orange-500 to-red-500',
    color: 'orange'
  },
];

export default function KnowledgeBasePage() {
  return (
    <FadeInWhenVisible key="knowledge-base-overview">
      <section id="knowledge-base-overview" className="py-16 md:py-24">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-100 border border-teal-300 mb-6">
              <FaBook className="w-5 h-5 text-teal-600" />
              <span className="text-sm text-teal-700 font-medium">Knowledge Base</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4">
              Knowledge <span className="text-teal-600">Base</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
              Access comprehensive information about PETRONAS 2.0, Systemic Shifts, articles, and more
            </p>
          </motion.div>

          {/* Knowledge Base Sections Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {knowledgeBaseSections.map((section, index) => (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.4 }}
                whileHover={{ y: -5, scale: 1.02 }}
              >
                <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 h-full border border-gray-200 hover:border-teal-300 flex flex-col">
                  <Link href={section.href} className="flex-grow">
                    <div className={`w-16 h-16 rounded-lg bg-gradient-to-br ${section.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <section.icon className="text-white text-2xl" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-teal-600 transition-colors">
                      {section.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed mb-4">
                      {section.description}
                    </p>
                  </Link>
                  
                  {/* Sub-sections for Systemic Shifts */}
                  {section.subSections && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-sm font-semibold text-gray-700 mb-2">Explore:</p>
                      <div className="flex flex-wrap gap-2">
                        {section.subSections.map((subSection) => (
                          <Link
                            key={subSection.name}
                            href={subSection.href}
                            className="text-xs px-3 py-1 bg-teal-50 text-teal-700 rounded-full hover:bg-teal-100 transition-colors"
                          >
                            {subSection.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <Link href={section.href} className="mt-4 flex items-center text-teal-600 font-semibold group-hover:text-teal-700 transition-colors">
                    <span className="text-sm">Explore {section.title}</span>
                    <span className="ml-2">→</span>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Additional Info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="mt-12 text-center"
          >
            <div className="bg-teal-50 border border-teal-200 rounded-lg p-6 max-w-3xl mx-auto">
              <p className="text-gray-700">
                <strong className="text-teal-700">Note:</strong> This Knowledge Base contains all the information that powers{' '}
                <Link href="/vera" className="text-teal-600 hover:text-teal-700 font-semibold underline">
                  Vera
                </Link>
                , our core AI assistant. Vera uses this knowledge to provide accurate, citation-backed answers to your questions.
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    </FadeInWhenVisible>
  );
}

