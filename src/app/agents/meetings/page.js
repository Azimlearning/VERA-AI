// src/app/agents/meetings/page.js
// Meetings Agent Try Page - Interactive meeting analysis experience

'use client';

import { useState } from 'react';
import TryPageLayout from '../../../components/agents/TryPageLayout';
import TranscriptInput from '../../../components/agents/meetings/TranscriptInput';
import MeetingAnalysis from '../../../components/agents/meetings/MeetingAnalysis';
import ResultsDisplay from '../../../components/agents/ResultsDisplay';
import { FaUsers } from 'react-icons/fa';

export default function MeetingsAgentTryPage() {
  const [transcript, setTranscript] = useState(null);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [meetingTitle, setMeetingTitle] = useState(null);

  const handleTranscriptLoaded = (loadedTranscript) => {
    setTranscript(loadedTranscript);
    setResults(null);
    setError(null);
    
    // Extract title from transcript if possible
    const lines = loadedTranscript.split('\n').filter(l => l.trim());
    if (lines.length > 0) {
      const firstLine = lines[0].trim();
      // If first line looks like a title (short, no punctuation at end, or contains keywords)
      if (firstLine.length < 100 && (
        firstLine.toLowerCase().includes('meeting') ||
        firstLine.toLowerCase().includes('notes') ||
        firstLine.toLowerCase().includes('transcript') ||
        !firstLine.match(/[.!?]$/)
      )) {
        setMeetingTitle(firstLine);
      } else {
        setMeetingTitle(loadedTranscript.substring(0, 50).trim());
      }
    } else {
      setMeetingTitle(loadedTranscript.substring(0, 50).trim());
    }
  };

  const handleAnalyze = async (transcriptToAnalyze) => {
    setLoading(true);
    setError(null);
    setResults(null);

    try {
      // Extract title from transcript if not already set
      let title = meetingTitle;
      if (!title) {
        const lines = transcriptToAnalyze.split('\n').filter(l => l.trim());
        if (lines.length > 0) {
          const firstLine = lines[0].trim();
          if (firstLine.length < 100 && (
            firstLine.toLowerCase().includes('meeting') ||
            firstLine.toLowerCase().includes('notes') ||
            firstLine.toLowerCase().includes('transcript') ||
            !firstLine.match(/[.!?]$/)
          )) {
            title = firstLine;
          } else {
            title = transcriptToAnalyze.substring(0, 50).trim();
          }
        } else {
          title = transcriptToAnalyze.substring(0, 50).trim();
        }
      }

      // Call Cloud Function API for meeting analysis with RAG
      const response = await fetch('/api/analyzeMeeting', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: transcriptToAnalyze,
          title: title
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to analyze meeting' }));
        throw new Error(errorData.error || errorData.message || `Server error: ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.analysis) {
        // Store title with results for save to KB functionality
        setResults({
          ...data.analysis,
          _meetingTitle: title,
          _meetingContent: transcriptToAnalyze
        });
        setMeetingTitle(title);
      } else {
        throw new Error(data.error || 'Failed to analyze meeting');
      }
    } catch (err) {
      console.error('Analysis error:', err);
      setError(err.message || 'Failed to analyze meeting. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!results) return;
    
    const content = JSON.stringify(results, null, 2);
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `meeting-analysis-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <TryPageLayout
      agentName="Meetings Agent"
      agentBadge={{
        bg: 'bg-purple-100',
        border: 'border-purple-300',
        iconColor: 'text-purple-600',
        textColor: 'text-purple-700'
      }}
      agentIcon={FaUsers}
      agentColor="purple"
      agentGradient="from-purple-400 to-pink-500"
      description="AI-powered meeting analysis. Upload or paste meeting transcripts to extract action items, identify decisions, and detect alignment issues."
    >
      <div className="space-y-8">
        {/* Transcript Input Section */}
        <TranscriptInput
          onTranscriptLoaded={handleTranscriptLoaded}
          onAnalyze={handleAnalyze}
        />

        {/* Results Section */}
        {transcript && (
          <ResultsDisplay
            title="Meeting Analysis Results"
            loading={loading}
            error={error}
            onDownload={handleDownload}
            downloadLabel="Download Analysis"
          >
            {results && (
              <MeetingAnalysis 
                results={results} 
                meetingTitle={results._meetingTitle || meetingTitle}
                meetingContent={results._meetingContent || transcript}
              />
            )}
          </ResultsDisplay>
        )}
      </div>
    </TryPageLayout>
  );
}
