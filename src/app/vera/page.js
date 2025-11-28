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
import ArtifactPanel from '../../components/vera/ArtifactPanel';
import { db } from '../../lib/firebase';
import { collection, addDoc, updateDoc, doc, serverTimestamp, onSnapshot } from 'firebase/firestore';

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
  
  // Artifact Panel State
  const [isArtifactOpen, setIsArtifactOpen] = useState(false);
  const [artifactData, setArtifactData] = useState(null);
  const [isArtifactStreaming, setIsArtifactStreaming] = useState(false);
  const [artifactType, setArtifactType] = useState(null);

  // File Upload State
  const [isFileUploading, setIsFileUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState(null);

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
  // Helper function to sanitize message content for Firestore (prevent size limit issues)
  const sanitizeMessageForStorage = (message) => {
    if (!message || typeof message !== 'object') return message;
    
    const sanitized = { ...message };
    
    // Remove undefined values (Firestore doesn't allow undefined)
    Object.keys(sanitized).forEach(key => {
      if (sanitized[key] === undefined) {
        delete sanitized[key];
      }
    });
    
    // If content is a base64 image data URL, replace with placeholder
    if (sanitized.content && typeof sanitized.content === 'string') {
      // Check if it's a base64 image (data:image/... or very long base64 string)
      if (sanitized.content.startsWith('data:image/') || 
          (sanitized.content.length > 10000 && sanitized.content.includes('base64'))) {
        // Extract image type if available
        const imageTypeMatch = sanitized.content.match(/data:image\/([^;]+)/);
        const imageType = imageTypeMatch ? imageTypeMatch[1] : 'image';
        sanitized.content = `[Image uploaded: ${imageType} format, ${(sanitized.content.length / 1024).toFixed(1)}KB]`;
        sanitized.hasImage = true; // Flag to indicate image was present
      }
      // If content is very long (>500KB), truncate it
      else if (sanitized.content.length > 500000) {
        sanitized.content = sanitized.content.substring(0, 500000) + '\n\n[Content truncated due to size]';
      }
    }
    
    // Remove originalContent and _originalContent if present (we don't want to store base64 in Firestore)
    if (sanitized.originalContent) {
      delete sanitized.originalContent;
    }
    if (sanitized._originalContent) {
      delete sanitized._originalContent;
    }
    
    return sanitized;
  };

  const saveMessageToSession = async (message, sessionId, currentHistory) => {
    if (!sessionId) return;

    try {
      // Sanitize messages to prevent Firestore size limit issues
      const sanitizedMessage = sanitizeMessageForStorage(message);
      const sanitizedHistory = (currentHistory || [...chatHistory, message])
        .map(msg => sanitizeMessageForStorage(msg))
        .filter(msg => msg !== null && msg !== undefined); // Remove any null/undefined messages
      
      // Ensure all messages have required fields
      const validHistory = sanitizedHistory.map(msg => ({
        role: msg.role || 'user',
        content: msg.content || '',
        timestamp: msg.timestamp || new Date(),
        ...(msg.citations && { citations: msg.citations }),
        ...(msg.hasImage && { hasImage: msg.hasImage })
      }));
      
      const sessionRef = doc(db, 'chatSessions', sessionId);
      await updateDoc(sessionRef, {
        messages: validHistory,
        lastActivity: serverTimestamp()
      });
    } catch (error) {
      console.error('[Chat] Error saving message:', error);
      // If error is due to size, try to save with more aggressive truncation
      if (error.message && error.message.includes('exceeds the maximum allowed size')) {
        try {
          const sessionRef = doc(db, 'chatSessions', sessionId);
          // Only save last 20 messages to reduce size
          const recentHistory = (currentHistory || chatHistory)
            .slice(-20)
            .map(msg => sanitizeMessageForStorage(msg))
            .filter(msg => msg !== null && msg !== undefined)
            .map(msg => {
              const sanitized = sanitizeMessageForStorage(msg);
              // Further truncate content if still too long
              if (sanitized.content && sanitized.content.length > 50000) {
                sanitized.content = sanitized.content.substring(0, 50000) + '\n\n[Content truncated]';
              }
              return {
                role: sanitized.role || 'user',
                content: sanitized.content || '',
                timestamp: sanitized.timestamp || new Date(),
                ...(sanitized.citations && { citations: sanitized.citations }),
                ...(sanitized.hasImage && { hasImage: sanitized.hasImage })
              };
            });
          await updateDoc(sessionRef, {
            messages: recentHistory,
            lastActivity: serverTimestamp()
          });
        } catch (retryError) {
          console.error('[Chat] Error saving with truncated history:', retryError);
        }
      } else if (error.message && error.message.includes('Unsupported field value: undefined')) {
        // Retry with more aggressive undefined removal
        try {
          const sessionRef = doc(db, 'chatSessions', sessionId);
          const cleanedHistory = (currentHistory || [...chatHistory, message])
            .map(msg => {
              const cleaned = { ...msg };
              Object.keys(cleaned).forEach(key => {
                if (cleaned[key] === undefined) delete cleaned[key];
              });
              return cleaned;
            })
            .filter(msg => msg !== null && msg !== undefined);
          
          await updateDoc(sessionRef, {
            messages: cleanedHistory,
            lastActivity: serverTimestamp()
          });
        } catch (retryError) {
          console.error('[Chat] Error saving with cleaned history:', retryError);
        }
      }
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
    
    // Start artifact streaming if agent is selected
    if (selectedAgent) {
      setIsArtifactStreaming(true);
    }

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
                
                // Process streaming content for artifact
                if (selectedAgent && fullContent.length > 100) {
                  const processed = processAgentResponse(fullContent, selectedAgent.id);
                  if (processed.artifactContent) {
                    const parsedData = parseArtifactData(processed.artifactContent, selectedAgent.id, processed.artifactType);
                    setArtifactData(parsedData);
                    setArtifactType(processed.artifactType);
                    if (!isArtifactOpen) {
                      setIsArtifactOpen(true);
                    }
                  }
                }
              }
            } catch (e) {
              if (data.trim()) {
                fullContent += data;
                setStreamingText(fullContent);
                
                // Process streaming content for artifact
                if (selectedAgent && fullContent.length > 100) {
                  const processed = processAgentResponse(fullContent, selectedAgent.id);
                  if (processed.artifactContent) {
                    const parsedData = parseArtifactData(processed.artifactContent, selectedAgent.id, processed.artifactType);
                    setArtifactData(parsedData);
                    setArtifactType(processed.artifactType);
                    if (!isArtifactOpen) {
                      setIsArtifactOpen(true);
                    }
                  }
                }
              }
            }
          } else if (line.trim()) {
            fullContent += line;
            setStreamingText(fullContent);
            
            // Process streaming content for artifact
            if (selectedAgent && fullContent.length > 100) {
              const processed = processAgentResponse(fullContent, selectedAgent.id);
              if (processed.artifactContent) {
                const parsedData = parseArtifactData(processed.artifactContent, selectedAgent.id, processed.artifactType);
                setArtifactData(parsedData);
                setArtifactType(processed.artifactType);
                if (!isArtifactOpen) {
                  setIsArtifactOpen(true);
                }
              }
            }
          }
        }
      }

      // Process final content for artifact
      let finalContent = fullContent;
      let finalChatText = fullContent;
      
      if (selectedAgent) {
        const processed = processAgentResponse(fullContent, selectedAgent.id);
        if (processed.artifactContent) {
          finalChatText = processed.chatText;
          const parsedData = parseArtifactData(processed.artifactContent, selectedAgent.id, processed.artifactType);
          setArtifactData(parsedData);
          setArtifactType(processed.artifactType);
          if (!isArtifactOpen) {
            setIsArtifactOpen(true);
          }
        }
      }

      const newAiMessage = {
        role: 'ai',
        content: finalChatText,
        timestamp: new Date(),
        citations: []
      };

      const finalHistory = [...updatedHistory, newAiMessage];
      setChatHistory(finalHistory);
      setStreamingText('');
      setStreamingMessageIndex(null);
      setIsStreaming(false);
      setIsArtifactStreaming(false);
      
      await saveMessageToSession(newAiMessage, sessionId, finalHistory);
    } catch (error) {
      console.error('[Chat] Streaming error:', error);
      setIsStreaming(false);
      setIsArtifactStreaming(false);
      setStreamingText('');
      setStreamingMessageIndex(null);
      throw error;
    }
  };

  // Parse number of questions from message text
  const parseNumQuestions = (message) => {
    if (!message || typeof message !== 'string') return 5;
    
    // Look for patterns like "10 questions", "10 q", "questions: 10", etc.
    const patterns = [
      /(\d+)\s*(?:questions?|q\b)/i,  // "10 questions", "10 q"
      /questions?.*?(\d+)/i,           // "questions 10", "question: 10"
      /(\d+).*?questions?/i,           // "10 about questions"
      /(\d+)\s*q/i                     // "10q"
    ];
    
    for (const pattern of patterns) {
      const match = message.match(pattern);
      if (match) {
        const num = parseInt(match[1], 10);
        if (!isNaN(num)) {
          // Validate range (3-20) to match backend constraints
          return Math.min(Math.max(num, 3), 20);
        }
      }
    }
    
    return 5; // Default
  };

  // Detect if message contains data (CSV, JSON, or structured text) vs. topic query
  const detectDataInMessage = (message) => {
    if (!message || typeof message !== 'string') return { hasData: false, dataType: null };
    
    const trimmed = message.trim();
    
    // Check for JSON structure
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
      try {
        JSON.parse(trimmed);
        return { hasData: true, dataType: 'json', data: trimmed };
      } catch (e) {
        // Not valid JSON, continue checking
      }
    }
    
    // Check for CSV structure (commas, multiple lines, potential headers)
    const lines = trimmed.split('\n').filter(l => l.trim());
    if (lines.length >= 2) {
      const firstLine = lines[0];
      const commaCount = (firstLine.match(/,/g) || []).length;
      // If first line has commas and multiple lines exist, likely CSV
      if (commaCount >= 2 && lines.length >= 2) {
        return { hasData: true, dataType: 'csv', data: trimmed };
      }
    }
    
    // Check for long structured text (>500 chars) that might be data
    if (trimmed.length > 500) {
      // Check if it has some structure (numbers, patterns, etc.)
      const hasNumbers = /\d/.test(trimmed);
      const hasMultipleLines = lines.length >= 3;
      if (hasNumbers && hasMultipleLines) {
        return { hasData: true, dataType: 'text', data: trimmed };
      }
    }
    
    // Short message without data structure - treat as topic query
    if (trimmed.length < 150 && lines.length <= 2) {
      return { hasData: false, dataType: null, data: null };
    }
    
    // Default: if message is long enough, treat as data
    if (trimmed.length > 200) {
      return { hasData: true, dataType: 'text', data: trimmed };
    }
    
    return { hasData: false, dataType: null, data: null };
  };

  // Generate charts from data (CSV or JSON)
  const generateChartsFromData = (dataToAnalyze, dataType) => {
    const charts = [];
    
    if (!dataToAnalyze) {
      console.log('[generateChartsFromData] No data provided');
      return charts;
    }
    
    console.log('[generateChartsFromData] Starting chart generation', { dataType, dataLength: typeof dataToAnalyze === 'string' ? dataToAnalyze.length : 'object' });
    
    // Handle CSV data
    if (dataType === 'csv' || (typeof dataToAnalyze === 'string' && dataToAnalyze.includes(','))) {
      try {
        const lines = dataToAnalyze.split('\n').filter(l => l.trim());
        console.log('[generateChartsFromData] CSV lines found:', lines.length);
        
        if (lines.length > 1) {
          const headers = lines[0].split(',').map(h => h.trim());
          console.log('[generateChartsFromData] CSV headers:', headers);
          
          // Find date column (prioritize exact matches)
          let dateIndex = headers.findIndex(h => h.toLowerCase() === 'date' || h.toLowerCase() === 'time');
          if (dateIndex < 0) {
            dateIndex = headers.findIndex(h => h.toLowerCase().includes('date') || h.toLowerCase().includes('time'));
          }
          
          // Find value column - prioritize numeric column names, avoid text columns like "metric"
          let valueIndex = -1;
          
          // First, try to find columns with numeric-sounding names (but not "metric" which is often text)
          const numericColumnNames = ['value', 'count', 'total', 'sum', 'amount', 'quantity', 'number', 'score', 'rating'];
          for (const colName of numericColumnNames) {
            const idx = headers.findIndex(h => h.toLowerCase() === colName);
            if (idx >= 0) {
              valueIndex = idx;
              break;
            }
          }
          
          // If not found, scan first data row to find numeric columns
          if (valueIndex < 0 && lines.length > 1) {
            const firstDataRow = lines[1].split(',').map(v => v.trim());
            for (let i = 0; i < firstDataRow.length; i++) {
              if (i !== dateIndex) {
                const val = firstDataRow[i];
                const numVal = parseFloat(val);
                if (!isNaN(numVal) && val !== '') {
                  valueIndex = i;
                  console.log('[generateChartsFromData] Found numeric column by scanning data:', headers[i], 'at index', i);
                  break;
                }
              }
            }
          }
          
          console.log('[generateChartsFromData] Column indices:', { dateIndex, valueIndex, dateColumn: dateIndex >= 0 ? headers[dateIndex] : null, valueColumn: valueIndex >= 0 ? headers[valueIndex] : null });
          
          if (dateIndex >= 0 && valueIndex >= 0) {
            const chartData = lines.slice(1, Math.min(31, lines.length)).map((line, lineIdx) => {
              const values = line.split(',');
              const dateVal = values[dateIndex]?.trim() || '';
              const valueStr = values[valueIndex]?.trim() || '';
              const numValue = parseFloat(valueStr);
              
              // Debug first few rows
              if (lineIdx < 3) {
                console.log('[generateChartsFromData] Row', lineIdx + 1, ':', { dateVal, valueStr, numValue, isNaN: isNaN(numValue) });
              }
              
              return {
                date: dateVal,
                value: isNaN(numValue) ? 0 : numValue
              };
            }).filter(d => {
              const isValid = d.date && !isNaN(d.value) && d.value !== 0;
              if (!isValid && d.date) {
                console.warn('[generateChartsFromData] Filtered out invalid row:', d);
              }
              return isValid;
            });
            
            console.log('[generateChartsFromData] Chart data generated:', chartData.length, 'valid rows');
            if (chartData.length > 0) {
              console.log('[generateChartsFromData] Sample chart data (first 3):', chartData.slice(0, 3));
              
              charts.push({
                type: 'line',
                data: chartData,
                series: [{ 
                  dataKey: 'value', 
                  name: headers[valueIndex] || 'Value', 
                  color: '#3b82f6' 
                }]
              });
              
              console.log('[generateChartsFromData] Chart added successfully');
            } else {
              console.warn('[generateChartsFromData] No valid chart data after filtering');
            }
          } else {
            console.warn('[generateChartsFromData] Missing required columns:', { dateIndex, valueIndex });
          }
        }
      } catch (e) {
        console.error('[generateChartsFromData] CSV parsing error:', e);
      }
    }
    
    // Handle JSON data
    if (dataType === 'json' || (typeof dataToAnalyze === 'string' && (dataToAnalyze.startsWith('{') || dataToAnalyze.startsWith('[')))) {
      try {
        const jsonData = typeof dataToAnalyze === 'string' ? JSON.parse(dataToAnalyze) : dataToAnalyze;
        console.log('[generateChartsFromData] JSON data parsed:', { isArray: Array.isArray(jsonData), hasMetrics: !!jsonData.metrics });
        
        // Check if it's an array of objects with date/value fields
        if (Array.isArray(jsonData) && jsonData.length > 0) {
          const firstItem = jsonData[0];
          console.log('[generateChartsFromData] First JSON item keys:', Object.keys(firstItem));
          
          // Find date key (prioritize exact matches)
          let dateKey = Object.keys(firstItem).find(k => 
            k.toLowerCase() === 'date' || k.toLowerCase() === 'time'
          );
          if (!dateKey) {
            dateKey = Object.keys(firstItem).find(k => 
              k.toLowerCase().includes('date') || 
              k.toLowerCase().includes('time')
            );
          }
          
          // Find value key - prioritize numeric columns, avoid text columns
          let valueKey = null;
          
          // First try exact matches for numeric column names
          const numericKeys = Object.keys(firstItem).filter(k => {
            const val = firstItem[k];
            return typeof val === 'number' && k.toLowerCase() !== 'date' && k.toLowerCase() !== 'time';
          });
          
          // Prefer columns with numeric-sounding names
          const preferredNames = ['value', 'count', 'total', 'sum', 'amount', 'quantity', 'number', 'score', 'rating', 'engagement'];
          for (const name of preferredNames) {
            const key = Object.keys(firstItem).find(k => k.toLowerCase() === name && typeof firstItem[k] === 'number');
            if (key) {
              valueKey = key;
              break;
            }
          }
          
          // If not found, use first numeric column
          if (!valueKey && numericKeys.length > 0) {
            valueKey = numericKeys[0];
          }
          
          console.log('[generateChartsFromData] JSON keys found:', { dateKey, valueKey, numericKeys });
          
          if (dateKey && valueKey) {
            const chartData = jsonData.slice(0, Math.min(31, jsonData.length)).map((item, idx) => {
              const dateVal = item[dateKey] || '';
              const numValue = typeof item[valueKey] === 'number' ? item[valueKey] : parseFloat(item[valueKey]) || 0;
              
              if (idx < 3) {
                console.log('[generateChartsFromData] JSON row', idx + 1, ':', { dateVal, valueKey, numValue });
              }
              
              return {
                date: dateVal,
                value: numValue
              };
            }).filter(d => d.date && !isNaN(d.value) && d.value !== 0);
            
            console.log('[generateChartsFromData] JSON chart data generated:', chartData.length, 'valid rows');
            
            if (chartData.length > 0) {
              charts.push({
                type: 'line',
                data: chartData,
                series: [{ 
                  dataKey: 'value', 
                  name: valueKey.charAt(0).toUpperCase() + valueKey.slice(1), 
                  color: '#3b82f6' 
                }]
              });
            }
          }
        }
        
        // Check if it's an object with a metrics array
        if (jsonData.metrics && Array.isArray(jsonData.metrics)) {
          const metrics = jsonData.metrics;
          console.log('[generateChartsFromData] Found metrics array with', metrics.length, 'items');
          
          if (metrics.length > 0) {
            const firstMetric = metrics[0];
            const dateKey = Object.keys(firstMetric).find(k => 
              k.toLowerCase().includes('date') || 
              k.toLowerCase().includes('time')
            );
            
            // Get all numeric keys (excluding date)
            const numericKeys = Object.keys(firstMetric).filter(k => 
              k !== dateKey && 
              typeof firstMetric[k] === 'number'
            );
            
            console.log('[generateChartsFromData] Metrics keys:', { dateKey, numericKeys });
            
            if (dateKey && numericKeys.length > 0) {
              console.log('[generateChartsFromData] Processing metrics with dateKey:', dateKey, 'numericKeys:', numericKeys);
              
              const chartData = metrics.slice(0, Math.min(31, metrics.length)).map((item, idx) => {
                const dataPoint = { date: item[dateKey] || '' };
                numericKeys.forEach(key => {
                  // Preserve the actual value, even if it's 0 or small
                  const value = item[key];
                  if (typeof value === 'number') {
                    dataPoint[key] = value;
                  } else if (value !== null && value !== undefined) {
                    // Try to parse if it's a string
                    const parsed = parseFloat(value);
                    dataPoint[key] = isNaN(parsed) ? 0 : parsed;
                  } else {
                    dataPoint[key] = 0;
                  }
                });
                
                // Debug first few rows
                if (idx < 3) {
                  console.log('[generateChartsFromData] Sample data point', idx + 1, ':', dataPoint);
                }
                
                return dataPoint;
              }).filter(d => d.date);
              
              console.log('[generateChartsFromData] Metrics chart data generated:', chartData.length, 'rows');
              console.log('[generateChartsFromData] Sample chart data (first row):', chartData[0]);
              
              if (chartData.length > 0) {
                const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
                const series = numericKeys.map((key, idx) => ({
                  dataKey: key,
                  name: key.charAt(0).toUpperCase() + key.slice(1),
                  color: colors[idx % colors.length]
                }));
                
                console.log('[generateChartsFromData] Chart series:', series);
                
                charts.push({
                  type: 'line',
                  data: chartData,
                  series: series
                });
                
                console.log('[generateChartsFromData] Chart created with', chartData.length, 'data points and', series.length, 'series');
              }
            } else {
              console.warn('[generateChartsFromData] Missing dateKey or numericKeys:', { dateKey, numericKeys: numericKeys.length });
            }
          }
        }
      } catch (e) {
        console.error('[generateChartsFromData] JSON parsing error:', e);
      }
    }
    
    // Handle plain text data - try to extract chartable information
    if (dataType === 'text' && typeof dataToAnalyze === 'string' && charts.length === 0) {
      try {
        console.log('[generateChartsFromData] Attempting to extract data from plain text');
        
        // First, try to extract year from text (e.g., "Period: January 2024" or "January 2024")
        let extractedYear = null;
        const yearPattern = /(?:Period|Year|Date):?\s*(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{4})/i;
        const yearMatch = dataToAnalyze.match(yearPattern);
        if (yearMatch) {
          extractedYear = parseInt(yearMatch[1]);
          console.log('[generateChartsFromData] Extracted year from text:', extractedYear);
        }
        // Fallback: look for any 4-digit year in the text
        if (!extractedYear) {
          const anyYearMatch = dataToAnalyze.match(/\b(20\d{2})\b/);
          if (anyYearMatch) {
            extractedYear = parseInt(anyYearMatch[1]);
            console.log('[generateChartsFromData] Found year in text:', extractedYear);
          }
        }
        // Default to current year if not found
        const year = extractedYear || new Date().getFullYear();
        
        // Pattern 1a: Extract period-based data (e.g., "Period: January 2024" followed by metrics)
        const periodPattern = /(?:Period|Month|Quarter):?\s*(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{4})/gi;
        const periodMatches = [];
        
        // Process each period to extract metrics
        let periodMatch;
        while ((periodMatch = periodPattern.exec(dataToAnalyze)) !== null) {
          const month = periodMatch[1];
          const periodYear = parseInt(periodMatch[2]);
          const periodStart = periodMatch.index;
          
          // Find the text section for this period (next 1000 chars or until next period)
          const remainingText = dataToAnalyze.substring(periodStart + periodMatch[0].length);
          const nextPeriodMatch = remainingText.match(/(?:Period|Month|Quarter):?\s*(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}/i);
          const periodEnd = nextPeriodMatch 
            ? periodStart + periodMatch[0].length + nextPeriodMatch.index 
            : Math.min(periodStart + periodMatch[0].length + 1000, dataToAnalyze.length);
          
          const periodSection = dataToAnalyze.substring(periodStart + periodMatch[0].length, periodEnd);
          
          const monthIndex = monthNames.indexOf(month.toLowerCase());
          if (monthIndex >= 0) {
            // Extract metrics from this period section
            // Look for patterns like "Total Stories Published: 850" or "Total Engagement: 3,200 views"
            // Try multiple patterns to catch different metric formats
            const metricPatterns = [
              /Total\s+(?:Stories Published|Engagement|Views):\s*([\d,]+)/gi,
              /Total\s+([A-Za-z]+(?:\s+[A-Za-z]+)*?):\s*([\d,]+)/gi,
              /([A-Za-z]+(?:\s+[A-Za-z]+)*?):\s*([\d,]+)(?:\s+views|\s+employees)?/gi
            ];
            
            let metricFound = false;
            for (const metricPattern of metricPatterns) {
              metricPattern.lastIndex = 0; // Reset regex
              let metricMatch;
              
              while ((metricMatch = metricPattern.exec(periodSection)) !== null && !metricFound) {
                // Get value (last numeric capture group)
                const valueStr = (metricMatch[metricMatch.length - 1] || '').replace(/,/g, '');
                const value = parseFloat(valueStr);
                
                if (!isNaN(value) && value > 0 && value < 1000000000) {
                  // Prioritize engagement/stories metrics
                  const metricText = metricMatch[0].toLowerCase();
                  const isPreferred = metricText.includes('stories') || metricText.includes('engagement') || metricText.includes('views');
                  
                  if (isPreferred || !metricFound) {
                    const monthYear = periodYear || year;
                    const dateStr = `${monthYear}-${String(monthIndex + 1).padStart(2, '0')}-01`;
                    periodMatches.push({ date: dateStr, value, month, label: metricMatch[0] });
                    if (isPreferred) {
                      metricFound = true;
                      console.log(`[generateChartsFromData] Found metric for ${month} ${periodYear}:`, metricMatch[0], value);
                    }
                  }
                }
              }
              if (metricFound) break;
            }
            
            // If no metric found, log for debugging
            if (!metricFound && periodSection.length > 50) {
              console.log(`[generateChartsFromData] No metric found for period ${month} ${periodYear}, section preview:`, periodSection.substring(0, 200));
            }
          }
        }
        
        // Pattern 1b: Extract date-value pairs from text like "January 24th with 3,200 views" or "January 14th: Unusual spike"
        const dateValuePattern = /(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{1,2})(?:st|nd|rd|th)?(?:\s+with|\s+at|\s+reached|\s+peaked|\s+was|\s*:)?\s*([\d,]+)/gi;
        const dateValueMatches = [];
        let match;
        
        while ((match = dateValuePattern.exec(dataToAnalyze)) !== null) {
          const fullMatch = match[0];
          const month = fullMatch.match(/(January|February|March|April|May|June|July|August|September|October|November|December)/i)?.[0];
          const day = match[1];
          const valueStr = match[2];
          const value = parseFloat(valueStr.replace(/,/g, ''));
          
          if (month && day && !isNaN(value) && value > 0) {
            // Convert month name to date using extracted year
            const monthIndex = monthNames.indexOf(month.toLowerCase());
            if (monthIndex >= 0) {
              const dateStr = `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              dateValueMatches.push({ date: dateStr, value });
            }
          }
        }
        
        // Combine period matches with date-value matches (period matches take precedence for same month)
        const allDateValueMatches = [...periodMatches.map(p => ({ date: p.date, value: p.value }))];
        // Add date-value matches that don't conflict with period matches
        dateValueMatches.forEach(dv => {
          const monthYear = dv.date.substring(0, 7); // YYYY-MM
          if (!allDateValueMatches.find(a => a.date.startsWith(monthYear))) {
            allDateValueMatches.push(dv);
          }
        });
        
        // Pattern 1b: Extract dates mentioned without explicit values (for anomalies section)
        // e.g., "January 14th: Unusual spike" - we can use a placeholder or estimate
        const dateMentionPattern = /(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{1,2})(?:st|nd|rd|th)?(?:\s*:)/gi;
        const mentionedDates = [];
        let dateMention;
        
        while ((dateMention = dateMentionPattern.exec(dataToAnalyze)) !== null) {
          const month = dateMention[0].match(/(January|February|March|April|May|June|July|August|September|October|November|December)/i)?.[0];
          const day = dateMention[1];
          
          if (month && day) {
            const monthNames = ['january', 'february', 'march', 'april', 'may', 'june', 
                              'july', 'august', 'september', 'october', 'november', 'december'];
            const monthIndex = monthNames.indexOf(month.toLowerCase());
            if (monthIndex >= 0) {
              const dateStr = `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              // Check if this date already has a value
              if (!dateValueMatches.find(d => d.date === dateStr)) {
                mentionedDates.push(dateStr);
              }
            }
          }
        }
        
        // Pattern 2: Extract key metrics as a bar chart (e.g., "Total Stories: 850" or "Average Engagement: 2,150 per day")
        const metricsPattern = /(?:Total|Average|Peak|Max|Min|Sum)\s+(\w+(?:\s+\w+)?):\s+([\d,]+)(?:\s+per\s+\w+)?/gi;
        const metrics = [];
        let metricMatch;
        
        while ((metricMatch = metricsPattern.exec(dataToAnalyze)) !== null) {
          const metricName = metricMatch[1].trim();
          const value = parseFloat(metricMatch[2].replace(/,/g, ''));
          if (!isNaN(value) && value > 0) {
            metrics.push({ name: metricName, value });
          }
        }
        
        // Pattern 3: Extract metrics from bullet points (e.g., "- Total Stories: 850")
        const bulletMetricsPattern = /[-•]\s*(?:Total|Average|Peak|Max|Min|Sum)?\s*(\w+(?:\s+\w+)?):\s+([\d,]+)(?:\s+per\s+\w+)?/gi;
        let bulletMatch;
        
        while ((bulletMatch = bulletMetricsPattern.exec(dataToAnalyze)) !== null) {
          const metricName = bulletMatch[1].trim();
          const value = parseFloat(bulletMatch[2].replace(/,/g, ''));
          if (!isNaN(value) && value > 0) {
            // Avoid duplicates
            if (!metrics.find(m => m.name === metricName)) {
              metrics.push({ name: metricName, value });
            }
          }
        }
        
        // Pattern 4: Extract percentage changes as trend data
        const trendPattern = /(?:increased|decreased|grew|dropped|rose|fell|improved|declined)\s+(\d+)%/gi;
        const trends = [];
        let trendMatch;
        let trendIndex = 0;
        
        while ((trendMatch = trendPattern.exec(dataToAnalyze)) !== null && trendIndex < 10) {
          const change = parseFloat(trendMatch[1]);
          if (!isNaN(change)) {
            trends.push({ 
              date: `Week ${trendIndex + 1}`, 
              value: change 
            });
            trendIndex++;
          }
        }
        
        console.log('[generateChartsFromData] Text extraction results:', {
          periodMatches: periodMatches.length,
          dateValueMatches: dateValueMatches.length,
          allDateValueMatches: allDateValueMatches.length,
          mentionedDates: mentionedDates.length,
          metrics: metrics.length,
          trends: trends.length,
          year: year
        });
        
        // Use combined date-value matches (includes period matches)
        const finalDateValueMatches = allDateValueMatches;
        
        // Prioritize metrics bar chart if we have multiple metrics (more useful than single date-value)
        if (metrics.length >= 2) {
          charts.push({
            type: 'bar',
            data: metrics,
            series: [{ 
              dataKey: 'value', 
              name: 'Value', 
              color: '#3b82f6' 
            }]
          });
          console.log('[generateChartsFromData] Created bar chart from metrics:', metrics);
        }
        // Create chart from date-value pairs if found (preferred for time series with multiple points)
        else if (finalDateValueMatches.length >= 2) {
          const sortedData = finalDateValueMatches.sort((a, b) => a.date.localeCompare(b.date));
          charts.push({
            type: 'line',
            data: sortedData,
            series: [{ 
              dataKey: 'value', 
              name: 'Value', 
              color: '#3b82f6' 
            }]
          });
          console.log('[generateChartsFromData] Created line chart from date-value pairs:', sortedData);
        }
        // Handle single date-value point (add baseline for visualization)
        else if (finalDateValueMatches.length === 1) {
          const sortedData = [...finalDateValueMatches];
          // Add a point a few days before to show the trend
          const singlePoint = sortedData[0];
          const dateObj = new Date(singlePoint.date);
          dateObj.setDate(dateObj.getDate() - 4); // 4 days before
          const beforeDate = dateObj.toISOString().split('T')[0];
          
          sortedData.unshift({ date: beforeDate, value: 0 });
          
          charts.push({
            type: 'line',
            data: sortedData,
            series: [{ 
              dataKey: 'value', 
              name: 'Value', 
              color: '#3b82f6' 
            }]
          });
          console.log('[generateChartsFromData] Created line chart from single date-value with baseline:', sortedData);
        }
        // Create bar chart from metrics if found (fallback)
        else if (metrics.length >= 1) {
          charts.push({
            type: 'bar',
            data: metrics,
            series: [{ 
              dataKey: 'value', 
              name: 'Value', 
              color: '#3b82f6' 
            }]
          });
          console.log('[generateChartsFromData] Created bar chart from metrics:', metrics);
        }
        // Create chart from trends if found
        else if (trends.length >= 2) {
          charts.push({
            type: 'bar',
            data: trends,
            series: [{ 
              dataKey: 'value', 
              name: 'Change %', 
              color: '#10b981' 
            }]
          });
          console.log('[generateChartsFromData] Created bar chart from trends:', trends);
        } else {
          console.log('[generateChartsFromData] No chartable data found in plain text');
        }
      } catch (e) {
        console.error('[generateChartsFromData] Plain text parsing error:', e);
      }
    }
    
    console.log('[generateChartsFromData] Final charts:', charts.length);
    return charts;
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

    // Create user message - sanitize if it's a base64 image
    const isBase64Image = messageText.startsWith('data:image/') || 
                          (messageText.length > 10000 && messageText.includes('base64'));
    const sanitizedContent = isBase64Image
      ? `[Image uploaded: ${messageText.substring(5, messageText.indexOf(';') > 0 ? messageText.indexOf(';') : 20)} format]`
      : messageText;
    
    const newUserMessage = { 
      role: 'user', 
      content: sanitizedContent, 
      timestamp: new Date()
    };
    
    // Only add originalContent if it's a base64 image (for processing, but won't be saved to Firestore)
    if (isBase64Image) {
      newUserMessage._originalContent = messageText; // Use underscore prefix to indicate it's temporary
    }
    const updatedHistory = [...chatHistory, newUserMessage];
    setChatHistory(updatedHistory);
    
    await saveMessageToSession(newUserMessage, sessionId, updatedHistory);

    try {
      // Special handling for Analytics Agent - call analyzeData API directly
      if (selectedAgent?.id === 'analytics') {
        // Always call analytics API when analytics agent is selected
        setIsArtifactStreaming(true);
        setIsArtifactOpen(true);
        
        try {
          const dataDetection = detectDataInMessage(messageText);
          
          // If no data detected, this is a query - use RAG to retrieve relevant data from knowledge base
          const isQuery = !dataDetection.hasData;
          const dataToAnalyze = dataDetection.hasData 
            ? dataDetection.data 
            : messageText; // Pass query as data - backend will use it for RAG retrieval
          const dataType = dataDetection.hasData 
            ? dataDetection.dataType 
            : 'text';
          
          console.log('[Analytics Agent] Data detection:', {
            hasData: dataDetection.hasData,
            isQuery: isQuery,
            dataType: dataType,
            query: isQuery ? messageText : null
          });
          
          const response = await fetch('/api/analyzeData', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              data: dataToAnalyze,
              dataType: dataType,
              isQuery: isQuery, // Flag to indicate this is a query, not data
              query: isQuery ? messageText : undefined // Pass original query for better RAG retrieval
            }),
            signal: abortControllerRef.current.signal
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: 'Failed to analyze data' }));
            throw new Error(errorData.error || 'Failed to analyze data');
          }

          const analysisData = await response.json();
          
          if (analysisData.success && analysisData.analysis) {
            // Generate charts from the data if applicable
            // For queries, try to extract data from RAG context if available
            let dataForCharts = dataToAnalyze;
            let dataTypeForCharts = dataType;
            
            if (isQuery && analysisData.ragContext) {
              // Use RAG context to extract structured data for charts
              console.log('[Analytics Agent] Query with RAG context, attempting to extract data for charts');
              dataForCharts = analysisData.ragContext;
              dataTypeForCharts = 'text'; // RAG context is text, but may contain structured data
            }
            
            console.log('[Analytics Agent] Generating charts from data:', { 
              dataType: dataTypeForCharts, 
              dataLength: typeof dataForCharts === 'string' ? dataForCharts.length : 'object',
              isQuery: isQuery,
              hasRAGContext: !!analysisData.ragContext
            });
            const charts = generateChartsFromData(dataForCharts, dataTypeForCharts);
            console.log('[Analytics Agent] Charts generated:', charts.length, charts);
            
            // Set artifact data with analysis results and charts
            // AnalysisResults component expects: insights, trends, anomalies, recommendations, summary, charts
            const artifactData = {
              ...analysisData.analysis,
              charts: charts.length > 0 ? charts : [] // Always use array, even if empty
            };
            console.log('[Analytics Agent] Setting artifact data with charts:', { 
              hasCharts: artifactData.charts.length > 0, 
              chartCount: artifactData.charts.length,
              charts: artifactData.charts,
              analysisKeys: Object.keys(analysisData.analysis),
              dataType: dataType,
              dataPreview: typeof dataToAnalyze === 'string' ? dataToAnalyze.substring(0, 200) : 'object'
            });
            setArtifactData(artifactData);
            setArtifactType('analytics');
            
            // Create chat message
            const chatText = dataDetection.hasData 
              ? "I've analyzed your data. View the detailed insights in the panel."
              : "I've analyzed your query. View the insights in the panel.";
            const newAiMessage = {
              role: 'ai',
              content: chatText,
              timestamp: new Date(),
              citations: []
            };
            
            const finalHistory = [...updatedHistory, newAiMessage];
            setChatHistory(finalHistory);
            setSuggestions([]);
            setIsArtifactStreaming(false);
            
            await saveMessageToSession(newAiMessage, sessionId, finalHistory);
            
            // Update session title
            if (sessionId) {
              try {
                const sessionRef = doc(db, 'chatSessions', sessionId);
                const title = messageText.substring(0, 50);
                await updateDoc(sessionRef, {
                  title: title.length >= 50 ? title + '...' : title
                });
              } catch (error) {
                console.error('[Chat] Error updating session title:', error);
              }
            }
            
            setIsChatLoading(false);
            return;
          }
        } catch (analyticsError) {
          console.error('[Chat] Analytics error:', analyticsError);
          setIsArtifactStreaming(false);
          // Fall through to regular chat API
        }
      }

      // Special handling for Meetings Agent - call analyzeMeeting API directly
      if (selectedAgent?.id === 'meetings') {
        // Always call meeting analysis API when meetings agent is selected
        setIsArtifactStreaming(true);
        setIsArtifactOpen(true);
        
        try {
          // Extract title from message if possible (first line or first 50 chars)
          let meetingTitle = null;
          const lines = messageText.split('\n').filter(l => l.trim());
          if (lines.length > 0) {
            const firstLine = lines[0].trim();
            // If first line looks like a title (short, no punctuation at end, or contains keywords)
            if (firstLine.length < 100 && (
              firstLine.toLowerCase().includes('meeting') ||
              firstLine.toLowerCase().includes('notes') ||
              firstLine.toLowerCase().includes('transcript') ||
              !firstLine.match(/[.!?]$/)
            )) {
              meetingTitle = firstLine;
            } else {
              meetingTitle = messageText.substring(0, 50).trim();
            }
          } else {
            meetingTitle = messageText.substring(0, 50).trim();
          }

          console.log('[Meetings Agent] Analyzing meeting:', {
            contentLength: messageText.length,
            title: meetingTitle
          });

          const response = await fetch('/api/analyzeMeeting', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              content: messageText,
              title: meetingTitle
            }),
            signal: abortControllerRef.current.signal
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: 'Failed to analyze meeting' }));
            const errorMessage = errorData.error || errorData.message || 'Failed to analyze meeting';
            console.error('[Meetings Agent] API error:', {
              status: response.status,
              statusText: response.statusText,
              error: errorMessage
            });
            throw new Error(errorMessage);
          }

          const analysisData = await response.json();
          
          if (analysisData.success && analysisData.analysis) {
            // Set artifact data with meeting analysis results
            // MeetingAnalysis component expects: summary, actionItems, zombieTasks, decisions, alignmentWarnings
            // Also include title and content for saving to KB
            setArtifactData({
              ...analysisData.analysis,
              _meetingTitle: meetingTitle || messageText.substring(0, 100),
              _meetingContent: messageText
            });
            setArtifactType('meetings');
            
            // Create chat message
            const chatText = "I've analyzed the meeting. View the detailed analysis in the panel.";
            const newAiMessage = {
              role: 'ai',
              content: chatText,
              timestamp: new Date(),
              citations: []
            };
            
            const finalHistory = [...updatedHistory, newAiMessage];
            setChatHistory(finalHistory);
            setSuggestions([]);
            setIsArtifactStreaming(false);
            
            await saveMessageToSession(newAiMessage, sessionId, finalHistory);
            
            // Update session title
            if (sessionId) {
              try {
                const sessionRef = doc(db, 'chatSessions', sessionId);
                const title = meetingTitle || messageText.substring(0, 50);
                await updateDoc(sessionRef, {
                  title: title.length >= 50 ? title + '...' : title
                });
              } catch (error) {
                console.error('[Chat] Error updating session title:', error);
              }
            }
            
            setIsChatLoading(false);
            return;
          }
        } catch (meetingsError) {
          console.error('[Chat] Meetings analysis error:', meetingsError);
          setIsArtifactStreaming(false);
          // Fall through to regular chat API
        }
      }

      // Special handling for Podcast Agent - call podcast generation API directly
      if (selectedAgent?.id === 'podcast') {
        // Always call podcast API when podcast agent is selected
        setIsArtifactStreaming(true);
        setIsArtifactOpen(true);
        
        try {
          const generatePodcastUrl = 'https://generatepodcast-el2jwxb5bq-uc.a.run.app';
          const podcastResponse = await fetch(generatePodcastUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              topic: messageText,
              context: undefined
            }),
            signal: abortControllerRef.current.signal
          });

          if (!podcastResponse.ok) {
            throw new Error('Failed to generate podcast');
          }

          const podcastData = await podcastResponse.json();
          
          if (podcastData.success && podcastData.podcast) {
            // Set artifact data with script and audio
            setArtifactData({
              script: podcastData.podcast,
              audioUrl: podcastData.audioUrl || null
            });
            setArtifactType('podcast');
            
            // Create chat message
            const chatText = "I've generated the podcast script and audio in the panel.";
            const newAiMessage = {
              role: 'ai',
              content: chatText,
              timestamp: new Date(),
              citations: []
            };
            
            const finalHistory = [...updatedHistory, newAiMessage];
            setChatHistory(finalHistory);
            setSuggestions([]);
            setIsArtifactStreaming(false);
            
            await saveMessageToSession(newAiMessage, sessionId, finalHistory);
            
            // Update session title
            if (sessionId) {
              try {
                const sessionRef = doc(db, 'chatSessions', sessionId);
                const title = messageText.substring(0, 50);
                await updateDoc(sessionRef, {
                  title: title.length >= 50 ? title + '...' : title
                });
              } catch (error) {
                console.error('[Chat] Error updating session title:', error);
              }
            }
            
            setIsChatLoading(false);
            return;
          }
        } catch (podcastError) {
          console.error('[Chat] Podcast generation error:', podcastError);
          setIsArtifactStreaming(false);
          // Fall through to regular chat API
        }
      }

      // Special handling for Quiz Agent - call quiz generation API directly
      if (selectedAgent?.id === 'quiz') {
        // Always call quiz API when quiz agent is selected
        setIsArtifactStreaming(true);
        setIsArtifactOpen(true);
        
        try {
          const generateQuizUrl = 'https://generatequiz-el2jwxb5bq-uc.a.run.app';
          
          // Determine mode: if message is short (< 150 chars) and doesn't have newlines, treat as topic (knowledge-base mode)
          // Otherwise, treat as user content
          const isShortMessage = messageText.trim().length < 150 && !messageText.includes('\n');
          const mode = isShortMessage ? 'knowledge-base' : 'user-content';
          
          // Parse number of questions from message
          const numQuestions = parseNumQuestions(messageText);
          
          const quizResponse = await fetch(generateQuizUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              mode: mode,
              topic: mode === 'knowledge-base' ? messageText.trim() : null,
              content: mode === 'user-content' ? messageText.trim() : null,
              numQuestions: numQuestions
            }),
            signal: abortControllerRef.current.signal
          });

          if (!quizResponse.ok) {
            const errorData = await quizResponse.json().catch(() => ({ error: 'Failed to generate quiz' }));
            throw new Error(errorData.error || 'Failed to generate quiz');
          }

          const quizData = await quizResponse.json();
          
          if (quizData.success && quizData.quiz) {
            // Set artifact data with quiz object
            setArtifactData(quizData.quiz);
            setArtifactType('quiz');
            
            // Create chat message
            const chatText = `I've generated a quiz with ${quizData.quiz.questions?.length || 0} questions in the panel.`;
            const newAiMessage = {
              role: 'ai',
              content: chatText,
              timestamp: new Date(),
              citations: []
            };
            
            const finalHistory = [...updatedHistory, newAiMessage];
            setChatHistory(finalHistory);
            setSuggestions([]);
            setIsArtifactStreaming(false);
            
            await saveMessageToSession(newAiMessage, sessionId, finalHistory);
            
            // Update session title
            if (sessionId) {
              try {
                const sessionRef = doc(db, 'chatSessions', sessionId);
                const title = messageText.substring(0, 50);
                await updateDoc(sessionRef, {
                  title: title.length >= 50 ? title + '...' : title
                });
              } catch (error) {
                console.error('[Chat] Error updating session title:', error);
              }
            }
            
            setIsChatLoading(false);
            return;
          }
        } catch (quizError) {
          console.error('[Chat] Quiz generation error:', quizError);
          setIsArtifactStreaming(false);
          // Fall through to regular chat API
        }
      }

      // Special handling for Content Agent - call content generation API directly
      if (selectedAgent?.id === 'content') {
        // Always call content API when content agent is selected
        setIsArtifactStreaming(true);
        setIsArtifactOpen(true);
        
        try {
          const submitStoryUrl = 'https://submitstory-el2jwxb5bq-uc.a.run.app';
          
          // Detect generation type from message (content, image, or both)
          const lowerMessage = messageText.toLowerCase();
          const wantsImage = lowerMessage.includes('image') || lowerMessage.includes('picture') || lowerMessage.includes('visual');
          const wantsContent = !lowerMessage.includes('only image') && !lowerMessage.includes('image only');
          const generationType = wantsImage && wantsContent ? 'both' : wantsImage ? 'image' : 'content';
          
          // Create FormData for multipart/form-data (submitStory expects this format)
          const formData = new FormData();
          formData.append('storyTitle', messageText.substring(0, 100));
          formData.append('story', messageText);
          formData.append('keyShifts[]', 'Digital Transformation');
          formData.append('focusAreas[]', 'Innovation');
          formData.append('name', 'Vera User');
          formData.append('department', 'AI Assistant');
          formData.append('acknowledgement', 'true');

          const response = await fetch(submitStoryUrl, {
            method: 'POST',
            body: formData,
            signal: abortControllerRef.current.signal
          });

          if (!response.ok) {
            const errorData = await response.text();
            throw new Error(`Failed to submit story: ${errorData || response.statusText}`);
          }

          let data;
          try {
            data = await response.json();
          } catch (parseError) {
            const textResponse = await response.text();
            console.error('[Content Agent] Failed to parse JSON response:', textResponse);
            throw new Error(`Invalid response from story submission API: ${textResponse.substring(0, 200)}`);
          }

          console.log('[Content Agent] Story submission response:', data);
          
          const storyId = data.storyId || data.id || data.story?.id || data.result?.storyId;
          
          if (!storyId) {
            console.error('[Content Agent] No story ID in response:', data);
            // Instead of throwing, show error message and fall through to regular chat
            setIsArtifactStreaming(false);
            setIsArtifactOpen(false);
            
            const errorMessage = {
              role: 'ai',
              content: "I encountered an error while submitting your story. The story submission API didn't return a valid story ID. Please try again or use a different approach.",
              timestamp: new Date(),
              citations: []
            };
            
            const finalHistory = [...updatedHistory, errorMessage];
            setChatHistory(finalHistory);
            setSuggestions([]);
            setIsChatLoading(false);
            
            await saveMessageToSession(errorMessage, sessionId, finalHistory);
            return; // Don't fall through to regular chat
          }

          // Set up Firestore listener to wait for content and/or image generation
          let content = null;
          let imageUrl = null;
          let timeoutId = null;
          const hasContent = generationType === 'content' || generationType === 'both';
          const hasImage = generationType === 'image' || generationType === 'both';

          const unsubscribe = onSnapshot(
            doc(db, 'stories', storyId),
            (docSnapshot) => {
              if (docSnapshot.exists()) {
                const storyData = docSnapshot.data();
                
                // Check for content
                if (hasContent && storyData.aiGeneratedWriteup) {
                  content = storyData.aiGeneratedWriteup;
                }
                
                // Check if image is ready (must be valid HTTP URL, not "Pending local generation" or "pending")
                if (hasImage) {
                  const currentImageUrl = storyData.aiGeneratedImageUrl;
                  if (currentImageUrl && 
                      currentImageUrl !== 'Pending local generation' && 
                      currentImageUrl !== 'pending' &&
                      currentImageUrl.startsWith('http')) {
                    imageUrl = currentImageUrl;
                  }
                }
                
                // Determine what's ready
                const contentReady = !hasContent || !!content;
                const imageReady = !hasImage || !!imageUrl;
                
                // Update artifact data when we have something
                if (contentReady || imageReady) {
                  setArtifactData({
                    content: content || null,
                    imageUrl: imageUrl || null
                  });
                  setArtifactType('content');
                  
                  // If both are ready, stop listening and clear timeout
                  if (contentReady && imageReady) {
                    if (timeoutId) clearTimeout(timeoutId);
                    unsubscribe();
                    setIsArtifactStreaming(false);
                    
                    // Create chat message
                    const chatText = hasContent && hasImage
                      ? "I've generated the content and image in the panel."
                      : hasContent
                      ? "I've generated the content in the panel."
                      : "I've generated the image in the panel.";
                    
                    const newAiMessage = {
                      role: 'ai',
                      content: chatText,
                      timestamp: new Date(),
                      citations: []
                    };
                    
                    const finalHistory = [...updatedHistory, newAiMessage];
                    setChatHistory(finalHistory);
                    setSuggestions([]);
                    
                    saveMessageToSession(newAiMessage, sessionId, finalHistory).catch(err => {
                      console.error('[Chat] Error saving message:', err);
                    });
                    
                    // Update session title
                    if (sessionId) {
                      try {
                        const sessionRef = doc(db, 'chatSessions', sessionId);
                        const title = messageText.substring(0, 50);
                        updateDoc(sessionRef, {
                          title: title.length >= 50 ? title + '...' : title
                        }).catch(error => {
                          console.error('[Chat] Error updating session title:', error);
                        });
                      } catch (error) {
                        console.error('[Chat] Error updating session title:', error);
                      }
                    }
                    
                    setIsChatLoading(false);
                  } else if ((hasContent && contentReady && !hasImage) || (hasImage && imageReady && !hasContent)) {
                    // Only one type was requested and it's ready
                    if (timeoutId) clearTimeout(timeoutId);
                    unsubscribe();
                    setIsArtifactStreaming(false);
                    
                    // Create chat message
                    const chatText = hasContent
                      ? "I've generated the content in the panel."
                      : "I've generated the image in the panel.";
                    
                    const newAiMessage = {
                      role: 'ai',
                      content: chatText,
                      timestamp: new Date(),
                      citations: []
                    };
                    
                    const finalHistory = [...updatedHistory, newAiMessage];
                    setChatHistory(finalHistory);
                    setSuggestions([]);
                    
                    saveMessageToSession(newAiMessage, sessionId, finalHistory).catch(err => {
                      console.error('[Chat] Error saving message:', err);
                    });
                    
                    // Update session title
                    if (sessionId) {
                      try {
                        const sessionRef = doc(db, 'chatSessions', sessionId);
                        const title = messageText.substring(0, 50);
                        updateDoc(sessionRef, {
                          title: title.length >= 50 ? title + '...' : title
                        }).catch(error => {
                          console.error('[Chat] Error updating session title:', error);
                        });
                      } catch (error) {
                        console.error('[Chat] Error updating session title:', error);
                      }
                    }
                    
                    setIsChatLoading(false);
                  } else {
                    // Still waiting for content or image
                    setIsArtifactStreaming(true);
                  }
                }
              }
            },
            (error) => {
              console.error('[Content Agent] Firestore listener error:', error);
              if (timeoutId) clearTimeout(timeoutId);
              unsubscribe();
              setIsArtifactStreaming(false);
              
              // Show whatever we have or error message
              if (content || imageUrl) {
                setArtifactData({
                  content: content || null,
                  imageUrl: imageUrl || null
                });
              } else {
                // Fall through to regular chat API
                setIsArtifactOpen(false);
              }
              setIsChatLoading(false);
            }
          );

          // Set a timeout to stop listening after 2 minutes
          timeoutId = setTimeout(() => {
            unsubscribe();
            // Show whatever we have (content or partial results)
            setArtifactData({
              content: content || (hasContent ? 'Content generation is taking longer than expected. Please check back later.' : null),
              imageUrl: imageUrl || null
            });
            setArtifactType('content');
            setIsArtifactStreaming(false);
            
            // Create chat message
            const chatText = content || imageUrl
              ? "I've generated the content in the panel. Some parts may still be processing."
              : "Content generation is taking longer than expected. Please check back later.";
            
            const newAiMessage = {
              role: 'ai',
              content: chatText,
              timestamp: new Date(),
              citations: []
            };
            
            const finalHistory = [...updatedHistory, newAiMessage];
            setChatHistory(finalHistory);
            setSuggestions([]);
            
            saveMessageToSession(newAiMessage, sessionId, finalHistory).catch(err => {
              console.error('[Chat] Error saving message:', err);
            });
            
            setIsChatLoading(false);
          }, 120000); // 2 minutes
          
        } catch (contentError) {
          console.error('[Chat] Content generation error:', contentError);
          setIsArtifactStreaming(false);
          // Fall through to regular chat API
        }
      }

      // Special handling for Visual Agent - call image analysis API directly
      if (selectedAgent?.id === 'visual') {
        setIsArtifactStreaming(true);
        setIsArtifactOpen(true);
        
        try {
          // Check if message contains image URL or if we need to handle image upload
          // Get original content if it was a base64 image, otherwise use messageText
          const lastUserMessage = updatedHistory[updatedHistory.length - 1];
          const imageContent = lastUserMessage?._originalContent || messageText;
          let imageUrl = imageContent.trim();
          let mode = 'single';
          
          // Detect if it's a base64 data URL (check for data:image prefix, even if truncated)
          // Also check if message is very long (likely base64) or contains base64 indicators
          const isDataUrl = imageUrl.startsWith('data:image/') || 
                           imageUrl.startsWith('data:image') ||
                           (imageUrl.includes('base64') && imageUrl.length > 100) ||
                           (imageUrl.length > 500 && /^[A-Za-z0-9+/=]/.test(imageUrl.substring(0, 50))); // Very long alphanumeric string likely base64
          
          // If it's not a URL and not base64, try to extract URL from text
          if (!imageUrl.startsWith('http') && !isDataUrl) {
            // Try to find URL in the text
            const urlMatch = imageUrl.match(/https?:\/\/[^\s]+/);
            if (urlMatch) {
              imageUrl = urlMatch[0];
            } else {
              // If no URL found and not base64, show error but don't fall through to chat
              throw new Error('Please provide an image URL or upload an image file using the attachment button');
            }
          }

          // Detect mode from message (simple keyword detection)
          const lowerMessage = messageText.toLowerCase();
          if (lowerMessage.includes('compare') || lowerMessage.includes('comparison')) {
            mode = 'compare';
          } else if (lowerMessage.includes('ocr') || lowerMessage.includes('extract text')) {
            mode = 'ocr';
          } else if (lowerMessage.includes('similar') || lowerMessage.includes('find similar')) {
            mode = 'similarity';
          }

          console.log('[Visual Agent] Analyzing image:', {
            mode,
            isDataUrl,
            imageUrlLength: imageUrl.length,
            imageUrlPreview: imageUrl.substring(0, 100)
          });

          const response = await fetch('/api/analyzeImage', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              mode: mode,
              imageUrl: isDataUrl || imageUrl.startsWith('http') ? imageUrl : null,
              context: mode === 'single' ? (isDataUrl ? undefined : messageText) : undefined
            }),
            signal: abortControllerRef.current.signal
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: 'Failed to analyze image' }));
            const errorMessage = errorData.error || errorData.message || 'Failed to analyze image';
            console.error('[Visual Agent] API error:', errorMessage);
            throw new Error(errorMessage);
          }

          const analysisData = await response.json();
          
          console.log('[Visual Agent] Response received:', {
            success: analysisData.success,
            hasAnalysis: !!analysisData.analysis,
            hasTags: !!analysisData.tags,
            keys: Object.keys(analysisData),
            mode: analysisData.mode
          });
          
          // Handle different response structures
          // New format: { success: true, analysis: {...}, mode: 'single' }
          // Old format: { success: true, tags: [...], category: '...', description: '...' }
          let visualData = null;
          
          if (analysisData.success) {
            if (analysisData.analysis) {
              // New format with analysis object
              visualData = analysisData;
            } else if (analysisData.tags || analysisData.category || analysisData.description) {
              // Old format - wrap in analysis structure
              visualData = {
                success: true,
                mode: mode,
                analysis: {
                  tags: analysisData.tags || [],
                  category: analysisData.category || null,
                  description: analysisData.description || null,
                  imageUrl: imageUrl
                },
                ragMetadata: analysisData.ragMetadata || {}
              };
            }
          }
          
          if (visualData) {
            // Set artifact data with visual analysis results
            setArtifactData(visualData);
            setArtifactType('visual');
            
            // Create chat message
            const chatText = mode === 'compare' 
              ? "I've compared the images. View the detailed comparison in the panel."
              : mode === 'ocr'
              ? "I've extracted text from the image. View the results in the panel."
              : "I've analyzed the image. View the detailed analysis in the panel.";
            
            const newAiMessage = {
              role: 'ai',
              content: chatText,
              timestamp: new Date(),
              citations: []
            };
            
            const finalHistory = [...updatedHistory, newAiMessage];
            setChatHistory(finalHistory);
            setSuggestions([]);
            setIsArtifactStreaming(false);
            
            await saveMessageToSession(newAiMessage, sessionId, finalHistory);
            
            // Update session title
            if (sessionId) {
              try {
                const sessionRef = doc(db, 'chatSessions', sessionId);
                const title = `Image Analysis - ${mode}`;
                await updateDoc(sessionRef, {
                  title: title
                });
              } catch (error) {
                console.error('[Chat] Error updating session title:', error);
              }
            }
            
            setIsChatLoading(false);
            return;
          } else {
            console.error('[Visual Agent] Unexpected response structure:', analysisData);
            throw new Error(`Analysis completed but response structure is invalid. Response: ${JSON.stringify(analysisData).substring(0, 200)}`);
          }
        } catch (visualError) {
          console.error('[Chat] Visual analysis error:', visualError);
          setIsArtifactStreaming(false);
          setIsArtifactOpen(false);
          
          // Show error message to user instead of falling through
          const errorMessage = visualError.message || 'Failed to analyze image. Please try again.';
          const errorAiMessage = {
            role: 'ai',
            content: `I encountered an error while analyzing the image: ${errorMessage}. Please make sure you've uploaded a valid image file or provided a valid image URL.`,
            timestamp: new Date(),
            citations: []
          };
          
          const finalHistory = [...updatedHistory, errorAiMessage];
          setChatHistory(finalHistory);
          setSuggestions([]);
          setIsChatLoading(false);
          
          await saveMessageToSession(errorAiMessage, sessionId, finalHistory);
          return; // Don't fall through to regular chat API
        }
      }

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
        
        // Process response for artifact
        let chatText = data.reply;
        if (selectedAgent) {
          const processed = processAgentResponse(data.reply, selectedAgent.id);
          if (processed.artifactContent) {
            chatText = processed.chatText;
            const parsedData = parseArtifactData(processed.artifactContent, selectedAgent.id, processed.artifactType);
            setArtifactData(parsedData);
            setArtifactType(processed.artifactType);
            setIsArtifactOpen(true);
          }
        }
        
        const newAiMessage = { 
          role: 'ai', 
          content: chatText, 
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

  // File Upload Handler
  const handleFileUpload = async (uploadStatus) => {
    if (uploadStatus.status === 'uploading' || uploadStatus.status === 'processing') {
      setIsFileUploading(true);
      setUploadProgress(uploadStatus.progress || 0);
      setUploadError(null);
    } else if (uploadStatus.status === 'success') {
      setIsFileUploading(false);
      setUploadProgress(100);
      setUploadError(null);
      
      // If meeting agent is selected and we have extracted text, automatically send it
      if (selectedAgent?.id === 'meetings' && uploadStatus.extractedText) {
        // Small delay to show success state
        setTimeout(() => {
          handleChatSubmit(uploadStatus.extractedText);
          setUploadProgress(0);
        }, 500);
      } 
      // If visual agent is selected and we have an image URL, automatically analyze it
      else if (selectedAgent?.id === 'visual' && uploadStatus.imageUrl) {
        setTimeout(() => {
          handleChatSubmit(uploadStatus.imageUrl);
          setUploadProgress(0);
        }, 500);
      } 
      else {
        setUploadProgress(0);
      }
    } else if (uploadStatus.status === 'error') {
      setIsFileUploading(false);
      setUploadProgress(0);
      setUploadError(uploadStatus.error || 'Failed to upload file');
      console.error('[File Upload] Error:', uploadStatus.error);
    }
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
    // Close artifact panel when loading history
    setIsArtifactOpen(false);
    setArtifactData(null);
    setIsArtifactStreaming(false);
    setArtifactType(null);
  };

  // Content Separation & Extraction Logic
  const processAgentResponse = (fullText, agentId) => {
    if (!agentId || !fullText) {
      return { chatText: fullText, artifactContent: null, artifactType: null };
    }

    // Extract code blocks
    const codeMatch = fullText.match(/```(\w+)?\n?([\s\S]*?)```/);
    if (codeMatch && codeMatch[2].length > 100) {
      return {
        chatText: fullText.replace(codeMatch[0], "I've generated the artifact in the panel."),
        artifactContent: codeMatch[2],
        artifactType: 'code'
      };
    }
    
    // Extract markdown document (starts with ## or ###)
    const markdownMatch = fullText.match(/((?:##|###).*)/s);
    if (markdownMatch && markdownMatch[1].length > 200) {
      return {
        chatText: fullText.replace(markdownMatch[1], "I've generated the document in the panel."),
        artifactContent: markdownMatch[1],
        artifactType: 'markdown'
      };
    }
    
    // Agent-specific extraction
    if (agentId === 'analytics') {
      // Try to parse JSON structure for charts
      const jsonMatch = fullText.match(/\{[\s\S]*"charts"[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const data = JSON.parse(jsonMatch[0]);
          return {
            chatText: "I've analyzed the data. View the results in the panel.",
            artifactContent: data,
            artifactType: 'analytics'
          };
        } catch (e) {
          // If JSON parse fails, continue to default
        }
      }
    }
    
    // Default: Use full response if long enough and agent is selected
    if (fullText.length > 500) {
      return {
        chatText: "I've generated the content in the panel.",
        artifactContent: fullText,
        artifactType: 'text'
      };
    }
    
    return { chatText: fullText, artifactContent: null, artifactType: null };
  };

  // Parse artifact data for agent components
  const parseArtifactData = (content, agentId, artifactType) => {
    if (!content) return null;

    switch (agentId) {
      case 'analytics':
        // If already parsed JSON, return as-is
        if (typeof content === 'object') return content;
        // Try to extract structured data from markdown/text
        // For now, return as text - can be enhanced later
        return { insights: content, trends: null, anomalies: null, recommendations: null, charts: null };
      
      case 'content':
        // Extract text and look for image URLs
        const imageUrlMatch = content.match(/!\[.*?\]\((.*?)\)/);
        const imageUrl = imageUrlMatch ? imageUrlMatch[1] : null;
        return { content: content, imageUrl: imageUrl };
      
      case 'meetings':
        // Try to parse meeting structure
        return { summary: content, actionItems: [], decisions: [], alignmentWarnings: [], zombieTasks: [] };
      
      case 'podcast':
        // Try to extract audioUrl from content if it's a URL
        let audioUrl = null;
        
        // If content is already an object with audioUrl, preserve it
        if (typeof content === 'object' && content !== null) {
          if (content.audioUrl) {
            audioUrl = content.audioUrl;
          }
          // If content has script property, use it; otherwise use content itself
          const script = content.script || content;
          return { script: script, audioUrl: audioUrl };
        }
        
        // If content is a string, try to extract audioUrl
        if (typeof content === 'string') {
          // Look for audio URL patterns
          const urlMatch = content.match(/https?:\/\/[^\s\)]+\.(mp3|wav|m4a|ogg)/i);
          if (urlMatch) {
            audioUrl = urlMatch[0];
          }
          // Also check if content contains JSON with audioUrl
          const jsonMatch = content.match(/\{[^}]*"audioUrl"[^}]*\}/);
          if (jsonMatch) {
            try {
              const parsed = JSON.parse(jsonMatch[0]);
              if (parsed.audioUrl) {
                audioUrl = parsed.audioUrl;
              }
            } catch (e) {
              // Ignore JSON parse errors
            }
          }
        }
        
        return { script: content, audioUrl: audioUrl };
      
      case 'quiz':
        // If content is already an object with quiz structure, return as-is
        if (typeof content === 'object' && content !== null) {
          // Ensure it has the expected quiz structure
          if (content.title || content.questions) {
            return content;
          }
        }
        
        // If content is a string, try to parse as JSON
        if (typeof content === 'string') {
          try {
            // Try to extract JSON from markdown code blocks if present
            let jsonText = content.trim();
            if (jsonText.startsWith('```json')) {
              jsonText = jsonText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
            } else if (jsonText.startsWith('```')) {
              jsonText = jsonText.replace(/^```\s*/, '').replace(/\s*```$/, '');
            }
            
            // Find JSON object boundaries
            const jsonStart = jsonText.indexOf('{');
            const jsonEnd = jsonText.lastIndexOf('}') + 1;
            if (jsonStart !== -1 && jsonEnd > jsonStart) {
              jsonText = jsonText.substring(jsonStart, jsonEnd);
            }
            
            const parsed = JSON.parse(jsonText);
            if (parsed.title || parsed.questions) {
              return parsed;
            }
          } catch (e) {
            // If JSON parse fails, continue to default
            console.warn('[parseArtifactData] Failed to parse quiz JSON:', e);
          }
        }
        
        // Default: return content as-is
        return content;
      
      case 'visual':
        // If content is already an object with analysis structure, return as-is
        if (typeof content === 'object' && content !== null) {
          // Ensure it has the expected visual analysis structure
          if (content.analysis || content.mode || content.tags) {
            return content;
          }
        }
        
        // If content is a string, try to parse as JSON
        if (typeof content === 'string') {
          try {
            let jsonText = content.trim();
            if (jsonText.startsWith('```json')) {
              jsonText = jsonText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
            } else if (jsonText.startsWith('```')) {
              jsonText = jsonText.replace(/^```\s*/, '').replace(/\s*```$/, '');
            }
            
            const jsonStart = jsonText.indexOf('{');
            const jsonEnd = jsonText.lastIndexOf('}') + 1;
            if (jsonStart !== -1 && jsonEnd > jsonStart) {
              jsonText = jsonText.substring(jsonStart, jsonEnd);
            }
            
            const parsed = JSON.parse(jsonText);
            if (parsed.analysis || parsed.mode || parsed.tags) {
              return parsed;
            }
          } catch (e) {
            console.warn('[parseArtifactData] Failed to parse visual JSON:', e);
          }
        }
        
        // Default: return content as-is
        return content;
      
      default:
        return content;
    }
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
                  selectedAgent={selectedAgent}
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

          {/* Agent Workspace Container */}
          <div className={`agent-workspace ${isArtifactOpen ? 'is-active' : ''}`}>
            {/* Chat Column */}
            <div className="workspace-chat flex-1 flex flex-col overflow-hidden">
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
                    onAgentSelect={(agent) => {
                      setSelectedAgent(agent);
                      // Close artifact panel when switching agents
                      if (!agent) {
                        setIsArtifactOpen(false);
                        setArtifactData(null);
                        setIsArtifactStreaming(false);
                        setArtifactType(null);
                      } else {
                        // Clear artifact when switching to different agent
                        setIsArtifactOpen(false);
                        setArtifactData(null);
                        setIsArtifactStreaming(false);
                        setArtifactType(null);
                      }
                    }}
                    onFileUpload={handleFileUpload}
                    isUploading={isFileUploading}
                  />
                </div>
                
                {/* Suggested Questions - Below input (Horizontal Scrollable) */}
                <SuggestedQuestions onQuestionClick={handleQuestionClick} />
              </div>
            ) : (
              // Chat Messages - Centered with max-width
              <div className={`w-full flex justify-center py-8 ${isArtifactOpen ? 'px-4' : 'px-4 md:px-6 lg:px-8'}`}>
                  <div className={`w-full ${isArtifactOpen ? 'max-w-full' : 'max-w-[850px]'} space-y-6`}>
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
                          
                          <div className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} ${isArtifactOpen ? 'max-w-[95%]' : 'max-w-[85%]'}`}>
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
                      <div className={`${isArtifactOpen ? 'max-w-full' : 'max-w-[850px]'} mx-auto`}>
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
                <div className={`${isArtifactOpen ? 'max-w-full' : 'max-w-[850px]'} mx-auto w-full px-4 md:px-6 pb-4 md:pb-6`}>
                  <ChatInput
                    value={chatInput}
                    onChange={setChatInput}
                    onSubmit={() => handleChatSubmit(chatInput)}
                    onStop={handleStop}
                    isLoading={isChatLoading || isStreaming}
                    placeholder={selectedAgent ? `Ask ${selectedAgent.name}...` : "Ask anything... (use / for commands)"}
                    selectedAgent={selectedAgent}
                    onAgentSelect={(agent) => {
                      setSelectedAgent(agent);
                      // Close artifact panel when switching agents
                      if (!agent) {
                        setIsArtifactOpen(false);
                        setArtifactData(null);
                        setIsArtifactStreaming(false);
                        setArtifactType(null);
                      } else {
                        // Clear artifact when switching to different agent
                        setIsArtifactOpen(false);
                        setArtifactData(null);
                        setIsArtifactStreaming(false);
                        setArtifactType(null);
                      }
                    }}
                    onFileUpload={handleFileUpload}
                    isUploading={isFileUploading}
                  />
                </div>
              </>
                </div>
              )}
            </div>

            {/* Artifact Panel */}
            <ArtifactPanel
              isOpen={isArtifactOpen}
              agent={selectedAgent}
              data={artifactData}
              isStreaming={isArtifactStreaming}
              onClose={() => setIsArtifactOpen(false)}
            />
          </div>
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
