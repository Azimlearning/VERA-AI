// src/components/AIEcosystem.js
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { 
  FaRobot, 
  FaChartLine, 
  FaUsers, 
  FaPodcast, 
  FaFileAlt, 
  FaImages,
  FaQuestionCircle,
  FaBolt
} from 'react-icons/fa';

/**
 * AI Ecosystem Visualization
 * 
 * Interactive visualization showing Vera at the center with 6 super AI agents orbiting
 * Emphasizes the mega AI platform narrative and workflow acceleration
 */

const AI_AGENTS = [
  {
    id: 'analytics',
    name: 'Analytics Agent',
    shortName: 'Analytics',
    description: 'AI-powered data insights & forecasting',
    icon: FaChartLine,
    href: '/agents/analytics',
    gradient: 'from-blue-400 to-cyan-500',
    color: '#3b82f6',
    angle: 0,
    radius: 200,
  },
  {
    id: 'meetings',
    name: 'Meetings Agent',
    shortName: 'Meetings',
    description: 'AI meeting analysis & action items',
    icon: FaUsers,
    href: '/agents/meetings',
    gradient: 'from-purple-400 to-pink-500',
    color: '#a855f7',
    angle: 60,
    radius: 200,
  },
  {
    id: 'podcast',
    name: 'Podcast Agent',
    shortName: 'Podcast',
    description: 'AI podcast creation',
    icon: FaPodcast,
    href: '/agents/podcast',
    gradient: 'from-orange-400 to-red-500',
    color: '#f97316',
    angle: 120,
    radius: 200,
  },
  {
    id: 'content',
    name: 'Content Agent',
    shortName: 'Content',
    description: 'AI story drafting & image generation',
    icon: FaFileAlt,
    href: '/agents/content',
    gradient: 'from-green-400 to-emerald-500',
    color: '#10b981',
    angle: 180,
    radius: 200,
  },
  {
    id: 'visual',
    name: 'Visual Agent',
    shortName: 'Visual',
    description: 'AI image analysis & tagging',
    icon: FaImages,
    href: '/agents/visual',
    gradient: 'from-indigo-400 to-purple-500',
    color: '#6366f1',
    angle: 240,
    radius: 200,
  },
  {
    id: 'quiz',
    name: 'Quiz Agent',
    shortName: 'Quiz',
    description: 'AI quiz generation from content',
    icon: FaQuestionCircle,
    href: '/agents/quiz',
    gradient: 'from-pink-400 to-rose-500',
    color: '#ec4899',
    angle: 300,
    radius: 200,
  },
];

