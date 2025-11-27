// src/components/chat/ChatHistorySidebar.js
'use client';
import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { FaPlus, FaHome, FaTrash, FaSearch, FaChevronDown, FaChevronUp, FaInfoCircle, FaRobot, FaDatabase, FaEllipsisH } from 'react-icons/fa';
import { db } from '../../lib/firebase';
import { collection, getDocs, query, orderBy, limit, deleteDoc, doc } from 'firebase/firestore';

// --- NOW accepts an 'onNewChat' prop and 'onLoadSession' callback ---
export default function ChatHistorySidebar({ onNewChat, onLoadSession, currentSessionId }) {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedGroups, setExpandedGroups] = useState({ 'today': true, 'yesterday': true, 'week': true });
  const [expandedNav, setExpandedNav] = useState({ 'knowledgeBase': false, 'more': false });

  // Helper function to format relative time
  const formatRelativeTime = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  // Group sessions by date
  const groupSessionsByDate = (sessionsList) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const groups = {
      today: [],
      yesterday: [],
      week: [],
      older: []
    };

    sessionsList.forEach(session => {
      if (!session.lastActivity) {
        groups.older.push(session);
        return;
      }

      const sessionDate = session.lastActivity?.toDate ? session.lastActivity.toDate() : new Date(session.lastActivity);
      
      if (sessionDate >= today) {
        groups.today.push(session);
      } else if (sessionDate >= yesterday) {
        groups.yesterday.push(session);
      } else if (sessionDate >= weekAgo) {
        groups.week.push(session);
      } else {
        groups.older.push(session);
      }
    });

    return groups;
  };

  // Filter sessions by search query
  const filteredSessions = useMemo(() => {
    if (!searchQuery.trim()) return sessions;
    
    const query = searchQuery.toLowerCase();
    return sessions.filter(session => 
      (session.title || '').toLowerCase().includes(query) ||
      (session.messages || []).some(msg => 
        (msg.content || '').toLowerCase().includes(query)
      )
    );
  }, [sessions, searchQuery]);

  // Group filtered sessions
  const groupedSessions = useMemo(() => {
    return groupSessionsByDate(filteredSessions);
  }, [filteredSessions]);

  const toggleGroup = (groupName) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupName]: !prev[groupName]
    }));
  };

  // Load chat sessions from Firestore
  useEffect(() => {
    const loadSessions = async () => {
      try {
        const q = query(
          collection(db, 'chatSessions'),
          orderBy('lastActivity', 'desc'),
          limit(20)
        );
        const snapshot = await getDocs(q);
        const sessionsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setSessions(sessionsData);
      } catch (error) {
        console.error('[ChatHistorySidebar] Error loading sessions:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSessions();
  }, []);

  // Handle loading a session
  const handleLoadSession = async (session) => {
    if (onLoadSession && session.messages) {
      // Convert Firestore timestamps to Date objects
      const messages = session.messages.map(msg => ({
        ...msg,
        timestamp: msg.timestamp?.toDate ? msg.timestamp.toDate() : new Date(msg.timestamp)
      }));
      onLoadSession(messages, session.id);
    }
  };

  // Handle deleting a session
  const handleDeleteSession = async (sessionId, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this chat?')) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'chatSessions', sessionId));
      setSessions(prev => prev.filter(s => s.id !== sessionId));
    } catch (error) {
      console.error('[ChatHistorySidebar] Error deleting session:', error);
      alert('Failed to delete chat');
    }
  };

  return (
    <nav className="w-full flex-shrink-0 flex flex-col h-full bg-gray-800">
      {/* Sticky Header with VERA Logo and New Chat Button */}
      <div className="sticky top-0 z-10 bg-gray-800 border-b border-gray-700 p-4">
        {/* VERA Logo */}
        <div className="mb-4 text-center">
          <h1 className="text-2xl font-extrabold bg-gradient-to-r from-teal-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent">
            VERA
          </h1>
        </div>
        
        <motion.button
          onClick={onNewChat}
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          className="new-chat-btn w-full flex items-center justify-center gap-2 px-4 py-3 text-white bg-transparent border border-white/20 hover:bg-white/10 hover:border-white rounded-xl font-semibold transition-all mb-3"
        >
          <FaPlus className="w-4 h-4" />
          <span>New Chat</span>
        </motion.button>
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Link href="/" className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors" title="Back to Main Site">
            <FaHome className="w-4 h-4" />
            <span>Back to Site</span>
          </Link>
        </motion.div>
      </div>
      
      {/* Navigation Section */}
      <div className="px-4 py-2 border-b border-gray-700">
        <div className="space-y-1">
          {/* About */}
          <Link href="/" className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors">
            <FaInfoCircle className="w-4 h-4" />
            <span>About</span>
          </Link>
          
          {/* AI Agents */}
          <Link href="/agents" className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors">
            <FaRobot className="w-4 h-4" />
            <span>AI Agents</span>
          </Link>
          
          {/* Knowledge Base - Expandable */}
          <div>
            <button
              onClick={() => setExpandedNav(prev => ({ ...prev, knowledgeBase: !prev.knowledgeBase }))}
              className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
            >
              <div className="flex items-center gap-2">
                <FaDatabase className="w-4 h-4" />
                <span>Knowledge Base</span>
              </div>
              {expandedNav.knowledgeBase ? <FaChevronUp className="w-3 h-3" /> : <FaChevronDown className="w-3 h-3" />}
            </button>
            <AnimatePresence>
              {expandedNav.knowledgeBase && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="ml-6 mt-1 space-y-1"
                >
                  <Link href="/knowledge-base" className="block px-3 py-1.5 text-xs text-gray-400 hover:text-gray-200 hover:bg-gray-700 rounded transition-colors">
                    Overview
                  </Link>
                  <Link href="/petronas-2.0" className="block px-3 py-1.5 text-xs text-gray-400 hover:text-gray-200 hover:bg-gray-700 rounded transition-colors">
                    PETRONAS 2.0
                  </Link>
                  <Link href="/systemic-shifts/upstream-target" className="block px-3 py-1.5 text-xs text-gray-400 hover:text-gray-200 hover:bg-gray-700 rounded transition-colors">
                    Systemic Shifts
                  </Link>
                  <Link href="/articles" className="block px-3 py-1.5 text-xs text-gray-400 hover:text-gray-200 hover:bg-gray-700 rounded transition-colors">
                    Articles
                  </Link>
                  <Link href="/knowledge-base/upstreambuzz" className="block px-3 py-1.5 text-xs text-gray-400 hover:text-gray-200 hover:bg-gray-700 rounded transition-colors">
                    UpstreamBuzz
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          {/* More - Expandable */}
          <div>
            <button
              onClick={() => setExpandedNav(prev => ({ ...prev, more: !prev.more }))}
              className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
            >
              <div className="flex items-center gap-2">
                <FaEllipsisH className="w-4 h-4" />
                <span>More</span>
              </div>
              {expandedNav.more ? <FaChevronUp className="w-3 h-3" /> : <FaChevronDown className="w-3 h-3" />}
            </button>
            <AnimatePresence>
              {expandedNav.more && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="ml-6 mt-1 space-y-1"
                >
                  <Link href="/nexushub" className="block px-3 py-1.5 text-xs text-gray-400 hover:text-gray-200 hover:bg-gray-700 rounded transition-colors">
                    NexusHub
                  </Link>
                  <Link href="/ulearn" className="block px-3 py-1.5 text-xs text-gray-400 hover:text-gray-200 hover:bg-gray-700 rounded transition-colors">
                    ULearn
                  </Link>
                  <Link href="/submit-story" className="block px-3 py-1.5 text-xs text-gray-400 hover:text-gray-200 hover:bg-gray-700 rounded transition-colors">
                    Submit Stories
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
      
      {/* Scrollable Chat History */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 sidebar-content">

        {/* Search Bar */}
        <div className="mb-4">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className="w-full pl-10 pr-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
          </div>
        </div>
        
        <div className="flex flex-col gap-2 pr-2 chat-history-scrollbar">
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className="p-3 bg-gray-700 rounded-lg"
                  >
                    <div className="h-4 bg-gray-600 rounded animate-pulse mb-2"></div>
                    <div className="h-3 bg-gray-600 rounded animate-pulse w-2/3"></div>
                  </motion.div>
              ))}
            </div>
            ) : filteredSessions.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-gray-400 text-sm p-4 text-center bg-gray-700 rounded-lg"
              >
                {searchQuery ? 'No conversations found' : 'No previous chats'}
              </motion.div>
          ) : (
            <>
              {/* Today */}
              {groupedSessions.today.length > 0 && (
                <div className="mb-2">
                  <button
                    onClick={() => toggleGroup('today')}
                    className="w-full flex items-center justify-between px-2 py-2 text-gray-400 text-xs font-semibold uppercase tracking-wider hover:text-gray-300 transition-colors"
                  >
                    <span>Today</span>
                    {expandedGroups.today ? <FaChevronUp className="w-3 h-3" /> : <FaChevronDown className="w-3 h-3" />}
                  </button>
                  <AnimatePresence>
                    {expandedGroups.today && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-2 mt-2"
                      >
                        {groupedSessions.today.map((session) => (
                          <SessionItem
                            key={session.id}
                            session={session}
                            currentSessionId={currentSessionId}
                            onLoad={handleLoadSession}
                            onDelete={handleDeleteSession}
                            formatTime={formatRelativeTime}
                          />
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Yesterday */}
              {groupedSessions.yesterday.length > 0 && (
                <div className="mb-2">
                  <button
                    onClick={() => toggleGroup('yesterday')}
                    className="w-full flex items-center justify-between px-2 py-2 text-gray-400 text-xs font-semibold uppercase tracking-wider hover:text-gray-300 transition-colors"
                  >
                    <span>Yesterday</span>
                    {expandedGroups.yesterday ? <FaChevronUp className="w-3 h-3" /> : <FaChevronDown className="w-3 h-3" />}
                  </button>
                  <AnimatePresence>
                    {expandedGroups.yesterday && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-2 mt-2"
                      >
                        {groupedSessions.yesterday.map((session) => (
                          <SessionItem
                            key={session.id}
                            session={session}
                            currentSessionId={currentSessionId}
                            onLoad={handleLoadSession}
                            onDelete={handleDeleteSession}
                            formatTime={formatRelativeTime}
                          />
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Previous 7 Days */}
              {groupedSessions.week.length > 0 && (
                <div className="mb-2">
                  <button
                    onClick={() => toggleGroup('week')}
                    className="w-full flex items-center justify-between px-2 py-2 text-gray-400 text-xs font-semibold uppercase tracking-wider hover:text-gray-300 transition-colors"
                  >
                    <span>Previous 7 Days</span>
                    {expandedGroups.week ? <FaChevronUp className="w-3 h-3" /> : <FaChevronDown className="w-3 h-3" />}
                  </button>
                  <AnimatePresence>
                    {expandedGroups.week && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-2 mt-2"
                      >
                        {groupedSessions.week.map((session) => (
                          <SessionItem
                            key={session.id}
                            session={session}
                            currentSessionId={currentSessionId}
                            onLoad={handleLoadSession}
                            onDelete={handleDeleteSession}
                            formatTime={formatRelativeTime}
                          />
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Older */}
              {groupedSessions.older.length > 0 && (
                <div className="mb-2">
                  <button
                    onClick={() => toggleGroup('older')}
                    className="w-full flex items-center justify-between px-2 py-2 text-gray-400 text-xs font-semibold uppercase tracking-wider hover:text-gray-300 transition-colors"
                  >
                    <span>Older</span>
                    {expandedGroups.older ? <FaChevronUp className="w-3 h-3" /> : <FaChevronDown className="w-3 h-3" />}
                  </button>
                  <AnimatePresence>
                    {expandedGroups.older && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-2 mt-2"
                      >
                        {groupedSessions.older.map((session) => (
                          <SessionItem
                            key={session.id}
                            session={session}
                            currentSessionId={currentSessionId}
                            onLoad={handleLoadSession}
                            onDelete={handleDeleteSession}
                            formatTime={formatRelativeTime}
                          />
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

// Session Item Component (extracted for reusability)
function SessionItem({ session, currentSessionId, onLoad, onDelete, formatTime }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      onClick={() => onLoad(session)}
      className={`history-item ${
        currentSessionId === session.id
          ? 'bg-teal-900/50 border border-teal-600'
          : 'border border-transparent'
      }`}
    >
      <div className="flex-1 min-w-0">
        <div className="history-title" title={session.title || 'Untitled Chat'}>
          {session.title || 'Untitled Chat'}
        </div>
        {session.lastActivity && (
          <div className="text-xs text-gray-400 mt-1">
            {formatTime(session.lastActivity)}
          </div>
        )}
      </div>
      <button
        onClick={(e) => onDelete(session.id, e)}
        className="delete-btn"
        title="Delete chat"
      >
        <FaTrash size={14} />
      </button>
    </motion.div>
  );
}
