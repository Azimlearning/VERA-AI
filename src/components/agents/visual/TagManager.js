// src/components/agents/visual/TagManager.js
// Tag management component for Visual Agent

'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaTags, FaPlus, FaTimes, FaEdit } from 'react-icons/fa';

export default function TagManager({ tags: initialTags = [], onTagsChange, readOnly = false }) {
  const [tags, setTags] = useState(initialTags);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [newTag, setNewTag] = useState('');

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      const updatedTags = [...tags, newTag.trim()];
      setTags(updatedTags);
      setNewTag('');
      if (onTagsChange) onTagsChange(updatedTags);
    }
  };

  const handleRemoveTag = (index) => {
    const updatedTags = tags.filter((_, i) => i !== index);
    setTags(updatedTags);
    if (onTagsChange) onTagsChange(updatedTags);
  };

  const handleStartEdit = (index) => {
    setEditingIndex(index);
    setEditValue(tags[index]);
  };

  const handleSaveEdit = () => {
    if (editValue.trim() && !tags.includes(editValue.trim())) {
      const updatedTags = [...tags];
      updatedTags[editingIndex] = editValue.trim();
      setTags(updatedTags);
      setEditingIndex(null);
      setEditValue('');
      if (onTagsChange) onTagsChange(updatedTags);
    }
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditValue('');
  };

  // Color-code tags by category
  const getTagColor = (tag) => {
    const tagLower = tag.toLowerCase();
    if (tagLower.includes('hse') || tagLower.includes('safety') || tagLower.includes('compliance')) {
      return 'red';
    } else if (tagLower.includes('operation') || tagLower.includes('vessel') || tagLower.includes('offshore')) {
      return 'blue';
    } else if (tagLower.includes('equipment') || tagLower.includes('infrastructure')) {
      return 'green';
    } else if (tagLower.includes('petronas') || tagLower.includes('company')) {
      return 'purple';
    }
    return 'indigo';
  };

  const colorClasses = {
    indigo: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    red: 'bg-red-100 text-red-700 border-red-200',
    blue: 'bg-blue-100 text-blue-700 border-blue-200',
    green: 'bg-green-100 text-green-700 border-green-200',
    purple: 'bg-purple-100 text-purple-700 border-purple-200'
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {tags.map((tag, idx) => (
          <span
            key={idx}
            className={`px-3 py-1.5 ${colorClasses[getTagColor(tag)]} rounded-full text-sm font-medium border flex items-center gap-2`}
          >
            {editingIndex === idx ? (
              <input
                type="text"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={handleSaveEdit}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveEdit();
                  if (e.key === 'Escape') handleCancelEdit();
                }}
                className="bg-transparent border-none outline-none flex-1 min-w-[100px]"
                autoFocus
              />
            ) : (
              <>
                {tag}
                {!readOnly && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleStartEdit(idx)}
                      className="hover:opacity-70"
                      title="Edit tag"
                    >
                      <FaEdit className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleRemoveTag(idx)}
                      className="hover:opacity-70"
                      title="Remove tag"
                    >
                      <FaTimes className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </>
            )}
          </span>
        ))}
      </div>

      {!readOnly && (
        <div className="flex gap-2">
          <input
            type="text"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAddTag();
            }}
            placeholder="Add new tag..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            onClick={handleAddTag}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
          >
            <FaPlus className="w-4 h-4" />
            Add
          </button>
        </div>
      )}
    </div>
  );
}

