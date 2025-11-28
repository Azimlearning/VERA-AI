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
      
      // For data URLs, we need to upload to a temporary location first
      // OR use the Cloud Function API which can handle data URLs
      // For now, we'll use the Cloud Function API for all cases
      let finalImageUrl = imageUrlToAnalyze;
      
      // If it's a data URL, we need to handle it differently
      // The Cloud Function expects a URL, so we might need to upload it first
      // For simplicity, let's use the analyzeImage Cloud Function which should handle this
      if (imageUrlToAnalyze.startsWith('data:')) {
        // Try to use the Cloud Function - it may need to handle data URLs
        // If not supported, we'll need to upload first
        // For now, let's use the API route which will handle the upload
        const response = await fetch('/api/analyzeImage', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            imageUrl: imageUrlToAnalyze,
            mode: 'single'
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Failed to analyze image' }));
          throw new Error(errorData.error || `Server error: ${response.status}`);
        }

        const data = await response.json();

        if (data.success && data.analysis) {
          setResults({
            tags: data.analysis.tags || [],
            description: data.analysis.description || '',
            categories: data.analysis.category ? [data.analysis.category] : [],
            extractedData: data.analysis.ocrText || null
          });
        } else {
          throw new Error(data.error || 'Failed to analyze image');
        }
      } else {
        // Use Cloud Function API for regular URLs
        const response = await fetch('/api/analyzeImage', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            imageUrl: finalImageUrl,
            mode: 'single'
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Failed to analyze image' }));
          throw new Error(errorData.error || `Server error: ${response.status}`);
        }

        const data = await response.json();

        if (data.success && data.analysis) {
          setResults({
            tags: data.analysis.tags || [],
            description: data.analysis.description || '',
            categories: data.analysis.category ? [data.analysis.category] : [],
            extractedData: data.analysis.ocrText || null
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
