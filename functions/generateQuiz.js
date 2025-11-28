// functions/generateQuiz.js

const { generateWithFallback } = require("./aiHelper");
const { ChatbotRAGRetriever } = require("./chatbotRAGRetriever");
const { sanitizePromptInput, detectPromptInjection, buildSecurityNotice } = require("./promptSecurity");
const { buildPrompt, buildDomainContext, loadPromptFromFile } = require("./promptTemplates");
const { formatRAGContext, buildJSONSchemaSpec } = require("./promptHelpers");

function createRequestId(prefix = 'quiz') {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
}

/**
 * Generates a quiz based on knowledge base content or user-provided content.
 * Uses AI to create multiple choice questions with explanations.
 * 
 * @param {Object} geminiApiKey - Secret object for Gemini API key
 * @param {Object} openRouterApiKey - Secret object for OpenRouter API key
 * @returns {Function} Handler function for the Cloud Function
 */
function createGenerateQuizHandler(geminiApiKey, openRouterApiKey) {
  return async (req, res) => {
    const cors = require("cors")({ origin: true });
    
    cors(req, res, async () => {
      if (req.method !== "POST") {
        return res.status(405).send({ error: "Method Not Allowed" });
      }

      try {
        const { mode, topic, content, numQuestions } = req.body;

        // Validate mode
        if (!mode || !['knowledge-base', 'user-content'].includes(mode)) {
          return res.status(400).send({ error: "mode must be 'knowledge-base' or 'user-content'" });
        }

        // Validate numQuestions
        const questionCount = Math.min(Math.max(parseInt(numQuestions) || 5, 3), 20);
        
        const requestId = createRequestId('quiz');
        const logPrefix = `[generateQuiz][${requestId}]`;

        const keys = {
          gemini: geminiApiKey.value(),
          openrouter: openRouterApiKey.value()
        };

        if (!keys.gemini && !keys.openrouter) {
          return res.status(500).send({ error: "AI API keys not configured." });
        }

        let sourceContent = '';
        let knowledgeContext = '';
        let retrievedDocs = [];
        let ragMetadata = {
          query: '',
          documentsFound: 0,
          topDocuments: [],
          contextLength: 0,
          error: null
        };

        // Handle knowledge-base mode
        if (mode === 'knowledge-base') {
          if (!topic || typeof topic !== 'string' || !topic.trim()) {
            return res.status(400).send({ error: "topic (string) is required when mode is 'knowledge-base'" });
          }

          const sanitizedTopic = sanitizePromptInput(topic, 200);
          if (!sanitizedTopic) {
            return res.status(400).send({ error: "Valid topic is required" });
          }

          const injectionSignals = detectPromptInjection(topic);
          if (injectionSignals.length) {
            console.warn(`${logPrefix} Potential prompt injection detected: ${injectionSignals.join(', ')}`);
          }

          console.log(`${logPrefix} Generating quiz from knowledge base topic: ${sanitizedTopic}`);

          // Use RAG to retrieve relevant knowledge base documents
          try {
            ragMetadata.query = sanitizedTopic;
            console.log(`${logPrefix} ===== RAG RETRIEVAL START =====`);
            
            const ragRetriever = new ChatbotRAGRetriever();
            const ragStart = Date.now();
            
            // Map topic IDs to knowledge base categories for filtering
            const topicCategoryMap = {
              'petronas-2.0': ['petronas-info'],
              'systemic-shifts': ['systemic-shifts'],
              'upstream-target': ['upstream-target'],
              'key-shifts': ['systemic-shifts'],
              'mindset-behaviour': ['mindset-behaviour'],
              'our-progress': ['systemic-shifts'],
              'articles': ['articles']
            };
            
            const categories = topicCategoryMap[sanitizedTopic] || null;
            
            retrievedDocs = await ragRetriever.retrieveRelevantDocuments(
              sanitizedTopic,
              keys,
              5, // Get top 5 documents
              categories, // Filter by category if topic is mapped
              {
                queryType: 'general'
              }
            );
            
            console.log(`${logPrefix} RAG retrieval completed in ${Date.now() - ragStart} ms`);
            console.log(`${logPrefix} Retrieved ${retrievedDocs ? retrievedDocs.length : 0} documents`);
            
            if (retrievedDocs && retrievedDocs.length > 0) {
              knowledgeContext = ragRetriever.buildContextString(retrievedDocs, { maxTokens: 1500 });
              sourceContent = knowledgeContext;
              
              ragMetadata.documentsFound = retrievedDocs.length;
              ragMetadata.topDocuments = retrievedDocs.slice(0, 3).map(doc => ({
                title: doc.title,
                similarity: doc.similarity,
                category: doc.category
              }));
              ragMetadata.contextLength = knowledgeContext.length;
              
              console.log(`${logPrefix} Built context: ${knowledgeContext.length} characters`);
              console.log(`${logPrefix} Top match: "${retrievedDocs[0].title}"`);
            } else {
              console.warn(`${logPrefix} No relevant documents found in knowledge base`);
              ragMetadata.documentsFound = 0;
              return res.status(404).send({ 
                error: "No relevant content found in knowledge base for this topic. Please try a different topic or use 'user-content' mode." 
              });
            }
            
            console.log(`${logPrefix} ===== RAG RETRIEVAL END =====`);
          } catch (ragError) {
            console.error(`${logPrefix} RAG retrieval failed: ${ragError.message}`);
            ragMetadata.error = ragError.message;
            return res.status(500).send({ 
              error: "Failed to retrieve content from knowledge base. Please try again." 
            });
          }
        } 
        // Handle user-content mode
        else if (mode === 'user-content') {
          if (!content || typeof content !== 'string' || !content.trim()) {
            return res.status(400).send({ error: "content (string) is required when mode is 'user-content'" });
          }

          const sanitizedContent = sanitizePromptInput(content, 10000);
          if (!sanitizedContent || sanitizedContent.length < 100) {
            return res.status(400).send({ error: "content must be at least 100 characters" });
          }

          const injectionSignals = detectPromptInjection(content);
          if (injectionSignals.length) {
            console.warn(`${logPrefix} Potential prompt injection detected: ${injectionSignals.join(', ')}`);
          }

          sourceContent = sanitizedContent;
          console.log(`${logPrefix} Generating quiz from user content (${sanitizedContent.length} chars)`);
        }

        // Format RAG context if available
        let formattedRAGContext = '';
        if (mode === 'knowledge-base' && retrievedDocs && retrievedDocs.length > 0) {
          const { context } = formatRAGContext(retrievedDocs, {
            maxTokens: 1500,
            includeSimilarity: true,
            includeSource: true
          });
          formattedRAGContext = context;
        }

        // Define quiz JSON schema
        const quizJSONSchema = {
          type: "object",
          required: ["title", "description", "questions"],
          properties: {
            title: { type: "string", description: "Descriptive quiz title based on content" },
            description: { type: "string", description: "Brief description of what the quiz covers" },
            questions: {
              type: "array",
              description: `Array of exactly ${questionCount} question objects`,
              items: {
                type: "object",
                required: ["question", "options", "correctAnswer", "explanation"],
                properties: {
                  question: { type: "string", description: "Clear, specific question text" },
                  options: {
                    type: "object",
                    required: ["a", "b", "c", "d"],
                    properties: {
                      a: { type: "string" },
                      b: { type: "string" },
                      c: { type: "string" },
                      d: { type: "string" }
                    }
                  },
                  correctAnswer: { type: "string", description: "One of: a, b, c, or d" },
                  explanation: { type: "string", description: "Clear explanation (2-3 sentences) of why the answer is correct" }
                }
              }
            }
          }
        };

        // Format retrieved docs for template
        const retrievedDocsText = mode === 'knowledge-base' && retrievedDocs && retrievedDocs.length > 0
          ? retrievedDocs.map((doc, idx) => {
              const score = doc.similarity ? ` (similarity: ${(doc.similarity * 100).toFixed(1)}%)` : '';
              return `Document ${idx + 1}: "${doc.title}"${score}`;
            }).join('\n')
          : '';

        // Build domain context section
        const domainContextSection = mode === 'knowledge-base'
          ? `<domain_context>
PETRONAS Upstream Operational Context (PRIMARY):
- Supporting PETRONAS Upstream operations, initiatives, and employee engagement
- Focus on operational excellence, production efficiency, safety, and strategic initiatives
- Understanding of upstream operations, asset management, and organizational culture

PETRONAS 2.0 and Systemic Shifts (SUPPORTING KNOWLEDGE):
Goal: PETRONAS 2.0 by 2035
Key Shifts: Portfolio High-Grading, Deliver Advantaged Barrels
Mindsets: More Risk Tolerant, Commercial Savvy, Growth Mindset

Systemic Shifts Areas:
- Portfolio High-Grading
- Deliver Advantaged Barrels
- Operational Excellence
- Digital Transformation
- Sustainability and Decarbonisation
- Innovation and Technology
- People and Culture
- Safety and Risk Management
</domain_context>`
          : '';

        const knowledgeBaseUsage = mode === 'knowledge-base'
          ? "CRITICAL: This knowledge base content is the PRIMARY source of information. Create questions based on this content."
          : '';

        // Load quiz prompt from file
        let quizPrompt = loadPromptFromFile('quiz-prompt.txt', {
          domainContextSection: domainContextSection,
          ragContext: mode === 'knowledge-base' ? (formattedRAGContext || sourceContent || '') : '',
          retrievedDocs: retrievedDocsText,
          knowledgeBaseUsage: knowledgeBaseUsage,
          questionCount: questionCount,
          outputFormat: buildJSONSchemaSpec(quizJSONSchema),
          sourceContentLabel: mode === 'knowledge-base' ? 'Source Content (from Knowledge Base):' : 'Source Content (User Provided):',
          sourceContent: sourceContent
        });
        
        // Fallback to buildPrompt if file loading fails
        if (!quizPrompt) {
          quizPrompt = buildPrompt({
            role: "Expert Quiz Creator",
            roleDescription: "You are an expert quiz creator specializing in educational content for PETRONAS Upstream. Your task is to create comprehensive, well-structured quizzes that test understanding and reinforce learning.",
            roleContext: "You create quizzes for employee education and engagement, ensuring questions are appropriate for professional/educational context.",
            domainContext: mode === 'knowledge-base',
            additionalDomainContext: mode === 'knowledge-base' ? buildDomainContext() + "\n\nSystemic Shifts Areas:\n- Portfolio High-Grading\n- Deliver Advantaged Barrels\n- Operational Excellence\n- Digital Transformation\n- Sustainability and Decarbonisation\n- Innovation and Technology\n- People and Culture\n- Safety and Risk Management" : undefined,
            knowledgeBaseContext: mode === 'knowledge-base' ? formattedRAGContext || sourceContent : undefined,
            retrievedDocs: mode === 'knowledge-base' ? retrievedDocs || [] : undefined,
            knowledgeBaseOptions: mode === 'knowledge-base' ? {
              isPrimarySource: true,
              showSimilarityScores: true,
              includeFallback: false
            } : undefined,
            instructions: [
              `Create exactly ${questionCount} multiple-choice questions based on the provided content.`,
              "Each question must have: (1) Clear, specific question, (2) 4 answer options (A, B, C, D), (3) One correct answer, (4) Brief explanation (2-3 sentences) explaining why the answer is correct.",
              "Questions should: Test understanding of key concepts, facts, and details; Cover different aspects of the content; Be appropriate for professional/educational context; Avoid trivial or overly obvious questions.",
              "Ensure questions are well-distributed across the content, testing different levels of understanding (recall, comprehension, application).",
              "Each explanation should be clear, educational, and help reinforce learning."
            ],
            outputFormat: buildJSONSchemaSpec(quizJSONSchema),
            task: `Generate a comprehensive quiz based on the following content:\n\n${mode === 'knowledge-base' ? 'Source Content (from Knowledge Base):' : 'Source Content (User Provided):'}\n${sourceContent}\n\nGenerate the quiz now with exactly ${questionCount} questions.`
          });
        }

        console.log(`${logPrefix} Calling AI to generate quiz...`);
        const aiStart = Date.now();
        
        const aiResponseResult = await generateWithFallback(quizPrompt, keys, true);
        const aiResponse = aiResponseResult.text || aiResponseResult; // Handle both new and old format

        console.log(`${logPrefix} AI response received in ${Date.now() - aiStart} ms`);
        console.log(`${logPrefix} Response length: ${aiResponse.length} characters`);
        if (aiResponseResult.metadata) {
          console.log(`${logPrefix} Model used: ${aiResponseResult.metadata.model}`);
        }

        // Parse JSON response
        let quizData;
        try {
          // Try to extract JSON from response (handle cases where AI wraps it in markdown)
          let jsonText = aiResponse.trim();
          
          // Remove markdown code blocks if present
          if (jsonText.startsWith('```json')) {
            jsonText = jsonText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
          } else if (jsonText.startsWith('```')) {
            jsonText = jsonText.replace(/^```\s*/, '').replace(/\s*```$/, '');
          }
          
          // Find JSON object boundaries
          const jsonStart = jsonText.indexOf('{');
          const jsonEnd = jsonText.lastIndexOf('}') + 1;
          if (jsonStart !== -1 && jsonEnd > jsonStart) {
            jsonText = jsonText.substring(jsonStart, jsonEnd);
          }
          
          quizData = JSON.parse(jsonText);
        } catch (parseError) {
          console.error(`${logPrefix} Failed to parse AI response as JSON:`, parseError);
          console.error(`${logPrefix} Raw response:`, aiResponse.substring(0, 500));
          return res.status(500).send({ 
            error: "Failed to generate valid quiz format. Please try again.",
            details: "AI response could not be parsed as JSON"
          });
        }

        // Validate quiz structure
        if (!quizData.title || !quizData.questions || !Array.isArray(quizData.questions)) {
          return res.status(500).send({ 
            error: "Invalid quiz format generated",
            details: "Missing title or questions array"
          });
        }

        // Validate each question
        const validQuestions = [];
        for (let i = 0; i < quizData.questions.length; i++) {
          const q = quizData.questions[i];
          if (q.question && q.options && q.correctAnswer && q.explanation) {
            // Ensure correctAnswer is valid
            if (!['a', 'b', 'c', 'd'].includes(q.correctAnswer.toLowerCase())) {
              console.warn(`${logPrefix} Question ${i + 1} has invalid correctAnswer: ${q.correctAnswer}`);
              // Try to fix: use first option if invalid
              q.correctAnswer = 'a';
            }
            validQuestions.push({
              question: q.question.trim(),
              options: {
                a: (q.options.a || q.options.A || '').trim(),
                b: (q.options.b || q.options.B || '').trim(),
                c: (q.options.c || q.options.C || '').trim(),
                d: (q.options.d || q.options.D || '').trim()
              },
              correctAnswer: q.correctAnswer.toLowerCase(),
              explanation: q.explanation.trim()
            });
          } else {
            console.warn(`${logPrefix} Question ${i + 1} is missing required fields`);
          }
        }

        if (validQuestions.length === 0) {
          return res.status(500).send({ 
            error: "No valid questions generated",
            details: "AI response did not contain valid question structure"
          });
        }

        // Build final quiz object
        const finalQuiz = {
          id: `generated_${Date.now()}`,
          title: quizData.title.trim() || `Generated Quiz - ${mode === 'knowledge-base' ? topic : 'User Content'}`,
          description: quizData.description?.trim() || `AI-generated quiz with ${validQuestions.length} questions`,
          questions: validQuestions,
          metadata: {
            mode,
            topic: mode === 'knowledge-base' ? topic : null,
            numQuestions: questionCount,
            generatedAt: new Date().toISOString(),
            ragMetadata: mode === 'knowledge-base' ? ragMetadata : null
          }
        };

        console.log(`${logPrefix} ✅ Quiz generated successfully: ${finalQuiz.title} with ${validQuestions.length} questions`);

        return res.status(200).send({
          success: true,
          quiz: finalQuiz
        });

      } catch (error) {
        console.error('[generateQuiz] Error:', error);
        return res.status(500).send({ 
          error: error.message || "Failed to generate quiz",
          details: error.stack
        });
      }
    });
  };
}

module.exports = { createGenerateQuizHandler };

