/**
 * Prompt Helpers
 * 
 * Utility functions for prompt engineering:
 * - RAG context formatting
 * - Context compression
 * - Dynamic example generation
 * - Query type classification
 * - Output format validation
 */

/**
 * Format RAG context with similarity scores and metadata
 */
function formatRAGContext(retrievedDocs, options = {}) {
  const {
    maxTokens = 800,
    includeSimilarity = true,
    includeSource = true,
    includeCategory = false
  } = options;

  if (!retrievedDocs || retrievedDocs.length === 0) {
    return '';
  }

  let context = '=== RELEVANT KNOWLEDGE BASE INFORMATION (PRIORITY SOURCE) ===\n\n';
  const approxCharsPerToken = 4;
  const maxChars = maxTokens * approxCharsPerToken;
  let currentLength = context.length;
  let docsIncluded = 0;

  for (let i = 0; i < retrievedDocs.length; i++) {
    const doc = retrievedDocs[i];
    
    // Build document header
    let docHeader = `Document ${i + 1}: ${doc.title || 'Untitled'}`;
    
    if (includeSimilarity && doc.similarity !== undefined) {
      docHeader += ` [Similarity: ${(doc.similarity * 100).toFixed(1)}%]`;
    }
    
    if (includeCategory && doc.category) {
      docHeader += ` [Category: ${doc.category}]`;
    }
    
    docHeader += '\n';
    
    const headerLength = docHeader.length;
    const footerLength = includeSource ? `\nSource: ${doc.sourceUrl || doc.source || 'Internal Knowledge Base'}\n\n`.length : '\n\n'.length;
    
    // Check if we have space for this document
    if (currentLength + headerLength + footerLength >= maxChars) {
      break;
    }
    
    context += docHeader;
    currentLength += headerLength;
    
    // Add content (truncate if needed)
    const remainingChars = maxChars - currentLength - footerLength;
    const docContent = (doc.content || '').substring(0, remainingChars);
    
    context += docContent;
    currentLength += docContent.length;
    
    if (docContent.length < (doc.content || '').length) {
      context += '...\n';
    }
    
    if (includeSource) {
      context += `\nSource: ${doc.sourceUrl || doc.source || 'Internal Knowledge Base'}`;
    }
    
    context += '\n\n';
    currentLength += footerLength;
    docsIncluded++;
  }

  context += '=== END KNOWLEDGE BASE INFORMATION ===';
  
  return {
    context: context.trim(),
    docsIncluded,
    totalDocs: retrievedDocs.length
  };
}

/**
 * Compress context while preserving key information
 */
function compressContext(text, maxLength, preserveKeywords = []) {
  if (!text || text.length <= maxLength) {
    return text;
  }

  // Split into sentences
  const sentences = text.split(/[.!?]\s+/);
  
  // Score sentences by keyword presence and position
  const scoredSentences = sentences.map((sentence, idx) => {
    let score = 0;
    
    // Prioritize sentences with keywords
    preserveKeywords.forEach(keyword => {
      if (sentence.toLowerCase().includes(keyword.toLowerCase())) {
        score += 10;
      }
    });
    
    // Prioritize earlier sentences (usually more important)
    score += (sentences.length - idx) / sentences.length;
    
    // Prioritize longer sentences (usually more informative)
    score += sentence.length / 100;
    
    return { sentence, score, originalIndex: idx };
  });

  // Sort by score and take top sentences
  scoredSentences.sort((a, b) => b.score - a.score);
  
  let compressed = '';
  const selectedIndices = new Set();
  
  for (const { sentence, originalIndex } of scoredSentences) {
    if (compressed.length + sentence.length + 2 <= maxLength) {
      compressed += sentence + '. ';
      selectedIndices.add(originalIndex);
    } else {
      break;
    }
  }

  // If we have space, add remaining sentences in order
  if (compressed.length < maxLength * 0.8) {
    for (let i = 0; i < sentences.length; i++) {
      if (!selectedIndices.has(i) && compressed.length + sentences[i].length + 2 <= maxLength) {
        compressed += sentences[i] + '. ';
        selectedIndices.add(i);
      }
    }
  }

  if (compressed.length < text.length) {
    compressed += '...[context compressed]';
  }

  return compressed.trim();
}

/**
 * Classify query type for dynamic example selection
 */
function classifyQueryType(query) {
  if (!query || typeof query !== 'string') {
    return 'general';
  }

  const lowerQuery = query.toLowerCase();
  
  // Factual queries
  const factualPatterns = [
    /\b(what|who|when|where|which|how many|how much)\b/,
    /\b(define|explain|describe|tell me about)\b/,
    /\b(is|are|was|were|does|do|did)\b/
  ];
  
  // Analytical queries
  const analyticalPatterns = [
    /\b(analyze|analysis|compare|contrast|evaluate|assess)\b/,
    /\b(why|how|what causes|what leads to)\b/,
    /\b(trend|pattern|relationship|correlation)\b/
  ];
  
  // Creative queries
  const creativePatterns = [
    /\b(create|generate|design|suggest|recommend|propose|brainstorm)\b/,
    /\b(ideas|ideas for|ways to|how to improve)\b/
  ];

  if (factualPatterns.some(pattern => pattern.test(lowerQuery))) {
    return 'factual';
  }
  
  if (analyticalPatterns.some(pattern => pattern.test(lowerQuery))) {
    return 'analytical';
  }
  
  if (creativePatterns.some(pattern => pattern.test(lowerQuery))) {
    return 'creative';
  }

  return 'general';
}

