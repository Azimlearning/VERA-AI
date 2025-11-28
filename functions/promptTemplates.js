/**
 * Prompt Templates System
 * 
 * Standardized prompt builder functions based on best practices from
 * industry-leading system prompts (Cursor, Claude Code, Windsurf, etc.)
 * 
 * Provides hierarchical, structured prompts with clear sections:
 * - Role definition
 * - Domain context
 * - Knowledge base (RAG) context
 * - Instructions
 * - Examples
 * - Task
 */

const fs = require('fs');
const path = require('path');

const PETRONAS_DOMAIN_CONTEXT = {
  goal: "PETRONAS 2.0 by 2035",
  keyShifts: [
    "Portfolio High-Grading",
    "Deliver Advantaged Barrels"
  ],
  mindsets: [
    "More Risk Tolerant",
    "Commercial Savvy",
    "Growth Mindset"
  ]
};

/**
 * Build domain context section
 */
function buildDomainContext(additionalContext = '') {
  const baseContext = `Goal: ${PETRONAS_DOMAIN_CONTEXT.goal}
Key Shifts: ${PETRONAS_DOMAIN_CONTEXT.keyShifts.join(', ')}
Mindsets: ${PETRONAS_DOMAIN_CONTEXT.mindsets.join(', ')}`;
  
  return additionalContext 
    ? `${baseContext}\n${additionalContext}`
    : baseContext;
}

/**
 * Build role section with clear definition
 */
function buildRoleSection(role, description, context = '') {
  const roleText = `<role>
${role}

${description}`;
  
  if (context) {
    return `${roleText}

Context: ${context}`;
  }
  
  return roleText;
}

/**
 * Build knowledge base (RAG) section with priority placement
 * Includes similarity scores and explicit usage instructions
 */
function buildKnowledgeBaseSection(ragContext, retrievedDocs = [], options = {}) {
  const {
    isPrimarySource = true,
    showSimilarityScores = true,
    includeFallback = true
  } = options;

  if (!ragContext || ragContext.trim().length === 0) {
    if (!includeFallback) return '';
    
    return `<knowledge_base>
No relevant documents were retrieved from the knowledge base.
Stay aligned to PETRONAS Upstream tone and avoid speculation.
Rely on domain context provided above.`;
  }

  let section = `<knowledge_base>
${ragContext}`;

  // Add similarity scores if available and requested
  if (showSimilarityScores && retrievedDocs && retrievedDocs.length > 0) {
    const similarityInfo = retrievedDocs
      .map((doc, idx) => {
        const score = doc.similarity ? ` (similarity: ${(doc.similarity * 100).toFixed(1)}%)` : '';
        return `Document ${idx + 1}: "${doc.title}"${score}`;
      })
      .join('\n');
    
    section += `\n\nRetrieved Documents:\n${similarityInfo}`;
  }

  // Add explicit usage instructions
  if (isPrimarySource) {
    section += `\n\nCRITICAL: This knowledge base content is the PRIMARY source of information.
- Use this content whenever possible to answer questions
- Cite document titles naturally when referencing this information
- If information conflicts with general knowledge, prioritize this knowledge base content
- Only use general domain context when knowledge base content is insufficient`;
  } else {
    section += `\n\nUse this context to inform your response with accurate information and relevant examples.`;
  }

  return section;
}

/**
 * Build instructions section with clear, numbered rules
 */
function buildInstructionsSection(instructions, outputFormat = null, toneGuidelines = null) {
  let section = `<instructions>`;

  // Add numbered instructions
  if (Array.isArray(instructions)) {
    instructions.forEach((instruction, idx) => {
      section += `\n${idx + 1}. ${instruction}`;
    });
  } else {
    section += `\n${instructions}`;
  }

  // Add tone guidelines if provided
  if (toneGuidelines) {
    section += `\n\nTone and Style Guidelines:`;
    if (Array.isArray(toneGuidelines)) {
      toneGuidelines.forEach(guideline => {
        section += `\n- ${guideline}`;
      });
    } else {
      section += `\n${toneGuidelines}`;
    }
  }

  // Add output format if provided
  if (outputFormat) {
    section += `\n\nOutput Format:\n${outputFormat}`;
  }

  section += `\n</instructions>`;
  return section;
}

/**
 * Build examples section with dynamic few-shot examples
 */
function buildExamplesSection(examples, exampleType = 'general') {
  if (!examples || examples.length === 0) {
    return '';
  }

  let section = `<examples>`;

  if (Array.isArray(examples)) {
    examples.forEach((example, idx) => {
      section += `\n\nExample ${idx + 1}:\n${example}`;
    });
  } else {
    section += `\n${examples}`;
  }

  section += `\n</examples>`;
  return section;
}

/**
 * Build task section with user request
 */
function buildTaskSection(task, additionalContext = '') {
  let section = `<task>
${task}`;

  if (additionalContext) {
    section += `\n\nAdditional Context:\n${additionalContext}`;
  }

  section += `\n</task>`;
  return section;
}

/**
 * Build complete prompt with hierarchical structure
 * Follows best practices: Role → Domain Context → Knowledge Base → Instructions → Examples → Task
 */
