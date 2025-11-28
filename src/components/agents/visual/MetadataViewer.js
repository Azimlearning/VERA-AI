// src/components/agents/visual/MetadataViewer.js
// Metadata viewer component for Visual Agent

'use client';

import { motion } from 'framer-motion';
import { FaInfoCircle, FaCamera, FaCalendar, FaRuler, FaPalette } from 'react-icons/fa';

export default function MetadataViewer({ metadata, imageUrl }) {
  if (!metadata && !imageUrl) return null;

  // Extract color palette from image (simplified - in production, use a library)
  const extractColors = (imageUrl) => {
    // This is a placeholder - in production, you'd use a library like vibrant.js
    // or call an API to extract dominant colors
    return ['#4F46E5', '#7C3AED', '#EC4899', '#F59E0B', '#10B981'];
  };

  const colors = imageUrl ? extractColors(imageUrl) : [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl p-6 border border-gray-200 space-y-4"
    >
      <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <FaInfoCircle className="text-indigo-600" />
        Image Metadata
      </h4>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* File Information */}
        {metadata?.fileSize && (
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <FaRuler className="text-gray-500" />
              <span className="text-sm font-semibold text-gray-700">File Size</span>
            </div>
            <p className="text-lg font-bold text-gray-900">
              {(metadata.fileSize / 1024).toFixed(2)} KB
            </p>
          </div>
        )}

        {metadata?.dimensions && (
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <FaRuler className="text-gray-500" />
              <span className="text-sm font-semibold text-gray-700">Dimensions</span>
            </div>
            <p className="text-lg font-bold text-gray-900">
              {metadata.dimensions.width} × {metadata.dimensions.height} px
            </p>
          </div>
        )}

        {metadata?.format && (
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <FaCamera className="text-gray-500" />
              <span className="text-sm font-semibold text-gray-700">Format</span>
            </div>
            <p className="text-lg font-bold text-gray-900 uppercase">{metadata.format}</p>
          </div>
        )}

        {metadata?.timestamp && (
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <FaCalendar className="text-gray-500" />
              <span className="text-sm font-semibold text-gray-700">Timestamp</span>
            </div>
            <p className="text-sm font-medium text-gray-900">
              {new Date(metadata.timestamp).toLocaleString()}
            </p>
          </div>
        )}
      </div>

      {/* Color Palette */}
      {colors.length > 0 && (
        <div className="mt-4">
          <div className="flex items-center gap-2 mb-3">
            <FaPalette className="text-gray-500" />
            <span className="text-sm font-semibold text-gray-700">Dominant Colors</span>
          </div>
          <div className="flex gap-2">
            {colors.map((color, idx) => (
              <div
                key={idx}
                className="flex-1 h-16 rounded-lg border border-gray-200 shadow-sm"
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
          <div className="flex gap-2 mt-2">
            {colors.map((color, idx) => (
              <span
                key={idx}
                className="text-xs text-gray-600 font-mono px-2 py-1 bg-gray-50 rounded"
              >
                {color}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* EXIF Data */}
      {metadata?.exif && Object.keys(metadata.exif).length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <h5 className="text-sm font-semibold text-gray-700 mb-2">EXIF Data</h5>
          <div className="space-y-1 text-xs">
            {Object.entries(metadata.exif).map(([key, value]) => (
              <div key={key} className="flex justify-between">
                <span className="text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                <span className="text-gray-900 font-medium">{String(value)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}

