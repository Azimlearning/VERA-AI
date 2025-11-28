// src/components/vera/ChatInput.js
'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPaperPlane, FaTimes, FaStop, FaPaperclip } from 'react-icons/fa';
import AgentPickerButton from './AgentPickerButton';
import { storage } from '../../lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

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
  onAgentSelect = null,
  onFileUpload = null,
  isUploading = false
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

  const fileInputRef = useRef(null);

  const handleAttachmentClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const fileExt = file.name.split('.').pop().toLowerCase();
    const isImage = file.type.startsWith('image/');
    const isDocument = ['pdf', 'docx', 'doc', 'txt', 'rtf', 'odt'].includes(fileExt);

    // Validate file type based on selected agent
    if (selectedAgent?.id === 'visual' && !isImage) {
      alert('Please select an image file (JPG, PNG, GIF, WebP)');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    } else if (selectedAgent?.id === 'meetings' && !isDocument) {
      alert('Please select a valid document file (PDF, DOCX, DOC, TXT, RTF, or ODT)');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    } else if (!selectedAgent || (selectedAgent.id !== 'meetings' && selectedAgent.id !== 'visual')) {
      if (!onFileUpload) {
        alert('Please select the Meetings Agent or Visual Agent to upload files');
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        return;
      }
    }

    // Validate file size (10MB limit for documents, 5MB for images)
    const maxSize = isImage ? 5 * 1024 * 1024 : 10 * 1024 * 1024; // 5MB for images, 10MB for documents
    if (file.size > maxSize) {
      alert(`File size must be less than ${isImage ? '5MB' : '10MB'}`);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    // Handle image uploads for visual agent
    if (selectedAgent?.id === 'visual' && isImage) {
      try {
        // Convert image to base64 data URL for immediate use
        const reader = new FileReader();
        reader.onload = (e) => {
          const imageDataUrl = e.target.result;
          if (onFileUpload) {
            onFileUpload({ 
              status: 'success', 
              progress: 100, 
              fileName: file.name,
              imageUrl: imageDataUrl,
              fileType: 'image'
            });
          }
        };
        reader.onerror = () => {
          if (onFileUpload) {
            onFileUpload({ 
              status: 'error', 
              error: 'Failed to read image file',
              fileName: file.name 
            });
          }
        };
        reader.readAsDataURL(file);
        
        // Clear file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        return; // Exit early for image uploads
      } catch (error) {
        console.error('Error processing image:', error);
        if (onFileUpload) {
          onFileUpload({ 
            status: 'error', 
            error: error.message || 'Failed to process image',
            fileName: file.name 
          });
        }
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        return;
      }
    }

    try {
      // Upload file to Firebase Storage
      const filename = `meetingFiles/${Date.now()}_${file.name}`;
      const storageRef = ref(storage, filename);
      
      // Show upload progress if callback is provided
      if (onFileUpload) {
        onFileUpload({ status: 'uploading', progress: 0, fileName: file.name });
      }

      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      
      console.log('[File Upload] File uploaded successfully:', {
        fileName: file.name,
        fileSize: file.size,
        fileType: fileExt,
        downloadURL: downloadURL,
        storagePath: filename
      });

      // Process file to extract text
      if (onFileUpload) {
        onFileUpload({ status: 'processing', progress: 50, fileName: file.name });
      }

      const functionUrl = process.env.NEXT_PUBLIC_PROCESS_MEETING_FILE_URL || 'https://us-central1-systemicshiftv2.cloudfunctions.net/processMeetingFile';
      
      const requestBody = {
        fileUrl: downloadURL,
        fileName: file.name,
        fileType: fileExt
      };
      
      console.log('[File Upload] Calling processMeetingFile with:', requestBody);
      
      const processResponse = await fetch(functionUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });
      
      console.log('[File Upload] Process response status:', processResponse.status, processResponse.statusText);

      if (!processResponse.ok) {
        const errorData = await processResponse.json().catch(() => ({ error: 'Failed to process file' }));
        throw new Error(errorData.error || errorData.message || 'Failed to process file');
      }

      const processData = await processResponse.json();
      
      console.log('[File Upload] Process response data:', {
        success: processData.success,
        hasExtractedText: !!processData.extractedText,
        extractedTextLength: processData.extractedText?.length || 0,
        error: processData.error,
        message: processData.message
      });
      
      // Check if extraction was successful and text is not empty
      if (processData.extractedText && processData.extractedText.trim().length > 0) {
        // If meeting agent is selected, automatically send the extracted text
        if (selectedAgent?.id === 'meetings' && onFileUpload) {
          onFileUpload({ 
            status: 'success', 
            progress: 100, 
            fileName: file.name,
            extractedText: processData.extractedText 
          });
        } else if (onFileUpload) {
          // Otherwise, just notify parent component
          onFileUpload({ 
            status: 'success', 
            progress: 100, 
            fileName: file.name,
            extractedText: processData.extractedText 
          });
        }
      } else {
        // Check if there's an error message from the server
        const errorMsg = processData.error || processData.message || 'No text could be extracted from the file. The file may be empty, corrupted, or in an unsupported format.';
        throw new Error(errorMsg);
      }
    } catch (error) {
      console.error('Error uploading/processing file:', error);
      const errorMessage = error.message || 'Failed to upload or process file. Please try again.';
      alert(`Failed to upload or process file: ${errorMessage}`);
      if (onFileUpload) {
        onFileUpload({ status: 'error', error: errorMessage, fileName: file.name });
      }
    } finally {
      // Clear file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Command Center Input Wrapper */}
      <div className="chat-input-wrapper">
        {/* Row 1: Text Area (Top) */}
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

        {/* Row 2: Control Deck (Bottom) */}
        <div className="input-footer">
          {/* Footer Left: Attachment Button */}
          <div className="footer-left">
            <button
              type="button"
              className="attach-btn"
              onClick={handleAttachmentClick}
              title="Upload Document"
              disabled={isLoading || isUploading}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
              </svg>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept={selectedAgent?.id === 'visual' 
                ? "image/*" 
                : selectedAgent?.id === 'meetings'
                ? ".pdf,.docx,.txt,.doc,.rtf,.odt"
                : ".pdf,.docx,.txt,.doc,.rtf,.odt,image/*"}
              onChange={handleFileChange}
              className="hidden"
              disabled={isLoading || isUploading}
            />
          </div>

          {/* Footer Right: Agent Pill & Send Button */}
          <div className="footer-right">
            {/* Agent Pill Selector */}
            {onAgentSelect ? (
              <div style={{ position: 'relative' }}>
                <AgentPickerButton
                  selectedAgent={selectedAgent}
                  onAgentSelect={onAgentSelect}
                  pillStyle={true}
                />
              </div>
            ) : (
              <button className="agent-pill-btn" disabled>
                <span className="agent-icon">🤖</span>
                <span className="agent-name"><span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-emerald-500">Vera</span> (Default)</span>
              </button>
            )}
            
            {/* Send Button (Circle) */}
            {isLoading ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onStop}
                className="send-btn-circle"
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
                className="send-btn-circle"
                title="Send message"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="22" y1="2" x2="11" y2="13"></line>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                </svg>
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

