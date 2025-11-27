// src/components/agents/analytics/AnalysisResults.js
// Results display component for Analytics Agent

'use client';

import { motion } from 'framer-motion';
import { FaChartLine, FaLightbulb, FaExclamationTriangle, FaArrowUp } from 'react-icons/fa';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

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

  const { insights, trends, anomalies, recommendations, charts } = results;

  return (
    <div className="space-y-6">
      {/* Key Insights */}
      {insights && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-200"
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
          className="bg-white rounded-xl p-6 border border-gray-200"
        >
          <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FaChartLine className="text-blue-600" />
            Data Visualization
          </h4>
          <div className="space-y-6">
            {charts.map((chart, idx) => (
              <div key={idx} className="h-64">
                {chart.type === 'line' && (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chart.data}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      {chart.series.map((series, sIdx) => (
                        <Line
                          key={sIdx}
                          type="monotone"
                          dataKey={series.dataKey}
                          stroke={series.color || '#3b82f6'}
                          name={series.name}
                        />
                      ))}
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
            ))}
          </div>
        </motion.div>
      )}

      {/* Trends */}
      {trends && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl p-6 border border-gray-200"
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
          className="bg-yellow-50 rounded-xl p-6 border border-yellow-200"
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
          className="bg-teal-50 rounded-xl p-6 border border-teal-200"
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

