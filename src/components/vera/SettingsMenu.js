// src/components/vera/SettingsMenu.js
'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCog, FaDatabase, FaTrash, FaEllipsisV, FaTimes } from 'react-icons/fa';

/**
 * SettingsMenu Component
 * 
 * Consolidated settings menu that replaces multiple top-right buttons
 * Includes: Context Panel, Developer Settings, Knowledge Base, Clear Chat
 */
export default function SettingsMenu({
  onToggleContextPanel,
  isContextPanelOpen,
  onOpenDeveloperSettings,
  onOpenKnowledgeBase,
  onClearChat,
  className = ''
}) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleMenuItemClick = (action) => {
    action();
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`} ref={menuRef}>
      {/* Settings Trigger Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        title="Settings"
      >
        <FaEllipsisV className="w-5 h-5" />
      </motion.button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Menu */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden"
            >
              <div className="py-1">
                {/* Context Panel Toggle */}
                <button
                  onClick={() => handleMenuItemClick(onToggleContextPanel)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <FaDatabase className={`w-4 h-4 ${isContextPanelOpen ? 'text-teal-600' : 'text-gray-500'}`} />
                  <span>{isContextPanelOpen ? 'Hide' : 'Show'} Context Panel</span>
                </button>

                {/* Developer Settings */}
                <button
                  onClick={() => handleMenuItemClick(onOpenDeveloperSettings)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <FaCog className="w-4 h-4 text-gray-500" />
                  <span>Developer Settings</span>
                </button>

                {/* Knowledge Base */}
                <button
                  onClick={() => handleMenuItemClick(onOpenKnowledgeBase)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <FaDatabase className="w-4 h-4 text-gray-500" />
                  <span>Add to Knowledge Base</span>
                </button>

                {/* Divider */}
                <div className="my-1 border-t border-gray-200" />

                {/* Clear Chat */}
                <button
                  onClick={() => handleMenuItemClick(onClearChat)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <FaTrash className="w-4 h-4" />
                  <span>Clear Chat</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

