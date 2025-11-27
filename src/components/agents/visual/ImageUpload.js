// src/components/agents/visual/ImageUpload.js
// Image upload component for Visual Agent

'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { FaUpload, FaImage, FaTimes } from 'react-icons/fa';
import SampleDataButton from '../SampleDataButton';

export default function ImageUpload({ onImageLoaded, onAnalyze }) {
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target.result);
      onImageLoaded && onImageLoaded(e.target.result, file);
    };
    reader.readAsDataURL(file);
  };

  const handleLoadSample = async () => {
    // Use a sample image URL or create a placeholder
    const sampleImageUrl = '/images/sample-image.jpg'; // You can add a sample image to public/images
    setImageUrl(sampleImageUrl);
    setImagePreview(sampleImageUrl);
    onImageLoaded && onImageLoaded(sampleImageUrl, null);
  };

  const handleAnalyze = async () => {
    if (!imageFile && !imageUrl) {
      alert('Please upload an image or use sample');
      return;
    }

    // If we have a file, we need to upload it first to get a URL
    let urlToAnalyze = imageUrl;
    
    if (imageFile) {
      // For try page, we can use the data URL directly or upload to temporary storage
      // For simplicity, we'll use the data URL
      urlToAnalyze = imagePreview;
    }

    onAnalyze && onAnalyze(urlToAnalyze);
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setImageUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 md:p-8">
      <h3 className="text-2xl font-bold text-gray-900 mb-4">Upload Image for Analysis</h3>
      
      {/* Sample Button */}
      <div className="mb-6">
        <SampleDataButton
          onClick={handleLoadSample}
          label="Try with Sample Image"
        />
      </div>

      {/* File Upload */}
      <div className="mb-6">
        <label className="block mb-2">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-indigo-400 transition-colors cursor-pointer">
            <FaUpload className="text-4xl text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">Click to upload or drag and drop</p>
            <p className="text-sm text-gray-500">Image files (JPG, PNG, GIF, etc.)</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        </label>
        {imageFile && (
          <div className="flex items-center gap-2 mt-2">
            <FaImage className="text-indigo-600" />
            <span className="text-sm text-gray-700">{imageFile.name}</span>
            <button
              onClick={clearImage}
              className="ml-auto text-red-600 hover:text-red-700"
            >
              <FaTimes />
            </button>
          </div>
        )}
      </div>

      {/* Image Preview */}
      {imagePreview && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-6 flex justify-center"
        >
          <img
            src={imagePreview}
            alt="Preview"
            className="max-w-full max-h-64 rounded-lg border border-gray-200 shadow-md"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        </motion.div>
      )}

      {/* Analyze Button */}
      <button
        onClick={handleAnalyze}
        disabled={!imageFile && !imageUrl}
        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        <FaImage />
        <span>Analyze Image with AI</span>
      </button>
    </div>
  );
}

