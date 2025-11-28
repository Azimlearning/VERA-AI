// src/components/agents/analytics/AnalysisResults.js
// Results display component for Analytics Agent

'use client';

import { motion } from 'framer-motion';
import { FaChartLine, FaLightbulb, FaExclamationTriangle, FaArrowUp } from 'react-icons/fa';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart } from 'recharts';

export default function AnalysisResults({ results, loading }) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!results) {
    return null;
  }

  const { insights, trends, anomalies, recommendations, charts = [] } = results;

  console.log('[AnalysisResults] Rendering with:', {
    hasInsights: !!insights,
    hasTrends: !!trends,
    hasAnomalies: !!anomalies,
    hasRecommendations: !!recommendations,
    chartsCount: charts?.length || 0,
    charts: charts
  });

  return (
    <div className="space-y-8">
      {/* Key Insights */}
      {insights && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-50 rounded-lg p-6 border border-blue-100"
        >
          <div className="flex items-center gap-2 mb-4">
            <FaLightbulb className="text-blue-600 text-2xl" />
            <h4 className="text-xl font-bold text-gray-900">AI Insights</h4>
          </div>
          <div className="prose max-w-none">
            {typeof insights === 'string' ? (
              <p className="text-gray-700 whitespace-pre-wrap">{insights}</p>
            ) : (
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                {insights.map((insight, idx) => (
                  <li key={idx}>{insight}</li>
                ))}
              </ul>
            )}
          </div>
        </motion.div>
      )}

      {/* Charts */}
      {charts && charts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg p-6 border border-gray-200"
        >
          <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FaChartLine className="text-blue-600" />
            Data Visualization
          </h4>
          <div className="space-y-6">
            {charts.map((chart, idx) => {
              // Check if we have multiple series with very different scales
              const hasMultipleSeries = chart.series && chart.series.length > 1;
              let maxValues = {};
              let minValues = {};
              
              if (hasMultipleSeries && chart.data && chart.data.length > 0) {
                chart.series.forEach(series => {
                  const values = chart.data.map(d => d[series.dataKey]).filter(v => v != null && !isNaN(v));
                  if (values.length > 0) {
                    maxValues[series.dataKey] = Math.max(...values);
                    minValues[series.dataKey] = Math.min(...values);
                  }
                });
                
                // Check if there's a significant scale difference (more than 10x)
                const scales = Object.values(maxValues);
                const maxScale = Math.max(...scales);
                const minScale = Math.min(...scales);
                const hasScaleDifference = maxScale > 0 && minScale > 0 && (maxScale / minScale) > 10;
                
                console.log('[AnalysisResults] Chart scale analysis:', {
                  seriesCount: chart.series.length,
                  maxValues,
                  minValues,
                  hasScaleDifference,
                  ratio: maxScale / minScale
                });
              }
              
              return (
                <div key={idx} className="h-64">
                  {chart.type === 'line' && (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chart.data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis yAxisId="left" />
                        {hasMultipleSeries && Object.keys(maxValues).length > 1 && (
                          <YAxis yAxisId="right" orientation="right" />
                        )}
                        <Tooltip />
                        <Legend />
                        {chart.series.map((series, sIdx) => {
                          // Use right Y-axis for smaller values if scale difference is large
                          const useRightAxis = hasMultipleSeries && maxValues[series.dataKey] && 
                            maxValues[series.dataKey] < Math.max(...Object.values(maxValues)) / 10;
                          
                          return (
                            <Line
                              key={sIdx}
                              yAxisId={useRightAxis ? "right" : "left"}
                              type="monotone"
                              dataKey={series.dataKey}
                              stroke={series.color || '#3b82f6'}
                              name={series.name}
                              dot={{ r: 3 }}
                            />
                          );
                        })}
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                  {chart.type === 'bar' && (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chart.data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        {chart.series.map((series, sIdx) => (
                          <Bar
                            key={sIdx}
                            dataKey={series.dataKey}
                            fill={series.color || '#3b82f6'}
                            name={series.name}
                          />
                        ))}
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Trends */}
      {trends && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg p-6 border border-gray-200"
        >
          <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FaArrowUp className="text-green-600" />
            Trend Analysis
          </h4>
          <div className="prose max-w-none">
            {typeof trends === 'string' ? (
              <p className="text-gray-700 whitespace-pre-wrap">{trends}</p>
            ) : (
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                {trends.map((trend, idx) => (
                  <li key={idx}>{trend}</li>
                ))}
              </ul>
            )}
          </div>
        </motion.div>
      )}

      {/* Anomalies */}
      {anomalies && anomalies.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-yellow-50 rounded-lg p-6 border border-yellow-200"
        >
          <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FaExclamationTriangle className="text-yellow-600" />
            Anomalies Detected
          </h4>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            {anomalies.map((anomaly, idx) => (
              <li key={idx}>{anomaly}</li>
            ))}
          </ul>
        </motion.div>
      )}

      {/* Recommendations */}
      {recommendations && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-teal-50 rounded-lg p-6 border border-teal-200"
        >
          <h4 className="text-xl font-bold text-gray-900 mb-4">Recommendations</h4>
          <div className="prose max-w-none">
            {typeof recommendations === 'string' ? (
              <p className="text-gray-700 whitespace-pre-wrap">{recommendations}</p>
            ) : (
              <ol className="list-decimal list-inside space-y-2 text-gray-700">
                {recommendations.map((rec, idx) => (
                  <li key={idx}>{rec}</li>
                ))}
              </ol>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}

