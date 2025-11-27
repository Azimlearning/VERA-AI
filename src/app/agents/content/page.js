// src/app/agents/content/page.js
// Content Agent Try Page - Interactive content/image generation experience

'use client';

import { useState } from 'react';
import TryPageLayout from '../../../components/agents/TryPageLayout';
import PromptInput from '../../../components/agents/content/PromptInput';
import ContentDisplay from '../../../components/agents/content/ContentDisplay';
import ResultsDisplay from '../../../components/agents/ResultsDisplay';
import FullVersionCTA from '../../../components/agents/FullVersionCTA';
import { FaFileAlt } from 'react-icons/fa';
import { db } from '../../../lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';

export default function ContentAgentTryPage() {
  const [prompt, setPrompt] = useState(null);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handlePromptSet = (promptText, generationType) => {
    setPrompt({ prompt: promptText, type: generationType });
    setResults(null);
    setError(null);
  };

  const handleGenerate = async (promptText, generationType, referenceImage) => {
    setLoading(true);
    setError(null);
    setResults(null);

    try {
      // Use submitStory flow - creates Firestore document which triggers analyzeStorySubmission
      // The local Python service (local_image_generator.py) will then generate the image
      const submitStoryUrl = 'https://submitstory-el2jwxb5bq-uc.a.run.app';
      
      // Create FormData for multipart/form-data (submitStory expects this format)
      const formData = new FormData();
      formData.append('storyTitle', promptText.substring(0, 100));
      formData.append('story', promptText);
      formData.append('keyShifts[]', 'Digital Transformation');
      formData.append('focusAreas[]', 'Innovation');
      formData.append('name', 'Try Page User');
      formData.append('department', 'Testing');
      formData.append('acknowledgement', 'true');

      const response = await fetch(submitStoryUrl, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Failed to submit story: ${errorData || response.statusText}`);
      }

      const data = await response.json();
      const storyId = data.storyId || data.id;

      if (!storyId) {
        throw new Error('No story ID returned from submission');
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
            
            // Update results when we have something
            if (contentReady || imageReady) {
              setResults({
                content: content || null,
                imageUrl: imageUrl || null
              });
              
              // If both are ready, stop listening and clear timeout
              if (contentReady && imageReady) {
                if (timeoutId) clearTimeout(timeoutId);
                unsubscribe();
                setLoading(false);
              } else if (hasContent && !contentReady) {
                // Still waiting for content
                setLoading(true);
              } else if (hasImage && !imageReady) {
                // Content ready, but still waiting for image
                setLoading(true);
              } else {
                // Everything we need is ready
                if (timeoutId) clearTimeout(timeoutId);
                unsubscribe();
                setLoading(false);
              }
            }
          }
        },
        (error) => {
          console.error('Firestore listener error:', error);
          setError(`Failed to monitor generation: ${error.message}`);
          if (timeoutId) clearTimeout(timeoutId);
          unsubscribe();
          setLoading(false);
        }
      );

      // Set a timeout to stop listening after 2 minutes
      timeoutId = setTimeout(() => {
        unsubscribe();
        // Show whatever we have (content or partial results)
        setResults({
          content: content || (hasContent ? 'Content generation is taking longer than expected. Please check back later.' : null),
          imageUrl: imageUrl || null
        });
        setLoading(false);
      }, 120000); // 2 minutes
      
    } catch (err) {
      console.error('Content generation error:', err);
      setError(err.message || 'Failed to generate content. Please try again.');
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!results) return;
    
    if (results.content) {
      const blob = new Blob([results.content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `generated-content-${Date.now()}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <TryPageLayout
      agentName="Content Agent"
      agentBadge={{
        bg: 'bg-green-100',
        border: 'border-green-300',
        iconColor: 'text-green-600',
        textColor: 'text-green-700'
      }}
      agentIcon={FaFileAlt}
      agentColor="green"
      agentGradient="from-green-400 to-emerald-500"
      description="AI-powered content and image generation. Create stories, articles, and visuals in Systemic Shifts style using AI."
      fullVersionLink="/nexushub/dropbox"
    >
      <div className="space-y-8">
        {/* Prompt Input Section */}
        <PromptInput
          onPromptSet={handlePromptSet}
          onGenerate={handleGenerate}
        />

        {/* Results Section */}
        {prompt && (
          <ResultsDisplay
            title="Generated Content"
            loading={loading}
            error={error}
            onDownload={handleDownload}
            downloadLabel="Download Content"
          >
            {results && (
              <ContentDisplay
                content={results.content}
                imageUrl={results.imageUrl}
              />
            )}
          </ResultsDisplay>
        )}

        {/* Full Version CTA */}
        <FullVersionCTA
          href="/nexushub/dropbox"
          agentName="Content Agent"
        />
      </div>
    </TryPageLayout>
  );
}
