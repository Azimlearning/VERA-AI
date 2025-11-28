// src/app/agents/podcast/page.js
// Podcast Agent Try Page - Interactive podcast generation experience

'use client';

import { useState } from 'react';
import TryPageLayout from '../../../components/agents/TryPageLayout';
import TopicInput from '../../../components/agents/podcast/TopicInput';
import ScriptDisplay from '../../../components/agents/podcast/ScriptDisplay';
import ResultsDisplay from '../../../components/agents/ResultsDisplay';
import { FaPodcast } from 'react-icons/fa';
import { generateText, OPENROUTER_MODELS } from '../../../lib/openRouterClient';

export default function PodcastAgentTryPage() {
  const [topic, setTopic] = useState(null);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleTopicSelected = (selectedTopic, content) => {
    setTopic({ topic: selectedTopic, content });
    setResults(null);
    setError(null);
  };

  const handleGenerate = async (selectedTopic, content) => {
    setLoading(true);
    setError(null);
    setResults(null);

    try {
      // Use existing Cloud Function for podcast generation
      const generatePodcastUrl = 'https://generatepodcast-el2jwxb5bq-uc.a.run.app';
      
      const response = await fetch(generatePodcastUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic: selectedTopic,
          context: content || undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to generate podcast' }));
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.podcast) {
        setResults({
          script: data.podcast,
          audioUrl: data.audioUrl || null
        });
      } else {
        throw new Error(data.error || 'Failed to generate podcast');
      }
    } catch (err) {
      console.error('Podcast generation error:', err);
      setError(err.message || 'Failed to generate podcast. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!results) return;
    
    const content = typeof results.script === 'string' 
      ? results.script 
      : JSON.stringify(results.script, null, 2);
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `podcast-script-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <TryPageLayout
      agentName="Podcast Agent"
      agentBadge={{
        bg: 'bg-orange-100',
        border: 'border-orange-300',
        iconColor: 'text-orange-600',
        textColor: 'text-orange-700'
      }}
      agentIcon={FaPodcast}
      agentColor="orange"
      agentGradient="from-orange-400 to-red-500"
      description="AI-powered podcast generation. Select a topic from the knowledge base or provide your own content to generate a formatted talk-style podcast script."
    >
      <div className="space-y-8">
        {/* Topic Input Section */}
        <TopicInput
          onTopicSelected={handleTopicSelected}
          onGenerate={handleGenerate}
        />

        {/* Results Section */}
        {topic && (
          <ResultsDisplay
            title="Generated Podcast"
            loading={loading}
            error={error}
            onDownload={handleDownload}
            downloadLabel="Download Script"
          >
            {results && (
              <ScriptDisplay
                script={results.script}
                audioUrl={results.audioUrl}
              />
            )}
          </ResultsDisplay>
        )}
      </div>
    </TryPageLayout>
  );
}
