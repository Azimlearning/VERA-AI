// src/components/VeraHero.js
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { FaRobot, FaBolt, FaArrowRight } from 'react-icons/fa';

/**
 * Vera Hero Section
 * 
 * Hero section introducing Vera as the core AI intelligence
 * Features animated text, glowing effects, and CTA
 */
export default function VeraHero() {
  const [particles, setParticles] = useState([]);
  const text = "VERA";
  const letters = text.split('');

  useEffect(() => {
    // Generate particle positions after mount
    const timer = setTimeout(() => {
      const generatedParticles = Array.from({ length: 25 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        top: Math.random() * 100,
        delay: Math.random() * 5,
        duration: 8 + Math.random() * 8,
      }));
      setParticles(generatedParticles);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section 
      id="vera-hero"
      className="relative min-h-[70vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-gray-900 via-teal-900 to-cyan-900"
    >
      {/* Animated Background Particles */}
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute w-2 h-2 bg-cyan-400 rounded-full opacity-30"
          style={{
            left: `${particle.left}%`,
            top: `${particle.top}%`,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.3, 0.6, 0.3],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Animated Mesh Gradient Background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-teal-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob" />
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 md:px-8">
        <div className="text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-500/20 backdrop-blur-sm border border-teal-400/30 mb-6"
          >
            <FaBolt className="w-4 h-4 text-teal-300" />
            <span className="text-sm text-teal-200 font-medium">Mega AI Platform</span>
          </motion.div>

          {/* Glass-morphism container for title */}
          <div className="inline-block p-8 md:p-12 rounded-3xl backdrop-blur-xl bg-white/5 border border-white/10 shadow-2xl mb-8">
            {/* Main title with letter-by-letter animation */}
            <h1 className="flex gap-2 md:gap-3 lg:gap-4 justify-center items-center flex-nowrap mb-6">
              {letters.map((letter, index) => (
                <motion.span
                  key={index}
                  initial={{ opacity: 0, y: 50, scale: 0.5 }}
                  animate={{ 
                    opacity: 1, 
                    y: 0, 
                    scale: 1,
                  }}
                  transition={{
                    duration: 0.5,
                    delay: index * 0.1,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  whileHover={{
                    scale: 1.2,
                    y: -10,
                    transition: { duration: 0.2 },
                  }}
                  className="text-7xl md:text-8xl lg:text-9xl font-extrabold text-white tracking-tight drop-shadow-2xl"
                  style={{
                    textShadow: '0 0 30px rgba(6, 182, 212, 0.5), 0 0 60px rgba(6, 182, 212, 0.3)',
                  }}
                >
                  {letter === ' ' ? '\u00A0' : letter}
                </motion.span>
              ))}
            </h1>

            {/* Subtitle */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="space-y-4"
            >
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-4">
                The Core AI Intelligence
              </h2>
              <p className="text-lg md:text-xl text-cyan-200 max-w-3xl mx-auto leading-relaxed">
                Powering our mega AI platform with RAG-powered knowledge and 6 super AI agents that accelerate workflows
              </p>
            </motion.div>
          </div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8"
          >
            <Link href="/vera">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="group flex items-center gap-3 px-8 py-4 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-full shadow-lg hover:shadow-2xl transition-all duration-300"
              >
                <FaRobot className="text-xl" />
                <span>Try Vera Now</span>
                <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </Link>
            <Link href="#ai-ecosystem">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-3 px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-semibold rounded-full border border-white/30 hover:border-white/50 transition-all duration-300"
              >
                <span>Explore AI Ecosystem</span>
                <FaArrowRight />
              </motion.button>
            </Link>
          </motion.div>

          {/* Feature Pills */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.6 }}
            className="flex flex-wrap justify-center gap-3 mt-12"
          >
            {['RAG-Powered', 'Citation-Backed', 'Knowledge Base', '6 AI Agents'].map((feature, index) => (
              <motion.div
                key={feature}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.2 + index * 0.1 }}
                className="px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-sm text-cyan-200"
              >
                {feature}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

