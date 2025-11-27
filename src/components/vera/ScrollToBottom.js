// src/components/vera/ScrollToBottom.js
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaArrowDown } from 'react-icons/fa';

export default function ScrollToBottom({ containerRef }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const container = containerRef?.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 100; // 100px threshold
      setIsVisible(!isAtBottom && scrollHeight > clientHeight);
    };

    container.addEventListener('scroll', handleScroll);
    handleScroll(); // Check initial state

    return () => container.removeEventListener('scroll', handleScroll);
  }, [containerRef]);

  const scrollToBottom = () => {
    if (containerRef?.current) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={scrollToBottom}
          className="fixed bottom-24 right-8 z-50 w-10 h-10 bg-teal-600 hover:bg-teal-700 text-white rounded-full shadow-lg flex items-center justify-center transition-colors"
          title="Scroll to bottom"
        >
          <FaArrowDown className="w-4 h-4" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}

