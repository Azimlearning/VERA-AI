// src/app/vera/page.js
'use client'; 

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUserCircle, FaRobot, FaDatabase, FaCog, FaBars, FaTimes, FaChevronLeft } from 'react-icons/fa';
import ChatHistorySidebar from '../../components/chat/ChatHistorySidebar';
import KnowledgeBaseInjector from '../../components/KnowledgeBaseInjector';
import AgentSelector from '../../components/vera/AgentSelector';
import SuggestedQuestions from '../../components/vera/SuggestedQuestions';
import ChatInput from '../../components/vera/ChatInput';
import MarkdownMessage from '../../components/vera/MarkdownMessage';
import MessageActions from '../../components/vera/MessageActions';
import DeveloperSettings from '../../components/vera/DeveloperSettings';
import TypingIndicator from '../../components/vera/TypingIndicator';
import ScrollToBottom from '../../components/vera/ScrollToBottom';
import MessageInfoPanel from '../../components/vera/MessageInfoPanel';
import RightSidebar from '../../components/vera/RightSidebar';
import SettingsMenu from '../../components/vera/SettingsMenu';
import { db } from '../../lib/firebase';
import { collection, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';

export default function VeraPage() {
  const chatFunctionUrl = "https://askchatbot-el2jwxb5bq-uc.a.run.app";
  
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [streamingMessageIndex, setStreamingMessageIndex] = useState(null);
  const initialHistory = [
    {
      role: 'ai',
      content: "Hi there! I'm Vera, your AI assistant. How can I help you today?",
      timestamp: new Date()
    }
  ];
  const [chatHistory, setChatHistory] = useState(initialHistory);
  const [suggestions, setSuggestions] = useState([]);
  const chatContainerRef = useRef(null);
  const abortControllerRef = useRef(null);

  // UI State
  const [hasChatStarted, setHasChatStarted] = useState(false);
  const [isInjectorOpen, setIsInjectorOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Open by default on desktop
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [developerSettings, setDeveloperSettings] = useState(null);
  const [selectedMessageInfo, setSelectedMessageInfo] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(true);

  // Auto-Scrolling Effect
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory, streamingText]);

  // Track scroll position to show/hide suggestions
  useEffect(() => {
    const handleScroll = () => {
      if (!chatContainerRef.current) return;
      const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 100; // 100px threshold
      setShowSuggestions(isAtBottom);
    };

    const container = chatContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      handleScroll(); // Check initial position
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [hasChatStarted]);

  // Create or get current chat session
  const getOrCreateSession = async () => {
    if (currentSessionId) {
      return currentSessionId;
    }

    try {
      const sessionData = {
        messages: [],
        createdAt: serverTimestamp(),
        lastActivity: serverTimestamp(),
        title: 'New Chat'
      };
      const docRef = await addDoc(collection(db, 'chatSessions'), sessionData);
      setCurrentSessionId(docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('[Chat] Error creating session:', error);
      return null;
    }
  };

  // Save message to Firestore
  const saveMessageToSession = async (message, sessionId, currentHistory) => {
    if (!sessionId) return;

    try {
      const sessionRef = doc(db, 'chatSessions', sessionId);
      await updateDoc(sessionRef, {
        messages: currentHistory || [...chatHistory, message],
        lastActivity: serverTimestamp()
      });
    } catch (error) {
      console.error('[Chat] Error saving message:', error);
    }
  };

  // Streaming response handler
  const handleStreamingResponse = async (response, sessionId, updatedHistory) => {
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let fullContent = '';

    setIsStreaming(true);
    setStreamingText('');
    setStreamingMessageIndex(updatedHistory.length);

    try {
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              break;
            }
            
            try {
              const json = JSON.parse(data);
              if (json.choices?.[0]?.delta?.content) {
                fullContent += json.choices[0].delta.content;
                setStreamingText(fullContent);
              }
            } catch (e) {
              if (data.trim()) {
                fullContent += data;
                setStreamingText(fullContent);
              }
            }
          } else if (line.trim()) {
            fullContent += line;
            setStreamingText(fullContent);
          }
        }
      }

      const newAiMessage = {
        role: 'ai',
        content: fullContent,
        timestamp: new Date(),
        citations: []
      };

      const finalHistory = [...updatedHistory, newAiMessage];
      setChatHistory(finalHistory);
      setStreamingText('');
      setStreamingMessageIndex(null);
      setIsStreaming(false);
      
      await saveMessageToSession(newAiMessage, sessionId, finalHistory);
    } catch (error) {
      console.error('[Chat] Streaming error:', error);
      setIsStreaming(false);
      setStreamingText('');
      setStreamingMessageIndex(null);
      throw error;
    }
  };

  // Main Chat Submission Handler
  const handleChatSubmit = async (messageText) => {
    if (!messageText.trim() || isChatLoading) return;

    setChatInput('');
    setSuggestions([]);
    setIsChatLoading(true);
    setHasChatStarted(true);

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    const sessionId = await getOrCreateSession();

    const newUserMessage = { 
      role: 'user', 
      content: messageText, 
      timestamp: new Date() 
    };
    const updatedHistory = [...chatHistory, newUserMessage];
    setChatHistory(updatedHistory);
    
    await saveMessageToSession(newUserMessage, sessionId, updatedHistory);

    try {
      const response = await fetch(chatFunctionUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: messageText,
          agent: selectedAgent?.id || null,
          agentContext: selectedAgent ? {
            name: selectedAgent.name,
            description: selectedAgent.description,
          } : null,
          ...(developerSettings && {
            temperature: developerSettings.temperature,
            model: developerSettings.model !== 'auto' ? developerSettings.model : undefined,
            maxTokens: developerSettings.maxTokens,
            dataInjection: developerSettings.dataInjection
          })
        }),
        signal: abortControllerRef.current.signal
      });

      if (!response.ok) {
        let errorDetail = "The assistant isn't available right now.";
        try { 
          const errorData = await response.json(); 
          errorDetail = errorData.error || errorDetail; 
        } catch {}
        throw new Error(errorDetail);
      }

      const contentType = response.headers.get('content-type');
      const isStreaming = contentType?.includes('text/event-stream') || 
                         contentType?.includes('text/plain') ||
                         response.headers.get('transfer-encoding') === 'chunked';

      if (isStreaming && response.body) {
        await handleStreamingResponse(response, sessionId, updatedHistory);
        setSuggestions([]);
      } else {
        const data = await response.json();
        const newAiMessage = { 
          role: 'ai', 
          content: data.reply, 
          timestamp: new Date(),
          citations: data.citations || []
        };
        const finalHistory = [...updatedHistory, newAiMessage];
        setChatHistory(finalHistory);
        setSuggestions(data.suggestions || []);
        
        await saveMessageToSession(newAiMessage, sessionId, finalHistory);
      }
      
      if (sessionId) {
        try {
          const sessionRef = doc(db, 'chatSessions', sessionId);
          const firstUserMsg = updatedHistory.find(m => m.role === 'user');
          if (firstUserMsg) {
            const title = firstUserMsg.content.substring(0, 50);
            await updateDoc(sessionRef, {
              title: title.length >= 50 ? title + '...' : title
            });
          }
        } catch (error) {
          console.error('[Chat] Error updating session title:', error);
        }
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        setIsStreaming(false);
        setStreamingText('');
        setStreamingMessageIndex(null);
        return;
      }
      
      const errorMessage = { 
        role: 'error', 
        content: `Sorry, an error occurred: ${error.message}`, 
        timestamp: new Date() 
      };
      const errorHistory = [...updatedHistory, errorMessage];
      setChatHistory(errorHistory);
      await saveMessageToSession(errorMessage, sessionId, errorHistory);
    } finally {
      setIsChatLoading(false);
      setIsStreaming(false);
    }
  };

  // Stop generation
  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsStreaming(false);
    setIsChatLoading(false);
    
    if (streamingText && streamingMessageIndex !== null) {
      const updatedHistory = [...chatHistory];
      if (updatedHistory[streamingMessageIndex]) {
        updatedHistory[streamingMessageIndex] = {
          ...updatedHistory[streamingMessageIndex],
          content: streamingText,
          partial: true
        };
        setChatHistory(updatedHistory);
      }
    }
    setStreamingText('');
    setStreamingMessageIndex(null);
  };

  // Regenerate last AI message
  const handleRegenerate = (messageIndex) => {
    const message = chatHistory[messageIndex];
    if (message && message.role === 'user') {
      const userMessage = message.content;
      const newHistory = chatHistory.slice(0, messageIndex + 1);
      setChatHistory(newHistory);
      handleChatSubmit(userMessage);
    }
  };

  // Question Click
  const handleQuestionClick = (question) => {
    handleChatSubmit(question);
  };

  // Clear Chat Handler
  const handleClearChat = () => {
    setChatHistory(initialHistory);
    setSuggestions([]);
    setHasChatStarted(false);
    setCurrentSessionId(null);
    setStreamingText('');
    setStreamingMessageIndex(null);
    setSelectedAgent(null);
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  // Load a chat session
  const handleLoadSession = (messages, sessionId) => {
    setChatHistory(messages);
    setCurrentSessionId(sessionId);
    setHasChatStarted(true);
    setIsSidebarOpen(false);
  };

  return (
    <div className="h-screen overflow-hidden flex flex-col bg-gray-50">
      {/* Header hidden on Vera page - logo moved to sidebar */}
      
      {/* Main Content - Full Height Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Collapsible */}
        {/* Desktop: Toggleable, Mobile: Overlay */}
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.aside
              initial={{ x: -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="hidden lg:flex w-64 bg-gray-800 border-r border-gray-700 z-50 flex-col flex-shrink-0"
            >
              <div className="flex-1 overflow-y-auto sidebar-content">
                <ChatHistorySidebar 
                  onNewChat={handleClearChat} 
                  onLoadSession={handleLoadSession}
                  currentSessionId={currentSessionId}
                />
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Mobile Sidebar - Overlay */}
        <AnimatePresence>
          {isSidebarOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsSidebarOpen(false)}
                className="lg:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
              />
              <motion.aside
                initial={{ x: -300 }}
                animate={{ x: 0 }}
                exit={{ x: -300 }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="lg:hidden fixed inset-y-0 left-0 w-64 bg-gray-800 border-r border-gray-700 z-50 flex flex-col shadow-xl"
              >
                <div className="p-4 border-b border-gray-700 flex items-center justify-between">
                  <h2 className="font-semibold text-gray-100">Chat History</h2>
                  <button
                    onClick={() => setIsSidebarOpen(false)}
                    className="p-2 text-gray-400 hover:text-gray-200"
                  >
                    <FaTimes />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto sidebar-content">
                  <ChatHistorySidebar 
                    onNewChat={handleClearChat} 
                    onLoadSession={handleLoadSession}
                    currentSessionId={currentSessionId}
                  />
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col overflow-hidden relative bg-white">
          {/* Top Bar - Clean and minimal */}
          <div className={`flex items-center justify-between ${hasChatStarted ? 'py-2 px-4' : 'py-3 px-4'} bg-white border-b border-gray-200 flex-shrink-0`}>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                title="Toggle sidebar"
              >
                <FaBars className="w-5 h-5" />
              </button>
              {selectedAgent && (
                <span className="px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-sm font-medium">
                  {selectedAgent.name}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {/* Consolidated Settings Menu */}
              <SettingsMenu
                onToggleContextPanel={() => setIsRightSidebarOpen(!isRightSidebarOpen)}
                isContextPanelOpen={isRightSidebarOpen}
                onOpenDeveloperSettings={() => setIsSettingsOpen(true)}
                onOpenKnowledgeBase={() => setIsInjectorOpen(true)}
                onClearChat={handleClearChat}
              />
            </div>
          </div>

          {/* Chat Content Area - Scrollable */}
          <div 
            ref={chatContainerRef}
            className={`flex-1 ${!hasChatStarted ? 'overflow-hidden' : 'overflow-y-auto chat-history-scrollbar'} bg-white`}
          >
            {!hasChatStarted ? (
              // Empty State - Grok/Gemini Centered Layout (Full Height)
              <div className="empty-state-hero">
                {/* Hero Content - Logo and Welcome Text */}
                <div className="hero-content text-center">
                  <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="hero-logo"
                  >
                    VERA
                  </motion.h1>
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="hero-text"
                  >
                    How can I help you today?
                  </motion.p>
                </div>
                
                {/* Input Wrapper - Limits width like Gemini */}
                <div className="input-wrapper">
                  <ChatInput
                    value={chatInput}
                    onChange={setChatInput}
                    onSubmit={() => handleChatSubmit(chatInput)}
                    onStop={handleStop}
                    isLoading={isChatLoading || isStreaming}
                    placeholder={selectedAgent ? `Ask ${selectedAgent.name}...` : "Ask anything... (use / for commands)"}
                    selectedAgent={selectedAgent}
                    onAgentSelect={setSelectedAgent}
                  />
                </div>
                
                {/* Suggested Questions - Below input (Horizontal Scrollable) */}
                <SuggestedQuestions onQuestionClick={handleQuestionClick} />
              </div>
            ) : (
              // Chat Messages - Centered with max-width
              <div className="w-full flex justify-center py-8 px-4 md:px-6 lg:px-8">
                <div className="w-full max-w-[800px] space-y-6">
                  <AnimatePresence mode="popLayout">
                    {chatHistory.map((msg, index) => {
                      const isCurrentlyStreaming = isStreaming && streamingMessageIndex === index;
                      const displayContent = isCurrentlyStreaming ? streamingText : msg.content;
                      
                      return (
                        <motion.div
                          key={`${msg.role}-${index}-${msg.timestamp?.getTime() || index}`}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                          transition={{ duration: 0.4, ease: "easeOut" }}
                          className={`flex items-start gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'} message-row-user`}
                        >
                          {msg.role === 'ai' && (
                            <motion.div
                              whileHover={{ scale: 1.1 }}
                              className="flex-shrink-0 mt-1"
                            >
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center shadow-md">
                                <FaRobot className="text-white text-sm" />
                              </div>
                            </motion.div>
                          )}
                          {msg.role === 'error' && (
                            <motion.div
                              whileHover={{ scale: 1.1 }}
                              className="flex-shrink-0 mt-1"
                            >
                              <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center">
                                <FaRobot className="text-white text-sm" />
                              </div>
                            </motion.div>
                          )}
                          
                          <div className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} max-w-[85%]`}>
                            <motion.div
                              whileHover={{ scale: 1.01, shadow: 'md' }}
                              className={`p-4 md:p-5 rounded-2xl transition-all ${
                                msg.role === 'user' 
                                  ? 'bg-teal-600 text-white rounded-br-md shadow-md hover:shadow-lg' 
                                  : msg.role === 'ai' 
                                    ? 'bg-white text-gray-900 rounded-bl-md border border-gray-200 shadow-sm hover:shadow-md' 
                                    : 'bg-red-50 text-red-700 rounded-bl-md border border-red-200 shadow-sm'
                              }`}
                            >
                              {msg.role === 'ai' || msg.role === 'error' ? (
                                <MarkdownMessage 
                                  content={displayContent}
                                  isStreaming={isCurrentlyStreaming}
                                  streamingText={streamingText}
                                />
                              ) : (
                                <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                              )}
                              
                              {msg.citations && msg.citations.length > 0 && (
                                <motion.div
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  transition={{ delay: 0.3 }}
                                  className="sources-section"
                                >
                                  <span className="sources-label">Sources</span>
                                  <div className="sources-container">
                                    {msg.citations.map((citation, idx) => (
                                      <motion.a
                                        key={idx}
                                        href={citation.sourceUrl || '#'}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.4 + idx * 0.05 }}
                                        whileHover={{ scale: 1.02 }}
                                        className="source-card"
                                      >
                                        <div className="source-icon">
                                          <FaDatabase className="text-sm" />
                                        </div>
                                        <div className="source-text-wrapper">
                                          <div className="source-title">
                                            {citation.title}
                                          </div>
                                          {citation.sourceUrl && (
                                            <div className="source-subtitle">
                                              {citation.sourceUrl.length > 40 
                                                ? citation.sourceUrl.substring(0, 40) + '...'
                                                : citation.sourceUrl}
                                            </div>
                                          )}
                                        </div>
                                      </motion.a>
                                    ))}
                                  </div>
                                </motion.div>
                              )}
                            </motion.div>
                            
                            {msg.role === 'ai' && !isCurrentlyStreaming && index !== 0 && (
                              <MessageActions
                                onRegenerate={() => handleRegenerate(index - 1)}
                                content={msg.content}
                                message={msg}
                                onShowInfo={setSelectedMessageInfo}
                                className="mt-2"
                              />
                            )}
                            
                            <span className="text-xs text-gray-500 mt-2 px-2">
                              {msg.timestamp.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                            </span>
                          </div>
                          
                          {msg.role === 'user' && (
                            <motion.div
                              whileHover={{ scale: 1.1 }}
                              className="flex-shrink-0 mt-1 user-avatar"
                              style={{ marginTop: '4px' }}
                            >
                              <div className="w-10 h-10 rounded-full bg-teal-600 flex items-center justify-center">
                                <FaUserCircle className="text-white text-lg" />
                              </div>
                            </motion.div>
                          )}
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                  
                  {/* Typing Indicator */}
                  {(isChatLoading || isStreaming) && !streamingMessageIndex && (
                    <TypingIndicator />
                  )}
                  
                  {/* Scroll to Bottom Button */}
                  <ScrollToBottom containerRef={chatContainerRef} />
                </div>
              </div>
            )}
          </div>

          {/* Bottom Section - Input and Suggestions (Only shown when chat is active) */}
          {hasChatStarted && (
            <div className="bg-white border-t border-gray-200 flex-shrink-0">
              {/* Active State: Input at bottom */}
              <>
                {/* Suggestions - Inline Pills, Single Row */}
                <AnimatePresence>
                  {suggestions.length > 0 && !isChatLoading && showSuggestions && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                      className="px-4 pt-3 pb-2"
                    >
                      <div className="max-w-[800px] mx-auto">
                        <div className="flex gap-2 overflow-x-auto pb-2" style={{ scrollbarWidth: 'thin' }}>
                          {suggestions.map((s, i) => (
                            <motion.button
                              key={i}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: i * 0.05, duration: 0.2 }}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleQuestionClick(s)}
                              className="flex-shrink-0 text-xs bg-gray-100 hover:bg-teal-50 text-gray-700 hover:text-teal-700 px-3 py-1.5 rounded-full transition-all border border-gray-200 hover:border-teal-300 whitespace-nowrap"
                            >
                              {s}
                            </motion.button>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Input Area - Fixed at bottom */}
                <div className="max-w-[800px] mx-auto w-full px-4 md:px-6 pb-4 md:pb-6">
                  <ChatInput
                    value={chatInput}
                    onChange={setChatInput}
                    onSubmit={() => handleChatSubmit(chatInput)}
                    onStop={handleStop}
                    isLoading={isChatLoading || isStreaming}
                    placeholder={selectedAgent ? `Ask ${selectedAgent.name}...` : "Ask anything... (use / for commands)"}
                    selectedAgent={selectedAgent}
                    onAgentSelect={setSelectedAgent}
                  />
                </div>
              </>
            </div>
          )}
        </main>
      </div>
      
      {/* Modals */}
      <KnowledgeBaseInjector 
        isOpen={isInjectorOpen} 
        onClose={() => setIsInjectorOpen(false)} 
      />
      
      <DeveloperSettings
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSettingsChange={setDeveloperSettings}
      />
      
      {/* Message Info Panel */}
      {selectedMessageInfo && (
        <MessageInfoPanel
          message={selectedMessageInfo}
          onClose={() => setSelectedMessageInfo(null)}
        />
      )}
      
      {/* Right Sidebar */}
      <RightSidebar
        isOpen={isRightSidebarOpen}
        onClose={() => setIsRightSidebarOpen(false)}
        contextData={{
          references: chatHistory
            .filter(msg => msg.citations && msg.citations.length > 0)
            .flatMap(msg => msg.citations)
            .slice(0, 5),
          relatedTopics: ['Systemic Shifts', 'PETRONAS 2.0', 'Net Zero 2050']
        }}
      />
    </div>
  );
}
