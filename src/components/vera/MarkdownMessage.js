// src/components/vera/MarkdownMessage.js
'use client';

import { useState } from 'react';
import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { FaCopy, FaCheck } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * MarkdownMessage Component
 * 
 * Renders markdown content with syntax highlighting for code blocks
 * Includes copy button for code blocks and inline citation support
 * 
 * @param {string} content - The markdown content to render
 * @param {boolean} isStreaming - Whether the content is currently streaming
 * @param {string} streamingText - The streaming text content
 * @param {Array} citations - Array of citation objects with title, sourceUrl, number
 * @param {number} messageIndex - The index of this message in the chat history (for scoped citation IDs)
 */
export default function MarkdownMessage({ 
  content, 
  isStreaming = false, 
  streamingText = '', 
  citations = [],
  messageIndex = 0 
}) {
  const [copiedCodeBlock, setCopiedCodeBlock] = useState(null);
  
  // Create a map of citation numbers to citation data
  const citationMap = {};
  citations.forEach((citation, index) => {
    const number = citation.number || (index + 1);
    citationMap[number] = citation;
  });
  
  const handleCopyCode = async (code, index) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCodeBlock(index);
      setTimeout(() => setCopiedCodeBlock(null), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  /**
   * Handle citation click - scroll to source card and highlight
   */
  const handleCitationClick = (e, citationNumber) => {
    e.preventDefault();
    // Use message-scoped citation ID
    const citationId = `citation-${messageIndex}-${citationNumber}`;
    const element = document.getElementById(citationId);
    
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Highlight briefly
      element.style.backgroundColor = 'rgba(20, 184, 166, 0.3)';
      element.style.transition = 'background-color 0.3s ease';
      setTimeout(() => {
        element.style.backgroundColor = '';
      }, 1500);
    } else {
      // Fallback: try without message index (for backward compatibility)
      const fallbackElement = document.getElementById(`citation-${citationNumber}`);
      if (fallbackElement) {
        fallbackElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        fallbackElement.style.backgroundColor = 'rgba(20, 184, 166, 0.3)';
        fallbackElement.style.transition = 'background-color 0.3s ease';
        setTimeout(() => {
          fallbackElement.style.backgroundColor = '';
        }, 1500);
      }
    }
  };

  /**
   * Process text to replace [1], [2] with clickable citation links
   */
  const processCitations = (text) => {
    if (typeof text !== 'string' || citations.length === 0) return text;
    
    const parts = [];
    let lastIndex = 0;
    const citationRegex = /\[(\d+)\]/g;
    let match;
    
    while ((match = citationRegex.exec(text)) !== null) {
      // Add text before citation
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }
      
      // Add citation link
      const citationNumber = parseInt(match[1]);
      const citation = citationMap[citationNumber];
      
      if (citation) {
        parts.push(
          <a
            key={`citation-${messageIndex}-${match.index}`}
            href={`#citation-${messageIndex}-${citationNumber}`}
            className="inline-citation"
            title={citation.title || `Source ${citationNumber}`}
            onClick={(e) => handleCitationClick(e, citationNumber)}
          >
            [{citationNumber}]
          </a>
        );
      } else {
        // Citation number doesn't exist in our map - render as plain text
        parts.push(
          <span 
            key={`citation-unknown-${match.index}`}
            className="inline-citation-unknown"
            title="Source not found"
          >
            [{citationNumber}]
          </span>
        );
      }
      
      lastIndex = match.index + match[0].length;
    }
    
    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }
    
    return parts.length > 0 ? parts : text;
  };

  // Use streaming text if provided, otherwise use full content
  const rawContent = isStreaming && streamingText ? streamingText : (content || '');

  return (
    <>
      <style>{`
        .inline-citation {
          color: #14b8a6;
          text-decoration: none;
          font-weight: 600;
          margin: 0 1px;
          padding: 1px 5px;
          border-radius: 4px;
          background-color: rgba(20, 184, 166, 0.12);
          transition: all 0.2s ease;
          cursor: pointer;
          font-size: 0.85em;
          vertical-align: super;
          line-height: 1;
        }
        .inline-citation:hover {
          background-color: rgba(20, 184, 166, 0.25);
          color: #0d9488;
          transform: scale(1.05);
        }
        .inline-citation-unknown {
          color: #9ca3af;
          font-weight: 500;
          margin: 0 1px;
          padding: 1px 4px;
          border-radius: 3px;
          background-color: rgba(156, 163, 175, 0.1);
          font-size: 0.85em;
          vertical-align: super;
          cursor: default;
        }
      `}</style>
      <div className="prose max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-strong:text-gray-900 prose-code:text-gray-900">
        <ReactMarkdown
        components={{
          // Code blocks with syntax highlighting
          code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            const codeString = String(children).replace(/\n$/, '');
            const codeIndex = node?.position?.start?.line || Math.random();

            return !inline && match ? (
              <div className="relative my-4">
                <div className="flex items-center justify-between bg-gray-100 px-4 py-2 rounded-t-lg border-b border-gray-200">
                  <span className="text-xs text-gray-600 font-mono">{match[1]}</span>
                  <button
                    onClick={() => handleCopyCode(codeString, codeIndex)}
                    className="flex items-center gap-2 px-3 py-1 text-xs text-gray-700 hover:text-gray-900 bg-white hover:bg-gray-50 rounded transition-colors border border-gray-200"
                  >
                    <AnimatePresence mode="wait">
                      {copiedCodeBlock === codeIndex ? (
                        <motion.span
                          key="check"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          className="flex items-center gap-1"
                        >
                          <FaCheck className="w-3 h-3" />
                          Copied
                        </motion.span>
                      ) : (
                        <motion.span
                          key="copy"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          className="flex items-center gap-1"
                        >
                          <FaCopy className="w-3 h-3" />
                          Copy
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </button>
                </div>
                <SyntaxHighlighter
                  style={vscDarkPlus}
                  language={match[1]}
                  PreTag="div"
                  className="rounded-b-lg"
                  {...props}
                >
                  {codeString}
                </SyntaxHighlighter>
              </div>
            ) : (
              <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono text-gray-900" {...props}>
                {children}
              </code>
            );
          },
          // Tables
          table({ children }) {
            return (
              <div className="overflow-x-auto my-4">
                <table className="min-w-full border-collapse border border-gray-300">
                  {children}
                </table>
              </div>
            );
          },
          th({ children }) {
            return (
              <th className="border border-gray-300 px-4 py-2 bg-gray-100 font-semibold text-left text-gray-900">
                {children}
              </th>
            );
          },
          td({ children }) {
            return (
              <td className="border border-gray-300 px-4 py-2 text-gray-700">
                {children}
              </td>
            );
          },
          // Lists
          ul({ children }) {
            return <ul className="list-disc list-inside my-2 space-y-1">{children}</ul>;
          },
          ol({ children }) {
            return <ol className="list-decimal list-inside my-2 space-y-1">{children}</ol>;
          },
          // List items - also need citation support
          li({ children }) {
            const processedChildren = React.Children.map(children, (child) => {
              if (typeof child === 'string') {
                return processCitations(child);
              }
              return child;
            });
            return <li className="text-gray-700">{processedChildren}</li>;
          },
          // Headings
          h1({ children }) {
            return <h1 className="text-2xl font-bold mt-4 mb-2">{children}</h1>;
          },
          h2({ children }) {
            return <h2 className="text-xl font-bold mt-3 mb-2">{children}</h2>;
          },
          h3({ children }) {
            return <h3 className="text-lg font-semibold mt-2 mb-1">{children}</h3>;
          },
          // Paragraphs with citation support
          p({ children }) {
            // Process children to replace [1], [2] with clickable citations
            const processedChildren = React.Children.map(children, (child) => {
              if (typeof child === 'string') {
                return processCitations(child);
              }
              return child;
            });
            
            return <p className="my-2 leading-relaxed">{processedChildren}</p>;
          },
          // Strong/bold text - also need citation support
          strong({ children }) {
            const processedChildren = React.Children.map(children, (child) => {
              if (typeof child === 'string') {
                return processCitations(child);
              }
              return child;
            });
            return <strong className="font-semibold text-gray-900">{processedChildren}</strong>;
          },
          // Emphasis/italic - also need citation support
          em({ children }) {
            const processedChildren = React.Children.map(children, (child) => {
              if (typeof child === 'string') {
                return processCitations(child);
              }
              return child;
            });
            return <em className="italic">{processedChildren}</em>;
          },
          // Blockquotes
          blockquote({ children }) {
            return (
              <blockquote className="border-l-4 border-teal-500 pl-4 my-2 italic text-gray-600 bg-teal-50 py-2 rounded-r">
                {children}
              </blockquote>
            );
          },
        }}
      >
          {rawContent}
        </ReactMarkdown>
      </div>
    </>
  );
}
