// src/components/vera/ArtifactPanel.js
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaCircle, FaCopy, FaDownload, FaFile, FaSearch, FaFileAlt } from 'react-icons/fa';
import AnalysisResults from '../agents/analytics/AnalysisResults';
import ContentDisplay from '../agents/content/ContentDisplay';
import MeetingAnalysis from '../agents/meetings/MeetingAnalysis';
import ScriptDisplay from '../agents/podcast/ScriptDisplay';
import QuizPreview from '../agents/quiz/QuizPreview';
import VisualAnalysis from '../agents/visual/VisualAnalysis';

// Map agent IDs to their display components
const AGENT_COMPONENTS = {
  'analytics': AnalysisResults,
  'content': ContentDisplay,
  'meetings': MeetingAnalysis,
  'podcast': ScriptDisplay,
  'quiz': QuizPreview,
  'visual': VisualAnalysis,
};

// Document titles for each agent type
const getDocumentTitle = (agentId) => {
  const titles = {
    'analytics': 'Data Analysis Report',
    'content': 'Generated Content',
    'meetings': 'Meeting Analysis',
    'podcast': 'Podcast Script',
    'quiz': 'Quiz Preview',
    'visual': 'Image Analysis'
  };
  return titles[agentId] || 'Document';
};

export default function ArtifactPanel({ isOpen, agent, data, isStreaming, onClose }) {
  const [copied, setCopied] = useState(false);
  const [audioDuration, setAudioDuration] = useState(null);

  if (!isOpen || !agent) return null;

  const AgentComponent = AGENT_COMPONENTS[agent.id];
  const isPodcast = agent.id === 'podcast';
  const isQuiz = agent.id === 'quiz';
  const isVisual = agent.id === 'visual';
  const podcastAudioUrl = isPodcast && data ? data.audioUrl : null;
  const quizTitle = isQuiz && data ? (data.title || 'Quiz Preview') : null;
  
  // Debug logging
  if (isPodcast) {
    console.log('[ArtifactPanel] Podcast data:', { 
      isPodcast, 
      data, 
      audioUrl: data?.audioUrl,
      hasScript: !!data?.script 
    });
  }

  // Determine what data to pass to the component based on agent type
  const getComponentProps = () => {
    if (!data) return { loading: true };

    switch (agent.id) {
      case 'analytics':
        return { results: data, loading: isStreaming };
      case 'content':
        return { 
          content: data.content || data, 
          imageUrl: data.imageUrl,
          loading: isStreaming 
        };
      case 'meetings':
        return { 
          results: data, 
          loading: isStreaming,
          meetingTitle: data._meetingTitle || 'Meeting Analysis',
          meetingContent: data._meetingContent || ''
        };
      case 'podcast':
        return { 
          script: data.script || data, 
          audioUrl: data.audioUrl,
          loading: isStreaming,
          onDownloadAudio: handleDownloadAudio
        };
      case 'quiz':
        return { quiz: data, loading: isStreaming };
      case 'visual':
        return { results: data, loading: isStreaming };
      default:
        return { loading: isStreaming };
    }
  };

  const handleDownloadAudio = () => {
    if (!podcastAudioUrl) return;
    
    fetch(podcastAudioUrl)
      .then(response => response.blob())
      .then(blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `podcast-audio-${Date.now()}.mp3`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      })
      .catch(error => {
        console.error('Error downloading audio:', error);
        window.open(podcastAudioUrl, '_blank');
      });
  };

  const handleAudioLoaded = (e) => {
    const audio = e.target;
    if (audio.duration) {
      const minutes = Math.floor(audio.duration / 60);
      const seconds = Math.floor(audio.duration % 60);
      setAudioDuration(`${minutes}:${seconds.toString().padStart(2, '0')}`);
    }
  };

  const handleCopy = async () => {
    if (!data) return;
    
    let textToCopy = '';
    if (typeof data === 'string') {
      textToCopy = data;
    } else if (agent.id === 'podcast' && data.script) {
      textToCopy = typeof data.script === 'string' ? data.script : JSON.stringify(data.script, null, 2);
    } else if (agent.id === 'content' && data.content) {
      textToCopy = data.content;
    } else {
      textToCopy = JSON.stringify(data, null, 2);
    }

    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleDownload = () => {
    if (!data) return;
    
    let content = '';
    let filename = '';
    let mimeType = 'text/plain';

    if (agent.id === 'podcast' && data.script) {
      content = typeof data.script === 'string' ? data.script : JSON.stringify(data.script, null, 2);
      filename = `podcast-script-${Date.now()}.txt`;
    } else if (agent.id === 'content' && data.content) {
      content = data.content;
      filename = `generated-content-${Date.now()}.txt`;
    } else if (typeof data === 'string') {
      content = data;
      filename = `document-${Date.now()}.txt`;
    } else {
      content = JSON.stringify(data, null, 2);
      filename = `document-${Date.now()}.json`;
      mimeType = 'application/json';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Visual Agent specific handlers
  const handleExtractText = async () => {
    if (!data || !isVisual) return;
    
    const analysis = data.analysis || data;
    let textToExtract = '';
    
    if (analysis.ocrText) {
      textToExtract = analysis.ocrText;
    } else if (analysis.description) {
      textToExtract = analysis.description;
    } else {
      textToExtract = 'No extractable text found in this image analysis.';
    }

    try {
      await navigator.clipboard.writeText(textToExtract);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      
      // Also offer download
      const blob = new Blob([textToExtract], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `extracted-text-${Date.now()}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to extract text:', err);
    }
  };

  const handleSimilarSearch = () => {
    if (!data || !isVisual) return;
    
    const analysis = data.analysis || data;
    const tags = analysis.tags || [];
    
    if (tags.length === 0) {
      alert('No tags available for search. Please analyze the image first.');
      return;
    }

    // Create a search query from tags
    const searchQuery = tags.slice(0, 5).join(' ');
    
    // Open knowledge base search in new tab or trigger search
    // For now, show an alert with the search terms
    // In production, this would integrate with the knowledge base search
    alert(`Searching knowledge base for: ${searchQuery}\n\nThis will search for related documents, images, and content matching these tags.`);
    
    // TODO: Integrate with actual knowledge base search API
    // window.open(`/knowledge-base?q=${encodeURIComponent(searchQuery)}`, '_blank');
  };

  const handleExportPDF = async () => {
    if (!data || !isVisual) return;
    
    const analysis = data.analysis || data;
    
    // Create HTML content for PDF
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Image Analysis Report</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .image-container { text-align: center; margin: 20px 0; }
            .image-container img { max-width: 100%; height: auto; }
            .section { margin: 20px 0; }
            .section h3 { color: #4F46E5; border-bottom: 2px solid #4F46E5; padding-bottom: 5px; }
            .tags { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px; }
            .tag { background: #E0E7FF; color: #4338CA; padding: 4px 12px; border-radius: 12px; font-size: 12px; }
            .metadata { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 10px; }
            .metadata-item { background: #F9FAFB; padding: 10px; border-radius: 4px; }
            .metadata-label { font-size: 11px; color: #6B7280; text-transform: uppercase; }
            .metadata-value { font-size: 14px; color: #111827; font-weight: 500; margin-top: 4px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Image Analysis Report</h1>
            <p>Generated on ${new Date().toLocaleString()}</p>
          </div>
          
          ${analysis.imageUrl ? `
            <div class="image-container">
              <img src="${analysis.imageUrl}" alt="Analyzed Image" />
            </div>
          ` : ''}
          
          ${analysis.description ? `
            <div class="section">
              <h3>AI Summary</h3>
              <p>${analysis.description}</p>
            </div>
          ` : ''}
          
          ${analysis.category ? `
            <div class="section">
              <h3>Category</h3>
              <p>${analysis.category}</p>
            </div>
          ` : ''}
          
          ${analysis.tags && analysis.tags.length > 0 ? `
            <div class="section">
              <h3>Detected Tags (${analysis.tags.length})</h3>
              <div class="tags">
                ${analysis.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
              </div>
            </div>
          ` : ''}
          
          ${analysis.ocrText ? `
            <div class="section">
              <h3>Extracted Text (OCR)</h3>
              <pre style="background: #F9FAFB; padding: 15px; border-radius: 4px; white-space: pre-wrap;">${analysis.ocrText}</pre>
            </div>
          ` : ''}
          
          <div class="section">
            <h3>Analysis Metadata</h3>
            <div class="metadata">
              <div class="metadata-item">
                <div class="metadata-label">Analysis Mode</div>
                <div class="metadata-value">${data.mode || 'single'}</div>
              </div>
              ${analysis.ocrLanguage ? `
                <div class="metadata-item">
                  <div class="metadata-label">Detected Language</div>
                  <div class="metadata-value">${analysis.ocrLanguage}</div>
                </div>
              ` : ''}
            </div>
          </div>
        </body>
      </html>
    `;

    // Create blob and download
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `image-analysis-report-${Date.now()}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    // Note: For actual PDF generation, you would use a library like jsPDF or call a server-side API
    // This creates an HTML file that can be printed to PDF by the user
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="workspace-panel"
        >
          {/* Header - Sticky Toolbar */}
          <div className="panel-header">
            <div className="header-left">
              <span className="doc-icon">{isPodcast ? '🎙️' : isQuiz ? '❓' : '📄'}</span>
              <span className="doc-title">
                {isPodcast ? 'Systemic Shifts Podcast' : quizTitle || getDocumentTitle(agent.id)}
              </span>
              {isStreaming && (
                <motion.div
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="flex items-center gap-2 ml-3"
                >
                  <FaCircle className="w-2 h-2 text-green-500" />
                  <span className="text-xs text-gray-500">Generating...</span>
                </motion.div>
              )}
            </div>
            
            <div className="header-right">
              {/* Visual Agent specific actions */}
              {isVisual && data && (
                <>
                  <button
                    onClick={handleExtractText}
                    className="icon-btn"
                    title="Extract Text (OCR)"
                    disabled={isStreaming}
                  >
                    <FaFile className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleSimilarSearch}
                    className="icon-btn"
                    title="Find Similar (Knowledge Base)"
                    disabled={isStreaming}
                  >
                    <FaSearch className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleExportPDF}
                    className="icon-btn"
                    title="Export PDF Report"
                    disabled={isStreaming}
                  >
                    <FaFileAlt className="w-4 h-4" />
                  </button>
                </>
              )}
              {/* Standard actions */}
              <button
                onClick={handleCopy}
                className="icon-btn"
                title="Copy Text"
                disabled={!data || isStreaming}
              >
                <FaCopy className="w-4 h-4" />
              </button>
              <button
                onClick={handleDownload}
                className="icon-btn"
                title="Download Text"
                disabled={!data || isStreaming}
              >
                <FaDownload className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                className="icon-btn close-btn"
                title="Close"
              >
                <FaTimes className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Content Area - The "Paper" */}
          <div className="panel-content">
            {AgentComponent ? (
              <AgentComponent {...getComponentProps()} />
            ) : (
              <div className="text-center text-gray-500">
                <p>No display component available for {agent.name}</p>
                {data && (
                  <pre className="mt-4 text-left bg-gray-50 p-4 rounded-lg overflow-auto">
                    {typeof data === 'string' ? data : JSON.stringify(data, null, 2)}
                  </pre>
                )}
              </div>
            )}
          </div>

          {/* Media Footer - Sticky Audio Player (Podcast) or Quiz Feedback (Quiz) */}
          {isPodcast && (
            <div className="panel-media-footer">
              {podcastAudioUrl ? (
                <>
                  <div className="audio-info">
                    <span className="audio-label">
                      Generated Audio {audioDuration && `(${audioDuration})`}
                    </span>
                    <button
                      onClick={handleDownloadAudio}
                      className="download-link"
                      title="Download MP3"
                    >
                      Download MP3
                    </button>
                  </div>
                  <audio
                    controls
                    className="custom-audio-player"
                    onLoadedMetadata={handleAudioLoaded}
                  >
                    <source src={podcastAudioUrl} type="audio/mpeg" />
                    Your browser does not support the audio element.
                  </audio>
                </>
              ) : (
                <div className="text-center text-gray-500 py-4">
                  {isStreaming ? (
                    <div className="flex items-center justify-center gap-2">
                      <FaCircle className="w-2 h-2 text-green-500 animate-pulse" />
                      <span>Audio is being generated...</span>
                    </div>
                  ) : (
                    <span>Audio will be available once generation completes.</span>
                  )}
                </div>
              )}
            </div>
          )}
          
        </motion.div>
      )}
    </AnimatePresence>
  );
}

