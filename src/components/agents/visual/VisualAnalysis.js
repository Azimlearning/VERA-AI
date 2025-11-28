// src/components/agents/visual/VisualAnalysis.js
// Enhanced visual analysis results display component for Visual Agent

'use client';

import { motion } from 'framer-motion';
import { FaTags, FaImage, FaInfoCircle, FaSearch, FaCopy, FaCheckCircle, FaExclamationTriangle, FaEye } from 'react-icons/fa';
import TagManager from './TagManager';
import MetadataViewer from './MetadataViewer';
import InsightsPanel from './InsightsPanel';

export default function VisualAnalysis({ results, loading }) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!results) {
    return null;
  }

  // Handle different response structures
  const analysis = results.analysis || results;
  const mode = results.mode || 'single';

  // Single image analysis
  if (mode === 'single' || (!mode && analysis.tags)) {
    return (
      <div className="space-y-6">
        {/* Image Preview */}
        {analysis.imageUrl && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl p-6 border border-gray-200"
          >
            <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FaImage className="text-indigo-600" />
              Analyzed Image
            </h4>
            <div className="flex justify-center">
              <img
                src={analysis.imageUrl}
                alt="Analyzed"
                className="max-w-full max-h-96 rounded-lg border border-gray-200 shadow-lg object-contain"
              />
            </div>
          </motion.div>
        )}

        {/* Description */}
        {analysis.description && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-200"
          >
            <div className="flex items-center gap-2 mb-4">
              <FaInfoCircle className="text-indigo-600 text-2xl" />
              <h4 className="text-xl font-bold text-gray-900">Image Description</h4>
            </div>
            <p className="text-gray-700">{analysis.description}</p>
          </motion.div>
        )}

        {/* Tags with Management */}
        {analysis.tags && analysis.tags.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl p-6 border border-gray-200"
          >
            <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FaTags className="text-indigo-600" />
              Auto-Generated Tags ({analysis.tags.length})
            </h4>
            <TagManager 
              tags={analysis.tags} 
              readOnly={true}
            />
          </motion.div>
        )}

        {/* AI-Powered Insights */}
        <InsightsPanel 
          analysis={analysis}
          tags={analysis.tags || []}
        />

        {/* Metadata Viewer */}
        <MetadataViewer 
          metadata={analysis.metadata}
          imageUrl={analysis.imageUrl}
        />

        {/* Category */}
        {analysis.category && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl p-6 border border-gray-200"
          >
            <h4 className="text-xl font-bold text-gray-900 mb-4">Category</h4>
            <span className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg text-sm font-semibold inline-block">
              {analysis.category}
            </span>
          </motion.div>
        )}

        {/* OCR Text */}
        {analysis.ocrText && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl p-6 border border-gray-200"
          >
            <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FaCopy className="text-indigo-600" />
              Extracted Text (OCR)
            </h4>
            {analysis.ocrLanguage && analysis.ocrLanguage !== 'unknown' && (
              <p className="text-sm text-gray-500 mb-2">Detected Language: {analysis.ocrLanguage}</p>
            )}
            <div className="bg-gray-50 rounded-lg p-4">
              <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans">
                {analysis.ocrText}
              </pre>
            </div>
            {analysis.ocrLines && analysis.ocrLines.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-semibold text-gray-700 mb-2">Lines ({analysis.ocrLines.length}):</p>
                <div className="space-y-1">
                  {analysis.ocrLines.map((line, idx) => (
                    <div key={idx} className="text-sm text-gray-600 bg-white p-2 rounded border-l-2 border-indigo-300">
                      {line}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Similar Images */}
        {analysis.similarImages && analysis.similarImages.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-xl p-6 border border-gray-200"
          >
            <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FaSearch className="text-indigo-600" />
              Similar Images ({analysis.similarImages.length})
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {analysis.similarImages.map((img, idx) => (
                <div key={idx} className="rounded-lg overflow-hidden border border-gray-200">
                  <img
                    src={typeof img === 'string' ? img : (img.url || img.imageUrl)}
                    alt={`Similar ${idx + 1}`}
                    className="w-full h-32 object-cover"
                  />
                  {typeof img === 'object' && img.similarity && (
                    <div className="p-2 bg-gray-50 text-xs text-gray-600">
                      Similarity: {(img.similarity * 100).toFixed(1)}%
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    );
  }

  // Batch processing results
  if (mode === 'batch' && analysis.images) {
    return (
      <div className="space-y-6">
        {/* Summary */}
        {analysis.summary && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-200"
          >
            <h4 className="text-xl font-bold text-gray-900 mb-4">Batch Processing Summary</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-2xl font-bold text-indigo-600">{analysis.summary.totalImages}</p>
                <p className="text-sm text-gray-600">Total Images</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">{analysis.summary.successful}</p>
                <p className="text-sm text-gray-600">Successful</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-red-600">{analysis.summary.failed}</p>
                <p className="text-sm text-gray-600">Failed</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-600">{analysis.summary.categories?.length || 0}</p>
                <p className="text-sm text-gray-600">Categories</p>
              </div>
            </div>
            {analysis.summary.commonTags && analysis.summary.commonTags.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-semibold text-gray-700 mb-2">Common Tags:</p>
                <div className="flex flex-wrap gap-2">
                  {analysis.summary.commonTags.map((tag, idx) => (
                    <span key={idx} className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Individual Image Results */}
        <div className="space-y-4">
          {analysis.images.map((imgResult, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`bg-white rounded-xl p-6 border ${imgResult.success ? 'border-gray-200' : 'border-red-200'}`}
            >
              <div className="flex items-start gap-4">
                {imgResult.imageUrl && (
                  <img
                    src={imgResult.imageUrl}
                    alt={`Image ${idx + 1}`}
                    className="w-32 h-32 object-cover rounded-lg border border-gray-200"
                  />
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {imgResult.success ? (
                      <FaCheckCircle className="text-green-600" />
                    ) : (
                      <FaExclamationTriangle className="text-red-600" />
                    )}
                    <h5 className="font-bold text-gray-900">Image {idx + 1}</h5>
                  </div>
                  {imgResult.success ? (
                    <>
                      {imgResult.description && (
                        <p className="text-sm text-gray-600 mb-2">{imgResult.description}</p>
                      )}
                      {imgResult.category && (
                        <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 rounded-lg text-xs font-semibold mr-2 mb-2">
                          {imgResult.category}
                        </span>
                      )}
                      {imgResult.tags && imgResult.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {imgResult.tags.map((tag, tagIdx) => (
                            <span key={tagIdx} className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="text-sm text-red-600">{imgResult.error || 'Failed to analyze'}</p>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  // Comparison results
  if (mode === 'compare' && analysis.comparison) {
    const comp = analysis.comparison;
    return (
      <div className="space-y-6">
        {/* Images Side by Side */}
        <div className="grid md:grid-cols-2 gap-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-xl p-4 border border-gray-200"
          >
            <h5 className="font-bold text-gray-900 mb-2">Image 1</h5>
            {analysis.imageUrl1 && (
              <img
                src={analysis.imageUrl1}
                alt="Image 1"
                className="w-full rounded-lg border border-gray-200"
              />
            )}
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-xl p-4 border border-gray-200"
          >
            <h5 className="font-bold text-gray-900 mb-2">Image 2</h5>
            {analysis.imageUrl2 && (
              <img
                src={analysis.imageUrl2}
                alt="Image 2"
                className="w-full rounded-lg border border-gray-200"
              />
            )}
          </motion.div>
        </div>

        {/* Similarity Score */}
        {comp.similarityScore !== undefined && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-200"
          >
            <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FaEye className="text-indigo-600" />
              Similarity Score
            </h4>
            <div className="flex items-center gap-4">
              <div className="text-4xl font-bold text-indigo-600">{comp.similarityScore}</div>
              <div className="flex-1">
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div
                    className="bg-indigo-600 h-4 rounded-full transition-all duration-500"
                    style={{ width: `${comp.similarityScore}%` }}
                  />
                </div>
              </div>
              <div className="text-sm text-gray-600">/ 100</div>
            </div>
          </motion.div>
        )}

        {/* Differences */}
        {comp.differences && comp.differences.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl p-6 border border-red-200"
          >
            <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FaExclamationTriangle className="text-red-600" />
              Key Differences ({comp.differences.length})
            </h4>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              {comp.differences.map((diff, idx) => (
                <li key={idx}>{diff}</li>
              ))}
            </ul>
          </motion.div>
        )}

        {/* Similarities */}
        {comp.similarities && comp.similarities.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl p-6 border border-green-200"
          >
            <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FaCheckCircle className="text-green-600" />
              Similarities ({comp.similarities.length})
            </h4>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              {comp.similarities.map((sim, idx) => (
                <li key={idx}>{sim}</li>
              ))}
            </ul>
          </motion.div>
        )}

        {/* Analysis */}
        {comp.analysis && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-200"
          >
            <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FaInfoCircle className="text-indigo-600" />
              Detailed Analysis
            </h4>
            <p className="text-gray-700 whitespace-pre-wrap">{comp.analysis}</p>
          </motion.div>
        )}
      </div>
    );
  }

  // Fallback for unknown format - Enhanced UI instead of raw JSON
  return (
    <div className="space-y-6">
      {/* Image Preview if available */}
      {(results.imageUrl || analysis.imageUrl) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-6 border border-gray-200"
        >
          <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FaImage className="text-indigo-600" />
            Analyzed Image
          </h4>
          <div className="flex justify-center bg-gray-50 rounded-lg p-4">
            <img
              src={results.imageUrl || analysis.imageUrl}
              alt="Analyzed"
              className="max-w-full max-h-96 rounded-lg border border-gray-200 shadow-lg object-contain"
            />
          </div>
        </motion.div>
      )}

      {/* Summary Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-200"
      >
        <div className="flex items-center gap-2 mb-4">
          <FaInfoCircle className="text-indigo-600 text-2xl" />
          <h4 className="text-xl font-bold text-gray-900">AI Summary</h4>
        </div>
        {analysis.description ? (
          <p className="text-gray-700 leading-relaxed">{analysis.description}</p>
        ) : (
          <p className="text-gray-600 italic">Analysis completed. View details below.</p>
        )}
      </motion.div>

      {/* Metadata Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Category */}
        {analysis.category && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl p-6 border border-gray-200"
          >
            <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Category</h4>
            <span className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg text-sm font-semibold inline-block">
              {analysis.category}
            </span>
          </motion.div>
        )}

        {/* Tags Count */}
        {analysis.tags && analysis.tags.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl p-6 border border-gray-200"
          >
            <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Detected Tags</h4>
            <p className="text-2xl font-bold text-indigo-600">{analysis.tags.length}</p>
            <p className="text-xs text-gray-500 mt-1">tags identified</p>
          </motion.div>
        )}
      </div>

      {/* Tags Display */}
      {analysis.tags && analysis.tags.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl p-6 border border-gray-200"
        >
          <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FaTags className="text-indigo-600" />
            Auto-Generated Tags
          </h4>
          <div className="flex flex-wrap gap-2">
            {analysis.tags.map((tag, idx) => {
              // Color-code tags by category
              const tagLower = tag.toLowerCase();
              let tagColor = 'indigo';
              if (tagLower.includes('hse') || tagLower.includes('safety') || tagLower.includes('compliance')) {
                tagColor = 'red';
              } else if (tagLower.includes('operation') || tagLower.includes('vessel') || tagLower.includes('offshore')) {
                tagColor = 'blue';
              } else if (tagLower.includes('equipment') || tagLower.includes('infrastructure')) {
                tagColor = 'green';
              } else if (tagLower.includes('petronas') || tagLower.includes('company')) {
                tagColor = 'purple';
              }

              const colorClasses = {
                indigo: 'bg-indigo-100 text-indigo-700 border-indigo-200',
                red: 'bg-red-100 text-red-700 border-red-200',
                blue: 'bg-blue-100 text-blue-700 border-blue-200',
                green: 'bg-green-100 text-green-700 border-green-200',
                purple: 'bg-purple-100 text-purple-700 border-purple-200'
              };

              return (
                <span
                  key={idx}
                  className={`px-3 py-1.5 ${colorClasses[tagColor]} rounded-full text-sm font-medium border`}
                >
                  {tag}
                </span>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Raw Data Section (Collapsible) - Only show if there's additional data */}
      {Object.keys(results).length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gray-50 rounded-xl p-4 border border-gray-200"
        >
          <details className="cursor-pointer">
            <summary className="text-sm font-semibold text-gray-600 hover:text-gray-900">
              View Raw Analysis Data
            </summary>
            <pre className="mt-3 text-xs bg-white p-4 rounded border border-gray-200 overflow-auto max-h-64">
              {JSON.stringify(results, null, 2)}
            </pre>
          </details>
        </motion.div>
      )}
    </div>
  );
}