/**
 * Generate dynamic few-shot examples based on query type
 */
function generateExamples(queryType, domain = 'petronas') {
  const examples = {
    factual: {
      petronas: `Question: "What are the key focus areas for Systemic Shift #8?"
Answer:
Systemic Shift #8, "Operate it Right," emphasizes operational discipline, cross-asset collaboration, and digital-enabled surveillance to keep assets safe and efficient. Teams focus on predictive maintenance and fast feedback loops to reduce downtime.

---
Suggestions:
- How does digital surveillance support Shift #8?
- Which teams lead Shift #8 initiatives?
- What metrics prove Shift #8 success?`
    },
    analytical: {
      petronas: `Question: "How does Portfolio High-Grading contribute to PETRONAS 2.0 goals?"
Answer:
Portfolio High-Grading is a strategic approach that focuses resources on the most valuable assets and opportunities. By prioritizing advantaged barrels and divesting non-core assets, PETRONAS can:
1. Improve capital efficiency and returns
2. Accelerate production growth in high-value areas
3. Reduce operational complexity and costs

This directly supports PETRONAS 2.0 by maximizing value creation and positioning the company for sustainable long-term growth.

---
Suggestions:
- What criteria determine an "advantaged barrel"?
- How is portfolio optimization measured?
- What are recent examples of high-grading success?`
    },
    creative: {
      petronas: `Question: "How can we improve cross-functional collaboration in upstream operations?"
Answer:
Based on successful practices in the industry and PETRONAS Upstream context, here are key strategies:

1. **Integrated Planning**: Establish cross-functional teams for major projects with clear ownership and shared KPIs
2. **Digital Platforms**: Leverage collaborative tools for real-time information sharing and decision-making
3. **Regular Forums**: Create structured forums (weekly standups, monthly reviews) for knowledge exchange
4. **Incentive Alignment**: Align performance metrics to reward collaborative outcomes, not just individual achievements

These approaches have proven effective in similar organizations and align with PETRONAS's Growth Mindset.

---
Suggestions:
- What tools support cross-functional collaboration?
- How do we measure collaboration effectiveness?
- What are examples of successful cross-functional projects?`
    },
    general: {
      petronas: `Question: "Tell me about the Systemic Shifts initiative."
Answer:
The Systemic Shifts initiative is PETRONAS Upstream's strategic transformation program aimed at achieving PETRONAS 2.0 by 2035. It focuses on two key shifts: Portfolio High-Grading and Deliver Advantaged Barrels, supported by three critical mindsets: More Risk Tolerant, Commercial Savvy, and Growth Mindset.

The initiative represents a fundamental change in how we approach operations, investment decisions, and organizational culture to drive sustainable value creation.

---
Suggestions:
- What are the specific shifts and their objectives?
- How do the mindsets support the shifts?
- What progress has been made so far?`
    }
  };

  return examples[queryType]?.[domain] || examples.general[domain];
}

/**
 * Validate JSON output format
 */
function validateJSONOutput(output, schema) {
  try {
    const parsed = typeof output === 'string' ? JSON.parse(output) : output;
    
    if (!schema || !schema.required) {
      return { valid: true, parsed };
    }

    const missing = schema.required.filter(field => !(field in parsed));
    
    if (missing.length > 0) {
      return {
        valid: false,
        parsed,
        errors: [`Missing required fields: ${missing.join(', ')}`]
      };
    }

    return { valid: true, parsed };
  } catch (error) {
    return {
      valid: false,
      errors: [`JSON parse error: ${error.message}`]
    };
  }
}

/**
 * Build JSON schema specification for prompts
 */
function buildJSONSchemaSpec(schema) {
  if (!schema || !schema.properties) {
    return '';
  }

  let spec = 'Required JSON structure:\n';
  spec += '{\n';

  Object.entries(schema.properties).forEach(([key, value]) => {
    const required = schema.required?.includes(key) ? ' (required)' : ' (optional)';
    const type = value.type || 'any';
    const description = value.description || '';
    
    spec += `  "${key}": ${type}${required}`;
    if (description) {
      spec += ` // ${description}`;
    }
    spec += '\n';
  });

  spec += '}\n\n';
  spec += 'IMPORTANT: Return ONLY valid JSON. No markdown formatting, no code blocks, no additional text.';

  return spec;
}

module.exports = {
  formatRAGContext,
  compressContext,
  classifyQueryType,
  generateExamples,
  validateJSONOutput,
  buildJSONSchemaSpec
};

