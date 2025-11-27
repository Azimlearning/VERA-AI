// src/app/agents/meetings/page.js
// Meetings Agent Try Page - Interactive meeting analysis experience

'use client';

import { useState } from 'react';
import TryPageLayout from '../../../components/agents/TryPageLayout';
import TranscriptInput from '../../../components/agents/meetings/TranscriptInput';
import MeetingAnalysis from '../../../components/agents/meetings/MeetingAnalysis';
import ResultsDisplay from '../../../components/agents/ResultsDisplay';
import FullVersionCTA from '../../../components/agents/FullVersionCTA';
import { FaUsers } from 'react-icons/fa';
import { generateText, OPENROUTER_MODELS } from '../../../lib/openRouterClient';

export default function MeetingsAgentTryPage() {
  const [transcript, setTranscript] = useState(null);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleTranscriptLoaded = (loadedTranscript) => {
    setTranscript(loadedTranscript);
    setResults(null);
    setError(null);
  };

  const handleAnalyze = async (transcriptToAnalyze) => {
    setLoading(true);
    setError(null);
    setResults(null);

    try {
      // Prepare the analysis prompt
      const analysisPrompt = `You are an expert meeting analyst. Analyze the following meeting transcript and extract key information.

Meeting Transcript:
${transcriptToAnalyze}

Please provide a comprehensive analysis in JSON format with the following structure:
{
  "summary": "A concise summary of the meeting (2-3 paragraphs)",
  "decisions": ["List of key decisions made during the meeting"],
  "actionItems": [
    {
      "task": "Task description",
      "owner": "Owner name or null if not mentioned",
      "dueDate": "Due date or null if not mentioned",
      "status": "Status or null if not mentioned"
    }
  ],
  "zombieTasks": ["List of action items missing owner or due date"],
  "alignmentWarnings": [
    {
      "type": "Warning type (e.g., 'Conflict', 'Contradiction')",
      "message": "Detailed warning message"
    }
  ]
}

Focus on:
1. Clear, actionable summary
2. All decisions and outcomes
3. Complete action items with owners and due dates
4. Identify zombie tasks (missing critical info)
5. Check for any contradictions or alignment issues

If information is missing, use null. Be thorough and accurate.`;

      // Call OpenRouter API
      const analysisResult = await generateText({
        prompt: analysisPrompt,
        model: OPENROUTER_MODELS.textOutput.primary,
        jsonMode: true
      });

      // Parse the JSON response
      let parsedResults;
      try {
        const cleanedResult = analysisResult
          .replace(/```json\n?/g, '')
          .replace(/```\n?/g, '')
          .trim();
        parsedResults = JSON.parse(cleanedResult);
      } catch (parseError) {
        // If JSON parsing fails, create a basic structure
        parsedResults = {
          summary: analysisResult,
          decisions: [],
          actionItems: [],
          zombieTasks: [],
          alignmentWarnings: []
        };
      }

      setResults(parsedResults);
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
      fullVersionLink="/meetx"
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
            {results && <MeetingAnalysis results={results} />}
          </ResultsDisplay>
        )}

        {/* Full Version CTA */}
        <FullVersionCTA
          href="/meetx"
          agentName="Meetings Agent"
        />
      </div>
    </TryPageLayout>
  );
}
