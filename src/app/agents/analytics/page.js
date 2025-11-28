// src/app/agents/analytics/page.js
// Analytics Agent Try Page - Interactive data analysis experience

'use client';

import { useState } from 'react';
import TryPageLayout from '../../../components/agents/TryPageLayout';
import DataInput from '../../../components/agents/analytics/DataInput';
import AnalysisResults from '../../../components/agents/analytics/AnalysisResults';
import ResultsDisplay from '../../../components/agents/ResultsDisplay';
import { FaChartLine } from 'react-icons/fa';

export default function AnalyticsAgentTryPage() {
  const [data, setData] = useState(null);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleDataLoaded = (loadedData) => {
    setData(loadedData);
    setResults(null);
    setError(null);
  };

  const handleAnalyze = async (dataToAnalyze, dataType) => {
    setLoading(true);
    setError(null);
    setResults(null);

    try {
      // Call backend function to get RAG context and analyze data
      const response = await fetch('/api/analyzeData', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: typeof dataToAnalyze === 'string' ? dataToAnalyze : JSON.stringify(dataToAnalyze, null, 2),
          dataType: dataType
        })
      });

      if (!response.ok) {
        throw new Error('Failed to analyze data');
      }

      const result = await response.json();
      const parsedResults = result.analysis;

      // Generate simple chart data if we have time series data
      let charts = [];
      if (typeof dataToAnalyze === 'string') {
        // Try to parse CSV or extract time series
        const lines = dataToAnalyze.split('\n').filter(l => l.trim());
        if (lines.length > 1) {
          const headers = lines[0].split(',').map(h => h.trim());
          const dateIndex = headers.findIndex(h => h.toLowerCase().includes('date'));
          const valueIndex = headers.findIndex(h => h.toLowerCase().includes('value') || h.toLowerCase().includes('metric'));
          
          if (dateIndex >= 0 && valueIndex >= 0) {
            const chartData = lines.slice(1, Math.min(31, lines.length)).map(line => {
              const values = line.split(',');
              return {
                date: values[dateIndex]?.trim() || '',
                value: parseFloat(values[valueIndex]?.trim()) || 0
              };
            }).filter(d => d.date && !isNaN(d.value));
            
            if (chartData.length > 0) {
              charts.push({
                type: 'line',
                data: chartData,
                series: [{ dataKey: 'value', name: 'Value', color: '#3b82f6' }]
              });
            }
          }
        }
      }

      setResults({
        ...parsedResults,
        charts
      });
    } catch (err) {
      console.error('Analysis error:', err);
      setError(err.message || 'Failed to analyze data. Please try again.');
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
    a.download = `analytics-analysis-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <TryPageLayout
      agentName="Analytics Agent"
      agentBadge={{
        bg: 'bg-blue-100',
        border: 'border-blue-300',
        iconColor: 'text-blue-600',
        textColor: 'text-blue-700'
      }}
      agentIcon={FaChartLine}
      agentColor="blue"
      agentGradient="from-blue-400 to-cyan-500"
      description="AI-powered data analysis and insights. Upload your data or use samples to see how AI can extract meaningful patterns, trends, and recommendations."
    >
      <div className="space-y-8">
        {/* Data Input Section */}
        <DataInput
          onDataLoaded={handleDataLoaded}
          onAnalyze={handleAnalyze}
        />

        {/* Results Section */}
        {data && (
          <ResultsDisplay
            title="Analysis Results"
            loading={loading}
            error={error}
            onDownload={handleDownload}
            downloadLabel="Download Analysis"
          >
            {results && <AnalysisResults results={results} />}
          </ResultsDisplay>
        )}
      </div>
    </TryPageLayout>
  );
}