export default function AIEcosystem() {
  const [rotation, setRotation] = useState(0);
  const [hoveredAgent, setHoveredAgent] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Orbital rotation animation
  useEffect(() => {
    if (!mounted) return;
    
    const rotationInterval = setInterval(() => {
      setRotation(prev => (prev + 0.15) % 360);
    }, 30);

    return () => clearInterval(rotationInterval);
  }, [mounted]);

  return (
    <section id="ai-ecosystem" className="relative w-full py-16 md:py-24 bg-gradient-to-br from-slate-50 via-cyan-50 to-teal-50">
      {/* Animated mesh gradient background */}
      <div className="absolute inset-0 opacity-20 -z-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-teal-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob" />
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000" />
      </div>

      {/* Heading */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12 md:mb-16 relative z-10"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100/80 backdrop-blur-sm border border-slate-300/50 mb-6">
          <FaBolt className="w-4 h-4 text-teal-600" />
          <span className="text-sm text-slate-700 font-medium">Mega AI Platform</span>
        </div>
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-slate-800 mb-3">
          Super AI Agents That <span className="bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 bg-clip-text text-transparent">Accelerate Workflows</span>
        </h2>
        <p className="text-lg md:text-xl text-slate-700 max-w-3xl mx-auto">
          Vera powers 6 specialized AI agents, each designed to accelerate specific workflows and boost productivity
        </p>
      </motion.div>

      {/* Main Ecosystem Visualization */}
      <div className="relative w-full max-w-6xl mx-auto px-4">
        <div 
          className="relative rounded-3xl overflow-hidden p-8 md:p-12"
          style={{ 
            minHeight: '700px',
            background: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(40px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          }}
        >
          {/* Orbital System */}
          <div className="relative h-[600px] flex items-center justify-center overflow-hidden">
            {/* Orbital rings with rotation */}
            <div 
              className="absolute w-[400px] h-[400px] rounded-full"
              style={{
                border: '2px solid rgba(6, 182, 212, 0.2)',
                boxShadow: '0 0 30px rgba(6, 182, 212, 0.1)',
                transform: `rotate(${mounted ? rotation : 0}deg)`,
                transition: mounted ? 'transform 0.05s linear' : 'none'
              }}
            />
            <div 
              className="absolute w-[500px] h-[500px] rounded-full"
              style={{
                border: '1px solid rgba(6, 182, 212, 0.1)',
                boxShadow: '0 0 40px rgba(6, 182, 212, 0.05)',
                transform: `rotate(${mounted ? -rotation * 0.5 : 0}deg)`,
                transition: mounted ? 'transform 0.05s linear' : 'none'
              }}
            />

            {/* Center Hub - Vera */}
            <div className="relative z-20">
              <div className="absolute inset-0 bg-white/20 rounded-full blur-2xl" />
              
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', duration: 0.8, delay: 0.2 }}
                className="relative w-56 h-56 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-2xl border-4 border-white/50 cursor-pointer group"
                style={{
                  boxShadow: '0 20px 60px rgba(249, 115, 22, 0.4), inset 0 0 40px rgba(255, 255, 255, 0.5)'
                }}
                whileHover={{ scale: 1.1 }}
              >
                <Link href="/vera" className="flex flex-col items-center justify-center w-full h-full">
                  <FaRobot className="text-white text-6xl mb-2 group-hover:scale-110 transition-transform" />
                  <span className="text-white font-bold text-xl">VERA</span>
                  <span className="text-white/80 text-xs mt-1">Core Intelligence</span>
                </Link>
                
                {/* Pulsing glow effect */}
                <motion.div
                  className="absolute inset-0 rounded-full bg-orange-400 opacity-30"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.5, 0.3],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              </motion.div>
            </div>

            {/* Orbiting AI Agents */}
            {AI_AGENTS.map((agent) => {
              const currentAngle = mounted ? agent.angle + rotation : agent.angle;
              const radians = (currentAngle * Math.PI) / 180;
              
              const x = Math.cos(radians) * agent.radius;
              const y = Math.sin(radians) * agent.radius;
              
              const isHovered = hoveredAgent === agent.id;

              return (
                <motion.div
                  key={agent.id}
                  className="absolute z-30 transition-all duration-300"
                  style={{
                    left: '50%',
                    top: '50%',
                    transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
                  }}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ 
                    opacity: 1, 
                    scale: isHovered ? 1.15 : 1,
                  }}
                  transition={{ delay: 0.4 + (agent.angle / 360) * 0.5 }}
                  onMouseEnter={() => setHoveredAgent(agent.id)}
                  onMouseLeave={() => setHoveredAgent(null)}
                >
                  <Link href={agent.href}>
                    <motion.div
                      whileHover={{ scale: 1.1, y: -5 }}
                      whileTap={{ scale: 0.95 }}
                      className={`
                        relative w-32 h-32 rounded-full bg-gradient-to-br ${agent.gradient}
                        flex flex-col items-center justify-center shadow-2xl border-4 border-white/50
                        cursor-pointer group
                        ${isHovered ? 'ring-4 ring-cyan-400 ring-opacity-50' : ''}
                      `}
                      style={{
                        boxShadow: isHovered 
                          ? `0 20px 60px ${agent.color}80, inset 0 0 30px rgba(255, 255, 255, 0.3)`
                          : '0 10px 40px rgba(0, 0, 0, 0.3), inset 0 0 20px rgba(255, 255, 255, 0.2)'
                      }}
                    >
                      <agent.icon className="text-white text-3xl mb-1 group-hover:scale-110 transition-transform" />
                      <span className="text-white font-bold text-xs text-center px-2">{agent.shortName}</span>
                      
                      {/* Connection line to Vera */}
                      {isHovered && (
                        <motion.div
                          initial={{ opacity: 0, scaleX: 0 }}
                          animate={{ opacity: 1, scaleX: 1 }}
                          className="absolute -z-10"
                          style={{
                            width: `${agent.radius}px`,
                            height: '2px',
                            background: `linear-gradient(to right, ${agent.color}80, transparent)`,
                            transformOrigin: 'left center',
                            transform: `rotate(${currentAngle}deg)`,
                            left: '50%',
                            top: '50%',
                          }}
                        />
                      )}
                    </motion.div>
                  </Link>

                  {/* Tooltip on hover */}
                  {isHovered && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute top-full left-1/2 transform -translate-x-1/2 mt-4 w-48 bg-white rounded-lg shadow-xl border border-gray-200 p-3 z-50"
                    >
                      <h3 className="font-bold text-gray-900 text-sm mb-1">{agent.name}</h3>
                      <p className="text-xs text-gray-600">{agent.description}</p>
                      <div className="mt-2 text-xs text-teal-600 font-semibold">
                        Accelerates Workflow →
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Agent Cards Below */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mt-8">
            {AI_AGENTS.map((agent, index) => (
              <motion.div
                key={agent.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <Link href={agent.href}>
                  <div className={`
                    bg-white rounded-lg p-4 shadow-md hover:shadow-xl transition-all duration-300
                    border-2 ${hoveredAgent === agent.id ? 'border-teal-500' : 'border-gray-200'}
                  `}>
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${agent.gradient} flex items-center justify-center mb-2 mx-auto`}>
                      <agent.icon className="text-white text-xl" />
                    </div>
                    <h3 className="text-sm font-bold text-gray-800 text-center mb-1">{agent.shortName}</h3>
                    <p className="text-xs text-gray-600 text-center">{agent.description}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

