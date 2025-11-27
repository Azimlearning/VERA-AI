// src/app/agents/visual/page.js
// Visual Agent Try Page - Interactive image analysis experience

'use client';

import { useState } from 'react';
import TryPageLayout from '../../../components/agents/TryPageLayout';
import ImageUpload from '../../../components/agents/visual/ImageUpload';
import ImageAnalysis from '../../../components/agents/visual/ImageAnalysis';
import ResultsDisplay from '../../../components/agents/ResultsDisplay';
import FullVersionCTA from '../../../components/agents/FullVersionCTA';
import { FaImages } from 'react-icons/fa';
import { generateText, OPENROUTER_MODELS } from '../../../lib/openRouterClient';

export default function VisualAgentTryPage() {
  const [imageUrl, setImageUrl] = useState(null);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleImageLoaded = (loadedImageUrl, file) => {
    setImageUrl(loadedImageUrl);
    setResults(null);
    setError(null);
  };

  const handleAnalyze = async (imageUrlToAnalyze) => {
    setLoading(true);
    setError(null);
    setResults(null);

    try {
      // Convert data URL to blob if needed, or use existing Cloud Function
      let finalImageUrl = imageUrlToAnalyze;
      
      // If it's a data URL, we might need to upload it first
      // For now, we'll use the analyzeImage Cloud Function which expects a URL
      // We'll need to handle data URLs differently
      
      if (imageUrlToAnalyze.startsWith('data:')) {
        // For try page, we can analyze directly using OpenRouter with image input
        const analysisPrompt = `Analyze this image and provide:
1. A detailed description
2. Relevant tags (as a JSON array)
3. Suggested categories
4. Any data or text extracted from the image

Return the response as JSON with this structure:
{
  "description": "Detailed description of the image",
  "tags": ["tag1", "tag2", ...],
  "categories": ["category1", "category2"],
  "extractedData": "Any text or data visible in the image"
}`;

        const analysisResult = await generateText({
          prompt: analysisPrompt,
          model: OPENROUTER_MODELS.image.primary,
          images: [imageUrlToAnalyze],
          jsonMode: true
        });

        let parsedResults;
        try {
          const cleanedResult = analysisResult
            .replace(/```json\n?/g, '')
            .replace(/```\n?/g, '')
            .trim();
          parsedResults = JSON.parse(cleanedResult);
        } catch (parseError) {
          parsedResults = {
            description: analysisResult,
            tags: [],
            categories: [],
            extractedData: null
          };
        }

        setResults(parsedResults);
      } else {
        // Use existing Cloud Function
        const analyzeImageUrl = 'https://analyzeimage-el2jwxb5bq-uc.a.run.app';
        
        const response = await fetch(analyzeImageUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            imageUrl: finalImageUrl
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Failed to analyze image' }));
          throw new Error(errorData.error || `Server error: ${response.status}`);
        }

        const data = await response.json();

        if (data.status === 'ok') {
          setResults({
            tags: data.tags || [],
            description: data.description || '',
            categories: data.category ? [data.category] : [],
            extractedData: null
          });
        } else {
          throw new Error(data.error || 'Failed to analyze image');
        }
      }
    } catch (err) {
      console.error('Image analysis error:', err);
      setError(err.message || 'Failed to analyze image. Please try again.');
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
    a.download = `image-analysis-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <TryPageLayout
      agentName="Visual Agent"
      agentBadge={{
        bg: 'bg-indigo-100',
        border: 'border-indigo-300',
        iconColor: 'text-indigo-600',
        textColor: 'text-indigo-700'
      }}
      agentIcon={FaImages}
      agentColor="indigo"
      agentGradient="from-indigo-400 to-purple-500"
      description="AI-powered image analysis. Upload images to extract tags, analyze content, and get intelligent insights using AI vision capabilities."
      fullVersionLink="/nexushub/upg"
    >
      <div className="space-y-8">
        {/* Image Upload Section */}
        <ImageUpload
          onImageLoaded={handleImageLoaded}
          onAnalyze={handleAnalyze}
        />

        {/* Results Section */}
        {imageUrl && (
          <ResultsDisplay
            title="Image Analysis Results"
            loading={loading}
            error={error}
            onDownload={handleDownload}
            downloadLabel="Download Analysis"
          >
            {results && (
              <ImageAnalysis
                results={results}
                imageUrl={imageUrl}
              />
            )}
          </ResultsDisplay>
        )}

        {/* Full Version CTA */}
        <FullVersionCTA
          href="/nexushub/upg"
          agentName="Visual Agent"
        />
      </div>
    </TryPageLayout>
  );
}
