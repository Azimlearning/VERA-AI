/**
 * Reference Manager
 * 
 * Manages source references for inline citations
 * Implements the citation system as specified in the technical documentation
 */

class ReferenceManager {
  constructor() {
    this.references = {};
    this.nextId = 1;
  }

  /**
   * Add a reference and return its unique ID
   * @param {Object} refData - Reference data
   * @returns {string} Reference ID (e.g., "ref1")
   */
  add(refData) {
    const id = `ref${this.nextId++}`;
    this.references[id] = {
      id,
      source_type: refData.source_type || 'knowledge_base',
      title: refData.title || 'Untitled',
      url: refData.sourceUrl || refData.url || null,
      category: refData.category || null,
      similarity: refData.similarity || null,
      contentPreview: refData.contentPreview || refData.content?.substring(0, 100) || '',
      timestamp: new Date().toISOString(),
      ...refData
    };
    return id;
  }

  /**
   * Get a reference by ID
   * @param {string} id - Reference ID
   * @returns {Object|null} Reference data or null if not found
   */
  get(id) {
    return this.references[id] || null;
  }

  /**
   * Get all references
   * @returns {Array} Array of reference objects
   */
  list() {
    return Object.values(this.references);
  }

  /**
   * Get references in order of their IDs
   * @returns {Array} Sorted array of reference objects
   */
  getOrderedList() {
    return Object.values(this.references).sort((a, b) => {
      const aNum = parseInt(a.id.replace('ref', ''));
      const bNum = parseInt(b.id.replace('ref', ''));
      return aNum - bNum;
    });
  }

  /**
   * Check if a reference ID exists
   * @param {string} id - Reference ID
   * @returns {boolean}
   */
  has(id) {
    return id in this.references;
  }

  /**
   * Clear all references
   */
  clear() {
    this.references = {};
    this.nextId = 1;
  }

  /**
   * Get count of references
   * @returns {number}
   */
  count() {
    return Object.keys(this.references).length;
  }
}

module.exports = { ReferenceManager };

