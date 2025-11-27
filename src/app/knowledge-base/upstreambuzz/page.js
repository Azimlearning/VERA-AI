// src/app/knowledge-base/upstreambuzz/page.js
'use client';

import RotatingBanner from '../../../components/RotatingBanner';
import JukrisLens from '../../../components/JukrisLens';
import FadeInWhenVisible from '../../../components/animations/FadeInWhenVisible';
import { motion } from 'framer-motion';
import { FaNewspaper } from 'react-icons/fa';

/**
 * UpstreamBuzz Page
 * 
 * This page contains the UpstreamBuzz content including:
 * - Rotating Banner (Latest Updates)
 * - Jukris Lens section
 */
export default function UpstreamBuzzPage() {
  return (
    <FadeInWhenVisible key="upstreambuzz">
      <section id="upstreambuzz" className="py-16 md:py-24">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-100 border border-orange-300 mb-6">
              <FaNewspaper className="w-5 h-5 text-orange-600" />
              <span className="text-sm text-orange-700 font-medium">UpstreamBuzz</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4">
              Upstream<span className="text-orange-600">Buzz</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
              Your source for PETRONAS Upstream stories and insights
            </p>
          </motion.div>

          {/* Rotating Banner Section (Latest Updates) */}
          <div className="mb-16">
            <RotatingBanner />
          </div>

          {/* Jukris Lens Section */}
          <div>
            <JukrisLens />
          </div>
        </div>
      </section>
    </FadeInWhenVisible>
  );
}