function buildPrompt(options) {
  const {
    role,
    roleDescription,
    roleContext,
    domainContext,
    additionalDomainContext,
    knowledgeBaseContext,
    retrievedDocs,
    knowledgeBaseOptions,
    instructions,
    outputFormat,
    toneGuidelines,
    examples,
    exampleType,
    task,
    taskContext,
    securityNotice
  } = options;

  const sections = [];

  // 1. Role (always first)
  if (role && roleDescription) {
    sections.push(buildRoleSection(role, roleDescription, roleContext));
  }

  // 2. Domain Context (after role, before knowledge base)
  if (domainContext !== false) {
    const context = buildDomainContext(additionalDomainContext);
    sections.push(`<domain_context>\n${context}\n</domain_context>`);
  }

  // 3. Security Notice (if present, after domain context)
  if (securityNotice) {
    sections.push(`<security_notice>\n${securityNotice}\n</security_notice>`);
  }

  // 4. Knowledge Base (RAG context - high priority)
  if (knowledgeBaseContext !== undefined) {
    const kbSection = buildKnowledgeBaseSection(
      knowledgeBaseContext,
      retrievedDocs,
      knowledgeBaseOptions || {}
    );
    if (kbSection) {
      sections.push(kbSection);
    }
  }

  // 5. Instructions
  if (instructions) {
    sections.push(buildInstructionsSection(instructions, outputFormat, toneGuidelines));
  }

  // 6. Examples
  if (examples) {
    const examplesSection = buildExamplesSection(examples, exampleType);
    if (examplesSection) {
      sections.push(examplesSection);
    }
  }

  // 7. Task (always last)
  if (task) {
    sections.push(buildTaskSection(task, taskContext));
  }

  return sections.join('\n\n');
}

/**
 * Estimate token count (rough approximation: ~4 chars per token)
 */
function estimateTokens(text) {
  if (!text) return 0;
  return Math.ceil(text.length / 4);
}

/**
 * Manage token budget across prompt sections
 * Allocates tokens proportionally: RAG: 40%, Instructions: 20%, Examples: 20%, User: 20%
 */
function manageTokenBudget(totalBudget, sections) {
  const budget = {
    rag: Math.floor(totalBudget * 0.4),
    instructions: Math.floor(totalBudget * 0.2),
    examples: Math.floor(totalBudget * 0.2),
    user: Math.floor(totalBudget * 0.2)
  };

  const current = {
    rag: estimateTokens(sections.rag || ''),
    instructions: estimateTokens(sections.instructions || ''),
    examples: estimateTokens(sections.examples || ''),
    user: estimateTokens(sections.user || '')
  };

  return {
    budget,
    current,
    withinBudget: 
      current.rag <= budget.rag &&
      current.instructions <= budget.instructions &&
      current.examples <= budget.examples &&
      current.user <= budget.user,
    recommendations: {
      rag: current.rag > budget.rag ? `RAG context exceeds budget (${current.rag}/${budget.rag} tokens). Consider compression.` : null,
      instructions: current.instructions > budget.instructions ? `Instructions exceed budget (${current.instructions}/${budget.instructions} tokens).` : null,
      examples: current.examples > budget.examples ? `Examples exceed budget (${current.examples}/${budget.examples} tokens).` : null,
      user: current.user > budget.user ? `User input exceeds budget (${current.user}/${budget.user} tokens).` : null
    }
  };
}

/**
 * Load prompt from file and replace template variables
 * @param {string} promptName - Name of prompt file (e.g., 'writeup-prompt.txt')
 * @param {object} variables - Object with variables to replace (e.g., { ragContext: '...', taskContext: '...' })
 * @returns {string} - Loaded prompt with variables replaced
 */
function loadPromptFromFile(promptName, variables = {}) {
  try {
    const promptsDir = path.join(__dirname, 'prompts');
    const promptPath = path.join(promptsDir, promptName);
    
    // Check if file exists
    if (!fs.existsSync(promptPath)) {
      console.warn(`[loadPromptFromFile] Prompt file not found: ${promptPath}. Falling back to inline prompts.`);
      return null;
    }
    
    // Read prompt file
    let promptTemplate = fs.readFileSync(promptPath, 'utf8');
    
    // Replace template variables (e.g., {{variableName}})
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
      const replacement = value !== undefined && value !== null ? String(value) : '';
      promptTemplate = promptTemplate.replace(regex, replacement);
    }
    
    // Remove any remaining unreplaced variables (optional - for debugging)
    const remainingVars = promptTemplate.match(/\{\{(\w+)\}\}/g);
    if (remainingVars && remainingVars.length > 0) {
      console.warn(`[loadPromptFromFile] Unreplaced variables in ${promptName}: ${remainingVars.join(', ')}`);
    }
    
    return promptTemplate;
  } catch (error) {
    console.error(`[loadPromptFromFile] Error loading prompt ${promptName}:`, error.message);
    return null;
  }
}

module.exports = {
  buildPrompt,
  buildRoleSection,
  buildDomainContext,
  buildKnowledgeBaseSection,
  buildInstructionsSection,
  buildExamplesSection,
  buildTaskSection,
  estimateTokens,
  manageTokenBudget,
  loadPromptFromFile,
  PETRONAS_DOMAIN_CONTEXT
};

