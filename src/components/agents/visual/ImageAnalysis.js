// src/components/agents/visual/ImageAnalysis.js
// Image analysis results display component

'use client';

import { motion } from 'framer-motion';
import { FaTags, FaImage, FaInfoCircle, FaSearch } from 'react-icons/fa';

export default function ImageAnalysis({ results, imageUrl, loading }) {
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

  const { tags, description, categories, extractedData, similarImages } = results;

  return (
    <div className="space-y-6">
      {/* Image with Analysis Overlay */}
      {imageUrl && (
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
              src={imageUrl}
              alt="Analyzed"
              className="max-w-full rounded-lg border border-gray-200 shadow-lg"
            />
          </div>
        </motion.div>
      )}

      {/* Description */}
      {description && (
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
          <p className="text-gray-700">{description}</p>
        </motion.div>
      )}

      {/* Tags */}
      {tags && tags.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl p-6 border border-gray-200"
        >
          <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FaTags className="text-indigo-600" />
            Auto-Generated Tags ({tags.length})
          </h4>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag, idx) => (
              <span
                key={idx}
                className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium"
              >
                {tag}
              </span>
            ))}
          </div>
        </motion.div>
      )}

      {/* Categories */}
      {categories && categories.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl p-6 border border-gray-200"
        >
          <h4 className="text-xl font-bold text-gray-900 mb-4">Categories</h4>
          <div className="flex flex-wrap gap-2">
            {categories.map((category, idx) => (
              <span
                key={idx}
                className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg text-sm font-semibold"
              >
                {category}
              </span>
            ))}
          </div>
        </motion.div>
      )}

      {/* Extracted Data */}
      {extractedData && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl p-6 border border-gray-200"
        >
          <h4 className="text-xl font-bold text-gray-900 mb-4">Extracted Data</h4>
          <div className="bg-gray-50 rounded-lg p-4">
            <pre className="text-sm text-gray-700 whitespace-pre-wrap">
              {typeof extractedData === 'string' ? extractedData : JSON.stringify(extractedData, null, 2)}
            </pre>
          </div>
        </motion.div>
      )}

      {/* Similar Images */}
      {similarImages && similarImages.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl p-6 border border-gray-200"
        >
          <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FaSearch className="text-indigo-600" />
            Similar Images
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {similarImages.map((img, idx) => (
              <div key={idx} className="rounded-lg overflow-hidden border border-gray-200">
                <img
                  src={img.url || img}
                  alt={`Similar ${idx + 1}`}
                  className="w-full h-32 object-cover"
                />
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}

