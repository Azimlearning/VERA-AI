// src/components/agents/visual/InsightsPanel.js
// AI-powered insights panel for Visual Agent

'use client';

import { motion } from 'framer-motion';
import { FaLightbulb, FaCheckCircle, FaExclamationTriangle, FaShieldAlt, FaChartLine } from 'react-icons/fa';

export default function InsightsPanel({ analysis, tags = [] }) {
  if (!analysis) return null;

  // Generate insights based on analysis data
  const generateInsights = () => {
    const insights = [];
    const recommendations = [];
    const risks = [];
    let complianceStatus = 'unknown';

    // Check for HSE/compliance keywords
    const hseKeywords = ['hse', 'safety', 'compliance', 'risk', 'hazard'];
    const hasHSE = tags.some(tag => 
      hseKeywords.some(keyword => tag.toLowerCase().includes(keyword))
    );

    if (hasHSE) {
      complianceStatus = 'review';
      insights.push({
        type: 'compliance',
        icon: FaShieldAlt,
        title: 'HSE Compliance Detected',
        message: 'This image appears to contain HSE-related content. Review for compliance with safety standards.',
        color: 'blue'
      });
    }

    // Check for equipment/infrastructure
    const equipmentKeywords = ['equipment', 'vessel', 'infrastructure', 'facility'];
    const hasEquipment = tags.some(tag =>
      equipmentKeywords.some(keyword => tag.toLowerCase().includes(keyword))
    );

    if (hasEquipment) {
      recommendations.push({
        type: 'maintenance',
        title: 'Equipment Documentation',
        message: 'Consider documenting this equipment in your asset management system.',
        priority: 'medium'
      });
    }

    // Check for operational content
    const operationalKeywords = ['operation', 'offshore', 'vessel', 'deployment'];
    const hasOperational = tags.some(tag =>
      operationalKeywords.some(keyword => tag.toLowerCase().includes(keyword))
    );

    if (hasOperational) {
      insights.push({
        type: 'operational',
        icon: FaChartLine,
        title: 'Operational Context',
        message: 'This image relates to operational activities. Consider linking to related operational reports.',
        color: 'green'
      });
    }

    // OCR text insights
    if (analysis.ocrText && analysis.ocrText.length > 100) {
      insights.push({
        type: 'text',
        icon: FaCheckCircle,
        title: 'Text-Rich Document',
        message: 'Significant text content detected. Consider extracting and indexing this content for searchability.',
        color: 'indigo'
      });
    }

    // Category-based insights
    if (analysis.category === 'Infographics') {
      recommendations.push({
        type: 'content',
        title: 'Infographic Content',
        message: 'This infographic could be used in presentations or documentation. Consider adding to content library.',
        priority: 'low'
      });
    }

    return { insights, recommendations, risks, complianceStatus };
  };

  const { insights, recommendations, risks, complianceStatus } = generateInsights();

  if (insights.length === 0 && recommendations.length === 0) {
    return null;
  }

  const statusColors = {
    compliant: 'bg-green-100 text-green-700 border-green-200',
    review: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    nonCompliant: 'bg-red-100 text-red-700 border-red-200',
    unknown: 'bg-gray-100 text-gray-700 border-gray-200'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-200 space-y-4"
    >
      <div className="flex items-center gap-2 mb-4">
        <FaLightbulb className="text-amber-600 text-2xl" />
        <h4 className="text-xl font-bold text-gray-900">AI-Powered Insights</h4>
      </div>

      {/* Compliance Status */}
      {complianceStatus !== 'unknown' && (
        <div className={`rounded-lg p-4 border ${statusColors[complianceStatus]}`}>
          <div className="flex items-center gap-2">
            <FaShieldAlt className="text-lg" />
            <span className="font-semibold">Compliance Status: {complianceStatus.charAt(0).toUpperCase() + complianceStatus.slice(1)}</span>
          </div>
        </div>
      )}

      {/* Insights */}
      {insights.length > 0 && (
        <div>
          <h5 className="text-sm font-semibold text-gray-700 mb-3">Key Insights</h5>
          <div className="space-y-3">
            {insights.map((insight, idx) => {
              const Icon = insight.icon || FaInfoCircle;
              const colorClasses = {
                blue: 'bg-blue-100 text-blue-700 border-blue-200',
                green: 'bg-green-100 text-green-700 border-green-200',
                indigo: 'bg-indigo-100 text-indigo-700 border-indigo-200',
                yellow: 'bg-yellow-100 text-yellow-700 border-yellow-200'
              };

              return (
                <div
                  key={idx}
                  className={`rounded-lg p-3 border ${colorClasses[insight.color] || 'bg-gray-100 text-gray-700'}`}
                >
                  <div className="flex items-start gap-2">
                    <Icon className="mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-semibold text-sm mb-1">{insight.title}</div>
                      <div className="text-xs">{insight.message}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div>
          <h5 className="text-sm font-semibold text-gray-700 mb-3">Recommendations</h5>
          <div className="space-y-2">
            {recommendations.map((rec, idx) => (
              <div
                key={idx}
                className="bg-white rounded-lg p-3 border border-gray-200"
              >
                <div className="flex items-start gap-2">
                  <FaCheckCircle className="text-green-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="font-semibold text-sm text-gray-900 mb-1">{rec.title}</div>
                    <div className="text-xs text-gray-600">{rec.message}</div>
                    {rec.priority && (
                      <span className={`inline-block mt-2 px-2 py-0.5 rounded text-xs ${
                        rec.priority === 'high' ? 'bg-red-100 text-red-700' :
                        rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {rec.priority} priority
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}

