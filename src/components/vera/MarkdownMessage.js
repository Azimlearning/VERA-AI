// src/components/vera/MarkdownMessage.js
'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { FaCopy, FaCheck } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * MarkdownMessage Component
 * 
 * Renders markdown content with syntax highlighting for code blocks
 * Includes copy button for code blocks
 */
export default function MarkdownMessage({ content, isStreaming = false, streamingText = '' }) {
  const [copiedCodeBlock, setCopiedCodeBlock] = useState(null);

  const handleCopyCode = async (code, index) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCodeBlock(index);
      setTimeout(() => setCopiedCodeBlock(null), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  // Use streaming text if provided, otherwise use full content
  const displayContent = isStreaming && streamingText ? streamingText : (content || '');

  return (
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
          // Paragraphs
          p({ children }) {
            return <p className="my-2 leading-relaxed">{children}</p>;
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
        {displayContent}
      </ReactMarkdown>
    </div>
  );
}

