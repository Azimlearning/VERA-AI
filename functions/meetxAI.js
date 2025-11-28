// functions/meetxAI.js

const { generateWithFallback } = require('./aiHelper');
const { ChatbotRAGRetriever } = require('./chatbotRAGRetriever');
const admin = require('firebase-admin');

function getDb() {
  return admin.firestore();
}

/**
 * Feature A: Generate Meeting Summary
 * @param {string} content - Meeting content
 * @param {object} keys - API keys
 * @param {string} ragContext - Optional RAG context from knowledge base
 */
async function generateMeetingSummary(content, keys, ragContext = '') {
  try {
    const basePrompt = `Summarize this meeting in 3-5 bullet points covering:
- Key decisions made
- Main topics discussed
- Important outcomes
- Next steps mentioned

Meeting content:
${content.substring(0, 8000)}`;

    // Enhance prompt with RAG context if available
    const prompt = ragContext
      ? `${basePrompt}

--- Relevant Organizational Context (from Knowledge Base) ---
${ragContext}
--- End Context ---

Use the organizational context above to provide more informed and aligned insights. Reference relevant initiatives, strategies, or previous decisions when relevant.`
      : basePrompt;

    const summaryResult = await generateWithFallback(prompt, keys);
    const summary = summaryResult.text || summaryResult; // Handle both new and old format
    return summary;
  } catch (error) {
    console.error('[MeetX AI] Error generating summary:', error);
    return 'Failed to generate summary';
  }
}

/**
 * Feature B: Generate Cascading Summary (Simplified for flat structure)
 */
async function generateCascadingSummary(meetingContent, meetingTitle, keys) {
  try {
    // For flat structure, we'll analyze how this meeting relates to organizational context
    const prompt = `Analyze this meeting and provide contextual insights:
- How does this meeting relate to broader organizational goals?
- What strategic themes or patterns emerge?
- How might this meeting impact other departments or teams?

Meeting Title: ${meetingTitle}
Meeting Content:
${meetingContent.substring(0, 6000)}`;

    const cascadingSummaryResult = await generateWithFallback(prompt, keys);
    const cascadingSummary = cascadingSummaryResult.text || cascadingSummaryResult; // Handle both new and old format
    return cascadingSummary;
  } catch (error) {
    console.error('[MeetX AI] Error generating cascading summary:', error);
    return 'Failed to generate contextual analysis';
  }
}

/**
 * Feature C: Check Alignment with Previous Meetings
 */
async function checkAlignment(meetingContent, meetingTitle, keys) {
  try {
    // Use RAG to find related meetings and knowledge base context
    const retriever = new ChatbotRAGRetriever();
    const query = `${meetingTitle}: ${meetingContent.substring(0, 500)}`;
    
    // Search both meetings and knowledge base for comprehensive context
    const relatedDocs = await retriever.retrieveRelevantDocuments(
      query,
      keys,
      3, // Get top 3 related documents
      null, // No category filter
      {
        collections: ['meetings', 'knowledgeBase'], // Search both collections
        queryType: 'meeting',
        minSimilarity: 0.5 // Threshold for related meetings
      }
    );

    if (relatedDocs.length === 0) {
      return [];
    }

    // Filter to get meetings (for conflict checking) and KB context (for domain knowledge)
    const relatedMeetings = relatedDocs.filter(doc => doc.collection === 'meetings');
    const kbContext = relatedDocs.filter(doc => doc.collection === 'knowledgeBase');

    if (relatedMeetings.length === 0) {
      return []; // No related meetings found
    }

    // Build context from related meetings and KB
    const meetingsContext = relatedMeetings.map(m => `[${m.title}]\n${m.content.substring(0, 1000)}`).join('\n\n');
    const kbContextText = kbContext.length > 0 
      ? `\n\nRelevant Knowledge Base Context:\n${retriever.buildContextString(kbContext, { maxTokens: 300 })}\n`
      : '';
    const contextText = meetingsContext + kbContextText;
    const prompt = `Analyze if decisions in this new meeting contradict previous meetings.

New Meeting:
Title: ${meetingTitle}
Content: ${meetingContent.substring(0, 3000)}

Previous Related Meetings:
${contextText}

Check for:
- Conflicting decisions or directives
- Contradictory goals or strategies
- Inconsistent action items

Return a JSON array of warnings, each with "type" and "message" fields. If no conflicts, return empty array [].
Format: {"warnings": [{"type": "Conflict Type", "message": "Description"}]}`;

    const responseResult = await generateWithFallback(prompt, keys, true);
    const response = responseResult.text || responseResult; // Handle both new and old format
    let warnings = [];
    
    try {
      const parsed = JSON.parse(response);
      if (parsed.warnings && Array.isArray(parsed.warnings)) {
        warnings = parsed.warnings;
      }
    } catch (parseError) {
      // Try to extract warnings from text response
      if (response.toLowerCase().includes('conflict') || response.toLowerCase().includes('contradict')) {
        warnings = [{ type: 'Potential Conflict', message: response.substring(0, 500) }];
      }
    }

    return warnings;
  } catch (error) {
    console.error('[MeetX AI] Error checking alignment:', error);
    return [];
  }
}

