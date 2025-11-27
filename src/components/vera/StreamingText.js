// src/components/vera/StreamingText.js
'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

/**
 * StreamingText Component
 * 
 * Displays text with a streaming/typing effect
 * Supports interruption via stop callback
 */
export default function StreamingText({ 
  text, 
  onComplete, 
  onStop,
  speed = 30, // milliseconds per character
  className = ''
}) {
  const [displayedText, setDisplayedText] = useState('');
  const [isStreaming, setIsStreaming] = useState(true);
  const intervalRef = useRef(null);
  const stopRequestedRef = useRef(false);

  useEffect(() => {
    if (!text) {
      setDisplayedText('');
      setIsStreaming(false);
      return;
    }

    // Reset state
    setDisplayedText('');
    setIsStreaming(true);
    stopRequestedRef.current = false;
    let currentIndex = 0;

    const stream = () => {
      if (stopRequestedRef.current || currentIndex >= text.length) {
        setIsStreaming(false);
        if (currentIndex >= text.length && onComplete) {
          onComplete();
        }
        return;
      }

      // Stream word by word for better performance
      const nextSpace = text.indexOf(' ', currentIndex);
      const nextNewline = text.indexOf('\n', currentIndex);
      let nextBreak = -1;
      
      if (nextSpace !== -1 && nextNewline !== -1) {
        nextBreak = Math.min(nextSpace, nextNewline);
      } else if (nextSpace !== -1) {
        nextBreak = nextSpace;
      } else if (nextNewline !== -1) {
        nextBreak = nextNewline;
      }

      if (nextBreak === -1) {
        // No more breaks, stream remaining characters
        setDisplayedText(text);
        setIsStreaming(false);
        if (onComplete) onComplete();
        return;
      }

      // Stream up to the next break
      const chunk = text.substring(currentIndex, nextBreak + 1);
      setDisplayedText(prev => prev + chunk);
      currentIndex = nextBreak + 1;

      // Schedule next chunk
      intervalRef.current = setTimeout(stream, speed * chunk.length);
    };

    // Start streaming
    stream();

    return () => {
      if (intervalRef.current) {
        clearTimeout(intervalRef.current);
      }
    };
  }, [text, speed, onComplete]);

  const handleStop = () => {
    stopRequestedRef.current = true;
    setIsStreaming(false);
    if (intervalRef.current) {
      clearTimeout(intervalRef.current);
    }
    if (onStop) {
      onStop(displayedText);
    }
  };

  return (
    <div className={className}>
      <span>{displayedText}</span>
      {isStreaming && (
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.8, repeat: Infinity, repeatType: 'reverse' }}
          className="inline-block w-2 h-4 bg-current ml-1"
        />
      )}
    </div>
  );
}

