// src/components/vera/ChatInput.js
'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPaperPlane, FaTimes, FaStop } from 'react-icons/fa';
import AgentPickerButton from './AgentPickerButton';

/**
 * ChatInput Component
 * 
 * Advanced input component with:
 * - Agent selector button (replaces file upload)
 * - Slash commands (/code, /write, /image, /analyze, /summarize)
 * - Stop/Interrupt button during generation
 */
const SLASH_COMMANDS = [
  { command: '/code', description: 'Generate or analyze code' },
  { command: '/write', description: 'Write content or documentation' },
  { command: '/image', description: 'Generate or analyze images' },
  { command: '/analyze', description: 'Analyze data or content' },
  { command: '/summarize', description: 'Summarize text or documents' },
];

export default function ChatInput({
  value,
  onChange,
  onSubmit,
  onStop,
  isLoading = false,
  placeholder = 'Type your question here...',
  className = '',
  selectedAgent = null,
  onAgentSelect = null
}) {
  const [showCommands, setShowCommands] = useState(false);
  const [commandFilter, setCommandFilter] = useState('');
  const [showScrollbar, setShowScrollbar] = useState(false);
  const [showAgentPicker, setShowAgentPicker] = useState(false);
  const inputRef = useRef(null);

  // Local draft saving
  useEffect(() => {
    const savedDraft = localStorage.getItem('vera-chat-draft');
    if (savedDraft && !value) {
      onChange(savedDraft);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (value) {
      localStorage.setItem('vera-chat-draft', value);
    } else {
      localStorage.removeItem('vera-chat-draft');
    }
  }, [value]);

  // Handle slash command detection - use derived state instead of effect
  const shouldShowCommands = value && value.endsWith('/');
  
  useEffect(() => {
    if (shouldShowCommands !== showCommands) {
      setShowCommands(shouldShowCommands);
      if (shouldShowCommands) {
        setCommandFilter('');
      }
    }
  }, [shouldShowCommands, showCommands]);

  // Filter commands based on input
  const filteredCommands = SLASH_COMMANDS.filter(cmd =>
    cmd.command.toLowerCase().includes(commandFilter.toLowerCase()) ||
    cmd.description.toLowerCase().includes(commandFilter.toLowerCase())
  );

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    onChange(newValue);
    
    // Update command filter if showing commands
    if (showCommands && newValue.includes('/')) {
      const afterSlash = newValue.substring(newValue.lastIndexOf('/') + 1);
      setCommandFilter(afterSlash);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isLoading && value.trim()) {
        onSubmit();
      }
    } else if (e.key === 'Escape') {
      setShowCommands(false);
    }
  };

  const handleCommandSelect = (command) => {
    const beforeSlash = value.substring(0, value.lastIndexOf('/'));
    const newValue = beforeSlash + command + ' ';
    onChange(newValue);
    setShowCommands(false);
    inputRef.current?.focus();
  };

  const handleSubmit = () => {
    if (!isLoading && value.trim()) {
      localStorage.removeItem('vera-chat-draft'); // Clear draft when sent
      onSubmit();
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Gemini Style Input Wrapper */}
      <div className="chat-input-wrapper">
        {/* Text Area */}
        <textarea
          ref={inputRef}
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows={1}
          className="chat-textarea"
          style={{
            ...(showScrollbar ? {} : {
              scrollbarWidth: 'none',
              msOverflowStyle: 'none'
            })
          }}
          onInput={(e) => {
            e.target.style.height = 'auto';
            const newHeight = Math.min(e.target.scrollHeight, 200);
            e.target.style.height = `${newHeight}px`;
            // Show scrollbar only when content exceeds 3 lines (~80px)
            setShowScrollbar(e.target.scrollHeight > 80);
          }}
        />

        {/* Footer Toolbar */}
        <div className="chat-input-footer">
          {/* Left: Tools Button (Agent Picker) */}
          <div className="footer-left" style={{ position: 'relative' }}>
            {onAgentSelect ? (
              <div style={{ display: 'inline-block' }}>
                <AgentPickerButton
                  selectedAgent={selectedAgent}
                  onAgentSelect={onAgentSelect}
                />
              </div>
            ) : (
              <button className="tool-btn">
                <span className="plus-icon">+</span>
                <span>Tools</span>
              </button>
            )}
          </div>

          {/* Right: Model Selector & Send Button */}
          <div className="footer-right" style={{ display: 'flex', alignItems: 'center' }}>
            <button className="model-selector-btn">
              {selectedAgent ? selectedAgent.name : 'Vera'} (Default) <span className="arrow-down">▼</span>
            </button>
            
            {isLoading ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onStop}
                className="send-btn-filled"
                style={{ background: '#dc2626' }}
                title="Stop generation"
              >
                <FaStop className="w-4 h-4" />
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSubmit}
                disabled={!value.trim()}
                className="send-btn-filled"
                title="Send message"
              >
                ➤
              </motion.button>
            )}
          </div>
        </div>

        {/* Slash Commands Dropdown */}
        <AnimatePresence>
          {showCommands && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute bottom-full left-0 mb-2 w-64 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden z-50"
            >
              <div className="p-2 border-b border-gray-200">
                <span className="text-xs text-gray-500 font-semibold">Commands</span>
              </div>
              <div className="max-h-48 overflow-y-auto">
                {filteredCommands.length > 0 ? (
                  filteredCommands.map((cmd) => (
                    <button
                      key={cmd.command}
                      onClick={() => handleCommandSelect(cmd.command)}
                      className="w-full text-left px-3 py-2 hover:bg-gray-100 transition-colors"
                    >
                      <div className="text-sm text-gray-900 font-mono">{cmd.command}</div>
                      <div className="text-xs text-gray-600">{cmd.description}</div>
                    </button>
                  ))
                ) : (
                  <div className="px-3 py-2 text-sm text-gray-500">No commands found</div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