/**
 * Feature D: Detect Action Items and Zombie Tasks
 * @param {string} meetingContent - Meeting content
 * @param {object} keys - API keys
 * @param {string} ragContext - Optional RAG context from knowledge base
 */
async function detectActionItems(meetingContent, keys, ragContext = '') {
  try {
    const basePrompt = `Extract all action items from this meeting. For each action item, identify:
- The task description
- The owner/assignee (if mentioned)
- The due date (if mentioned)
- The status (if mentioned)

Meeting content:
${meetingContent.substring(0, 8000)}`;

    // Enhance prompt with RAG context if available
    const prompt = ragContext
      ? `${basePrompt}

--- Relevant Organizational Context (from Knowledge Base) ---
${ragContext}
--- End Context ---

Use the organizational context to better identify action items and understand their context within broader initiatives.`

      : basePrompt;

    const fullPrompt = `${prompt}

Return a JSON object with this structure:
{
  "actionItems": [
    {
      "task": "Task description",
      "owner": "Person name or null",
      "dueDate": "Date string or null",
      "status": "Status or null"
    }
  ],
  "zombieTasks": ["Task descriptions without owner or due date"]
}

If no action items found, return empty arrays.`;

    const responseResult = await generateWithFallback(fullPrompt, keys, true);
    const response = responseResult.text || responseResult; // Handle both new and old format
    
    let actionItems = [];
    let zombieTasks = [];

    try {
      const parsed = JSON.parse(response);
      if (parsed.actionItems && Array.isArray(parsed.actionItems)) {
        actionItems = parsed.actionItems;
      }
      if (parsed.zombieTasks && Array.isArray(parsed.zombieTasks)) {
        zombieTasks = parsed.zombieTasks;
      }
    } catch (parseError) {
      // Fallback: try to extract from text
      console.warn('[MeetX AI] Failed to parse action items JSON, using fallback');
      const lines = response.split('\n').filter(l => l.trim());
      lines.forEach(line => {
        if (line.toLowerCase().includes('action') || line.toLowerCase().includes('task')) {
          if (!line.toLowerCase().includes('owner') && !line.toLowerCase().includes('due')) {
            zombieTasks.push(line);
          } else {
            actionItems.push({ task: line, owner: null, dueDate: null, status: null });
          }
        }
      });
    }

    // Identify zombie tasks from action items
    actionItems.forEach(item => {
      if (!item.owner && !item.dueDate && item.task) {
        if (!zombieTasks.includes(item.task)) {
          zombieTasks.push(item.task);
        }
      }
    });

    return { actionItems, zombieTasks };
  } catch (error) {
    console.error('[MeetX AI] Error detecting action items:', error);
    return { actionItems: [], zombieTasks: [] };
  }
}

/**
 * Feature E: Chat with Organization
 */
async function chatWithOrg(query, keys) {
  try {
    // Use unified RAG to search both meetings and knowledge base
    const retriever = new ChatbotRAGRetriever();
    
    // Search both collections for comprehensive answers
    const relatedDocs = await retriever.retrieveRelevantDocuments(
      query,
      keys,
      5, // Get top 5 documents
      null, // No category filter
      {
        collections: ['meetings', 'knowledgeBase'], // Search both collections
        queryType: 'meeting',
        minSimilarity: 0.5
      }
    );

    if (relatedDocs.length === 0) {
      return {
        answer: 'I could not find relevant information to answer your question. Try rephrasing or check if meetings/knowledge base content exists.',
        sources: []
      };
    }

    // Separate meetings and KB documents
    const meetings = relatedDocs.filter(doc => doc.collection === 'meetings');
    const kbDocs = relatedDocs.filter(doc => doc.collection === 'knowledgeBase');

    // Build context from both sources
    const meetingsContext = meetings.map(m => 
      `[Meeting: ${m.title}]\n${m.content.substring(0, 1000)}`
    ).join('\n\n');
    
    const kbContext = kbDocs.length > 0 
      ? `\n\n[Knowledge Base Context]\n${retriever.buildContextString(kbDocs, { maxTokens: 500 })}\n`
      : '';
    
    const contextText = meetingsContext + kbContext;

    const prompt = `You are an AI assistant that helps answer questions about organizational meetings.

User Question: ${query}

Relevant Meeting Context:
${contextText}

Provide a comprehensive answer based on the meeting context. If the answer is not in the provided context, say so.
Cite which meetings you're referencing.`;

    const answerResult = await generateWithFallback(prompt, keys);
    const answer = answerResult.text || answerResult; // Handle both new and old format

    return {
      answer,
      sources: relatedDocs.map(doc => ({ 
        id: doc.id, 
        title: doc.title,
        collection: doc.collection,
        similarity: doc.similarity
      }))
    };
  } catch (error) {
    console.error('[MeetX AI] Error in chat with org:', error);
    return {
      answer: 'Sorry, I encountered an error while processing your question. Please try again.',
      sources: []
    };
  }
}


module.exports = {
  generateMeetingSummary,
  generateCascadingSummary,
  checkAlignment,
  detectActionItems,
  chatWithOrg
};

