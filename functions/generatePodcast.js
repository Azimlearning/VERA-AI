// functions/generatePodcast.js

const { generateWithFallback } = require("./aiHelper");
const { generatePodcastAudio } = require("./podcastTTS");
const { ChatbotRAGRetriever } = require("./chatbotRAGRetriever");
const { sanitizePromptInput, detectPromptInjection, buildSecurityNotice } = require("./promptSecurity");
const { buildPrompt, buildDomainContext, loadPromptFromFile } = require("./promptTemplates");
const { formatRAGContext, buildJSONSchemaSpec } = require("./promptHelpers");

// Add this function definition
function createRequestId(prefix = 'pod') {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
}

/**
 * Generates a podcast script based on a topic and optional context.
 * Uses AI to create a structured podcast with outline, script, and sections.
 * 
 * @param {Object} geminiApiKey - Secret object for Gemini API key
 * @param {Object} openRouterApiKey - Secret object for OpenRouter API key
 * @returns {Function} Handler function for the Cloud Function
 */
function createGeneratePodcastHandler(geminiApiKey, openRouterApiKey) {
  return async (req, res) => {
    const cors = require("cors")({ origin: true });
    
    cors(req, res, async () => {
      if (req.method !== "POST") {
        return res.status(405).send({ error: "Method Not Allowed" });
      }

      try {
        const { topic, context } = req.body;

        if (!topic || typeof topic !== 'string' || !topic.trim()) {
          return res.status(400).send({ error: "topic (string) is required." });
        }

        const sanitizedTopic = sanitizePromptInput(topic, 500);
        if (!sanitizedTopic) {
          return res.status(400).send({ error: "topic (string) is required." });
        }
        const sanitizedContext = context ? sanitizePromptInput(context, 2000) : '';
        const injectionSignals = [
          ...detectPromptInjection(topic),
          ...(context ? detectPromptInjection(context) : [])
        ];
        if (injectionSignals.length) {
          console.warn(`[generatePodcast] Potential prompt injection detected: ${injectionSignals.join(', ')}`);
        }
        const securityNotice = buildSecurityNotice(injectionSignals);
        const requestId = createRequestId('pod');
        const logPrefix = `[generatePodcast][${requestId}]`;

        const keys = {
          gemini: geminiApiKey.value(),
          openrouter: openRouterApiKey.value()
        };

      if (!keys.gemini && !keys.openrouter) {
        return res.status(500).send({ error: "AI API keys not configured." });
      }

        console.log(`${logPrefix} Generating podcast for topic: ${sanitizedTopic.substring(0, 100)}`);

      // Use RAG to retrieve relevant knowledge base documents
      let knowledgeContext = '';
      let retrievedDocs = [];
      let ragUsed = false;
      let ragMetadata = {
        query: '',
        documentsFound: 0,
        topDocuments: [],
        contextLength: 0,
        error: null
      };

      try {
        // Build query from topic and context
        const ragQuery = sanitizedContext
          ? `${sanitizedTopic}. ${sanitizedContext}`.trim()
          : sanitizedTopic.trim();
        
        ragMetadata.query = ragQuery;
        console.log(`${logPrefix} ===== RAG RETRIEVAL START =====`);
        console.log(`${logPrefix} Query: "${ragQuery}" (${ragQuery.length} chars)`);
        
        const ragRetriever = new ChatbotRAGRetriever();
        console.log(`${logPrefix} Initialized ChatbotRAGRetriever`);
        console.log(`${logPrefix} Calling retrieveRelevantDocuments with topK=5...`);
        const ragStart = Date.now();
        
        retrievedDocs = await ragRetriever.retrieveRelevantDocuments(
          ragQuery,
          keys,
          5,
          null,
          {
            queryType: 'podcast'
          }
        ); // Get top 5 documents
        
        console.log(`${logPrefix} retrieveRelevantDocuments returned ${retrievedDocs ? retrievedDocs.length : 0} documents in ${Date.now() - ragStart} ms`);
        
        if (retrievedDocs && retrievedDocs.length > 0) {
          console.log(`${logPrefix} Processing ${retrievedDocs.length} retrieved documents...`);
          
          // Log each document found
          retrievedDocs.forEach((doc, idx) => {
            console.log(`${logPrefix} Document ${idx + 1}: "${doc.title}" (similarity: ${doc.similarity?.toFixed(4) || 'N/A'}, category: ${doc.category || 'N/A'})`);
            console.log(`${logPrefix}   Content preview: ${doc.content?.substring(0, 100) || 'No content'}...`);
          });
          
          knowledgeContext = ragRetriever.buildContextString(retrievedDocs, { maxTokens: 2500 }); // Increased for podcast generation to provide more context
          ragUsed = true;
          
          ragMetadata.documentsFound = retrievedDocs.length;
          ragMetadata.topDocuments = retrievedDocs.slice(0, 3).map(doc => ({
            title: doc.title,
            similarity: doc.similarity,
            category: doc.category,
            sourceUrl: doc.sourceUrl
          }));
          ragMetadata.contextLength = knowledgeContext.length;
          
          console.log(`${logPrefix} Built context string: ${knowledgeContext.length} characters`);
          console.log(`${logPrefix} Context preview (first 200 chars): ${knowledgeContext.substring(0, 200)}...`);
          console.log(`${logPrefix} Top match: "${retrievedDocs[0].title}" (similarity: ${retrievedDocs[0].similarity?.toFixed(4) || 'N/A'})`);
        } else {
          console.log(`${logPrefix} ⚠️  No relevant documents found in knowledge base`);
          console.log(`${logPrefix} Possible reasons: 1) KB empty 2) No embeddings 3) Query similarity low`);
          console.log(`${logPrefix} Using static context only`);
          ragMetadata.documentsFound = 0;
        }
        
        console.log(`${logPrefix} ===== RAG RETRIEVAL END =====`);
      } catch (ragError) {
        console.error(`${logPrefix} ❌ RAG retrieval failed: ${ragError.message}`);
        console.error(`${logPrefix} RAG error stack:`, ragError.stack);
        ragMetadata.error = ragError.message;
        // Continue without RAG - use static context as fallback
      }

      // Format RAG context
      const { context: formattedKnowledgeContext } = formatRAGContext(retrievedDocs || [], {
        maxTokens: 1200,
        includeSimilarity: true,
        includeSource: true
      });

      // Define podcast JSON schema
      const podcastJSONSchema = {
        type: "object",
        required: ["outline", "script", "sections"],
        properties: {
          outline: { type: "string", description: "Episode outline summarizing the flow" },
          script: { type: "string", description: "Full conversational script with HOST:/GUEST: markers" },
          sections: {
            type: "array",
            description: "Array of section objects (5-7 sections required)",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                content: { type: "string" },
                qa: {
                  type: "array",
                  description: "3-5 Q&A pairs per section",
                  items: {
                    type: "object",
                    properties: {
                      question: { type: "string" },
                      answer: { type: "string" }
                    }
                  }
                }
              }
            }
          }
        }
      };

      // Format retrieved docs for template
      const retrievedDocsText = retrievedDocs && retrievedDocs.length > 0
        ? retrievedDocs.map((doc, idx) => {
            const score = doc.similarity ? ` (similarity: ${(doc.similarity * 100).toFixed(1)}%)` : '';
            return `Document ${idx + 1}: "${doc.title}"${score}`;
          }).join('\n')
        : '';

      // Load podcast prompt from file
      let podcastPrompt = loadPromptFromFile('podcast-prompt.txt', {
        securityNotice: securityNotice ? `<security_notice>\n${securityNotice}\n</security_notice>` : '',
        ragContext: formattedKnowledgeContext || knowledgeContext || '',
        retrievedDocs: retrievedDocsText,
        outputFormat: buildJSONSchemaSpec(podcastJSONSchema),
        topic: sanitizedTopic,
        additionalContext: sanitizedContext || ''
      });
      
      // Fallback to buildPrompt if file loading fails
      if (!podcastPrompt) {
        podcastPrompt = buildPrompt({
          role: "Podcast Script Creator",
          roleDescription: `You are creating an educational podcast script for PETRONAS Upstream employees about "${sanitizedTopic}". Your task is to create engaging, informative content that helps employees understand and engage with organizational initiatives.`,
          roleContext: "You create content for internal communications, maintaining an engaging, professional tone suitable for employee education and engagement.",
          domainContext: true,
          additionalDomainContext: buildDomainContext() + "\n\nSystemic Shifts Areas:\n- Operational Excellence (Systemic Shift #8: Operate it Right)\n- Digital Transformation\n- Sustainability and Decarbonisation\n- Innovation and Technology\n- People and Culture\n- Safety and Risk Management",
          securityNotice: securityNotice || undefined,
          knowledgeBaseContext: formattedKnowledgeContext || knowledgeContext,
          retrievedDocs: retrievedDocs || [],
          knowledgeBaseOptions: {
            isPrimarySource: true,
            showSimilarityScores: true,
            includeFallback: true
          },
          instructions: [
            "Use the knowledge base content as the PRIMARY source of facts and information.",
            "Create a comprehensive, detailed script with thorough explanations and practical examples.",
            "Provide 5-7 sections, each with: (1) Descriptive title, (2) Detailed content with multiple dialogue exchanges, (3) 3-5 Q&A pairs per section with substantial answers (3-4 sentences each).",
            "Length Requirements: Minimum 2,000-2,500 words, 10,000-12,000 characters. Target runtime: 12-15 minutes when spoken.",
            "Include detailed explanations, practical examples, real-world applications, and PETRONAS-specific references.",
            "Highlight connections to PETRONAS 2.0 goals, Key Shifts, and organizational mindsets.",
            "Maintain engaging, conversational tone between HOST and GUEST throughout."
          ],
          outputFormat: buildJSONSchemaSpec(podcastJSONSchema),
          task: `Create a comprehensive podcast script about "${sanitizedTopic}".${sanitizedContext ? `\n\nAdditional Context:\n${sanitizedContext}` : ''}\n\nGenerate the complete podcast script following the format specified above.`
        });
      }

      // Log prompt details for debugging
      console.log(`${logPrefix} ===== PROMPT DETAILS =====`);
      console.log(`${logPrefix} Prompt length: ${podcastPrompt.length} characters`);
      console.log(`${logPrefix} RAG context included: ${knowledgeContext ? 'YES' : 'NO'}`);
      if (knowledgeContext) {
        console.log(`${logPrefix} RAG context length: ${knowledgeContext.length} characters`);
      }
      console.log(`${logPrefix} Prompt preview (first 500 chars): ${podcastPrompt.substring(0, 500)}...`);
      console.log(`${logPrefix} ===== END PROMPT DETAILS =====`);

      // Generate podcast content
      console.log(`${logPrefix} Calling generateWithFallback to generate podcast...`);
      const llmStart = Date.now();
      const podcastResult = await generateWithFallback(podcastPrompt, keys, true);
      const podcastJson = podcastResult.text || podcastResult; // Handle both new and old format
      console.log(`${logPrefix} Received response from LLM (${podcastJson.length} characters) in ${Date.now() - llmStart} ms`);
      if (podcastResult.metadata) {
        console.log(`${logPrefix} Model used: ${podcastResult.metadata.model}`);
      }

      // Parse the JSON response
      let podcastData;
      try {
        // Clean up the response (remove markdown code blocks if present)
        let cleanedJson = podcastJson.trim();
        cleanedJson = cleanedJson.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        podcastData = JSON.parse(cleanedJson);
      } catch (parseError) {
        console.error(`${logPrefix} JSON parse error:`, parseError);
        // If JSON parsing fails, create a structured response from the text
        podcastData = {
          outline: "Podcast outline generated",
          script: podcastJson,
          sections: [
            {
              title: "Main Discussion",
              content: podcastJson,
              qa: []
            }
          ]
        };
      }

      // Ensure required fields exist
      if (!podcastData.outline) podcastData.outline = "Podcast outline";
      if (!podcastData.script) podcastData.script = podcastJson;
      if (!podcastData.sections || !Array.isArray(podcastData.sections)) {
        podcastData.sections = [{
          title: "Main Discussion",
          content: podcastData.script,
          qa: []
        }];
      }

      // Validate script length and log metrics
      const scriptLength = podcastData.script.length;
      const wordCount = podcastData.script.split(/\s+/).filter(word => word.length > 0).length;
      // Estimate duration: average speaking rate is ~150 words per minute
      const estimatedMinutes = Math.round((wordCount / 150) * 10) / 10;
      const minRequiredChars = 8000; // Minimum for ~12 minutes
      const minRequiredWords = 2000; // Minimum for ~12 minutes
      
      console.log(`${logPrefix} ===== SCRIPT VALIDATION =====`);
      console.log(`${logPrefix} Script length: ${scriptLength} characters`);
      console.log(`${logPrefix} Word count: ${wordCount} words`);
      console.log(`${logPrefix} Estimated duration: ~${estimatedMinutes} minutes`);
      console.log(`${logPrefix} Sections: ${podcastData.sections.length}`);
      
      if (scriptLength < minRequiredChars) {
        console.warn(`${logPrefix} ⚠️  WARNING: Script is shorter than recommended minimum`);
        console.warn(`${logPrefix}   - Current: ${scriptLength} chars (target: ${minRequiredChars}+)`);
        console.warn(`${logPrefix}   - Current: ${wordCount} words (target: ${minRequiredWords}+)`);
        console.warn(`${logPrefix}   - Estimated duration: ${estimatedMinutes} min (target: 12-15 min)`);
        console.warn(`${logPrefix}   - The AI model may not have generated enough content. Consider regenerating.`);
      } else {
        console.log(`${logPrefix} ✅ Script length meets minimum requirements`);
      }
      console.log(`${logPrefix} ===== END SCRIPT VALIDATION =====`);

      console.log(`${logPrefix} Successfully generated podcast with ${podcastData.sections.length} sections`);

      // Generate audio from the script
      let audioUrl = null;
      if (podcastData.script) {
        try {
          console.log(`${logPrefix} Starting audio generation...`);
          console.log(`${logPrefix} Script length: ${podcastData.script.length} characters`);
          audioUrl = await generatePodcastAudio(podcastData.script, topic.trim());
          console.log(`${logPrefix} Audio generated successfully: ${audioUrl}`);
        } catch (audioError) {
          console.error(`${logPrefix} Audio generation failed:`, audioError);
          console.error(`${logPrefix} Audio error stack:`, audioError.stack);
          // Continue without audio - script generation was successful
          // Audio generation failure should not fail the entire request
          // But log the error for debugging
        }
      } else {
        console.warn('[generatePodcast] No script available for audio generation');
      }

      // Prepare response with RAG metadata for debugging
      const response = {
        success: true,
        podcast: podcastData,
        topic: sanitizedTopic,
        audioUrl: audioUrl,
        ragMetadata: {
          used: ragUsed,
          documentsFound: ragMetadata.documentsFound,
          topDocuments: ragMetadata.topDocuments,
          query: ragMetadata.query,
          contextLength: ragMetadata.contextLength,
          error: ragMetadata.error
        }
      };

      console.log(`${logPrefix} ===== RESPONSE SUMMARY =====`);
      console.log(`${logPrefix} RAG used: ${ragUsed}`);
      console.log(`${logPrefix} Documents found: ${ragMetadata.documentsFound}`);
      console.log(`${logPrefix} Context length: ${ragMetadata.contextLength} chars`);
      if (ragMetadata.topDocuments.length > 0) {
        console.log(`${logPrefix} Top documents: ${ragMetadata.topDocuments.map(d => d.title).join(', ')}`);
      }
      console.log(`${logPrefix} ===== END RESPONSE SUMMARY =====`);

      res.status(200).send(response);

      } catch (error) {
        console.error(`${logPrefix} Error:`, error);
        res.status(500).send({
          error: "Failed to generate podcast",
          message: error.message
        });
      }
    });
  };
}

module.exports = { createGeneratePodcastHandler };

