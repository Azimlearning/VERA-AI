import { NextResponse } from 'next/server';

const DEFAULT_CHAT_FUNCTION_URL = 'https://askchatbot-el2jwxb5bq-uc.a.run.app';
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const GEMINI_MODEL = 'gemini-2.0-flash';

function hasPresenterAccess(request) {
  const demoCode = request.headers.get('x-vera-demo-code');
  return Boolean(
    process.env.VERA_DEMO_ACCESS_CODE &&
      demoCode &&
      demoCode === process.env.VERA_DEMO_ACCESS_CODE
  );
}

function buildPresenterDemoReply(message) {
  const question = message.toLowerCase();
  let reply = `Presenter demo mode is active. VERA could not reach the live provider for this request, so this showcase response is running locally. Your question was: “${message}”`;

  if (question.includes('net zero') || question.includes('2050')) {
    reply = 'A practical Net Zero 2050 pathway is usually presented in stages: establish a verified emissions baseline, improve energy efficiency, reduce routine flaring and methane leakage, scale lower-carbon operations, and use carefully governed offsets only for residual emissions. Each stage should have measurable targets, owners, and regular reporting.';
  } else if (question.includes('agent') || question.includes('demo')) {
    reply = 'VERA-AI is designed as a multi-agent knowledge assistant. The showcase can route questions to specialist workflows, combine retrieved context, and present concise answers with supporting sources when the connected knowledge base and provider APIs are available.';
  } else if (question.includes('architecture') || question.includes('setup')) {
    reply = 'The showcase uses a Next.js interface, Firebase-backed services, server-side API routes, and local presenter or public API-key configuration. Keeping provider calls behind the server route prevents provider credentials from being embedded in the browser bundle.';
  }

  return {
    reply,
    suggestions: [
      'What are the key milestones for Net Zero 2050?',
      'Show me the agent demo options',
      'Explain the VERA-AI project architecture',
    ],
    citations: [],
    fallback: true,
    provider: 'presenter-demo',
  };
}

function getAuthorizedOpenRouterKey(request) {
  const userKey = request.headers.get('x-openrouter-api-key');
  if (userKey) {
    return userKey;
  }

  const demoCode = request.headers.get('x-vera-demo-code');
  if (
    process.env.VERA_DEMO_ACCESS_CODE &&
    demoCode &&
    demoCode === process.env.VERA_DEMO_ACCESS_CODE
  ) {
    return process.env.OPENROUTER_API_KEY;
  }

  return '';
}

function getAuthorizedGeminiKey(request) {
  const userKey = request.headers.get('x-gemini-api-key');
  if (userKey) {
    return userKey;
  }

  const demoCode = request.headers.get('x-vera-demo-code');
  if (
    process.env.VERA_DEMO_ACCESS_CODE &&
    demoCode &&
    demoCode === process.env.VERA_DEMO_ACCESS_CODE
  ) {
    return process.env.GEMINI_API_KEY || process.env.GOOGLE_GENAI_API_KEY;
  }

  return '';
}

async function callFirebaseChatbot(payload) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 20000);

  try {
    const response = await fetch(process.env.CHAT_FUNCTION_URL || DEFAULT_CHAT_FUNCTION_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.error || `Chat function returned ${response.status}`);
    }

    return data;
  } finally {
    clearTimeout(timeoutId);
  }
}

async function callOpenRouterFallback(payload, apiKey) {
  if (!apiKey) {
    throw new Error('No OpenRouter API key configured.');
  }

  const response = await fetch(OPENROUTER_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://upstream-vera-ai.vercel.app',
      'X-Title': 'VERA-AI Showcase',
    },
    body: JSON.stringify({
      model: payload.model || 'google/gemini-2.5-flash',
      messages: [
        {
          role: 'system',
          content: [
            'You are VERA, a concise AI assistant for a PETRONAS Upstream internship showcase.',
            'Answer professionally. If knowledge-base citations are unavailable, say so plainly.',
            'Keep the response useful for a product demo.',
          ].join(' '),
        },
        {
          role: 'user',
          content: payload.message,
        },
      ],
      temperature: payload.temperature ?? 0.4,
      max_tokens: payload.maxTokens || 900,
    }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error?.message || data.error || `OpenRouter returned ${response.status}`);
  }

  return {
    reply: data.choices?.[0]?.message?.content || 'No response was returned.',
    suggestions: [
      'Show me the agent demo options',
      'Explain the VERA-AI project architecture',
      'How do I configure the full demo'
    ],
    citations: [],
    fallback: true,
    provider: 'openrouter',
  };
}

async function callGeminiFallback(payload, apiKey) {
  if (!apiKey) {
    throw new Error('No Gemini API key configured.');
  }

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': apiKey,
    },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: [
                'You are VERA, a concise AI assistant for a PETRONAS Upstream internship showcase.',
                'Answer professionally. If knowledge-base citations are unavailable, say so plainly.',
                `User question: ${payload.message}`,
              ].join('\n\n'),
            },
          ],
        },
      ],
      generationConfig: {
        temperature: payload.temperature ?? 0.4,
        maxOutputTokens: payload.maxTokens || 900,
      },
    }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error?.message || `Gemini returned ${response.status}`);
  }

  const reply = data.candidates?.[0]?.content?.parts
    ?.map((part) => part.text || '')
    .join('')
    .trim();

  return {
    reply: reply || 'No response was returned.',
    suggestions: [
      'Show me the agent demo options',
      'Explain the VERA-AI project architecture',
      'How do I configure the full demo'
    ],
    citations: [],
    fallback: true,
    provider: 'gemini',
  };
}

export async function POST(request) {
  try {
    const payload = await request.json();

    if (!payload.message || !payload.message.trim()) {
      return NextResponse.json({ error: 'Message is required.' }, { status: 400 });
    }

    try {
      const data = await callFirebaseChatbot(payload);
      return NextResponse.json(data);
    } catch (firebaseError) {
      console.warn('[api/chat] Firebase chatbot unavailable, using fallback:', firebaseError.message);
      try {
        return NextResponse.json(await callOpenRouterFallback(payload, getAuthorizedOpenRouterKey(request)));
      } catch (openRouterError) {
        console.warn('[api/chat] OpenRouter fallback unavailable, trying Gemini:', openRouterError.message);
        try {
          return NextResponse.json(await callGeminiFallback(payload, getAuthorizedGeminiKey(request)));
        } catch (geminiError) {
          console.warn('[api/chat] Gemini fallback unavailable:', geminiError.message);
          if (hasPresenterAccess(request)) {
            console.warn('[api/chat] Returning presenter demo response after provider failures.');
            return NextResponse.json(buildPresenterDemoReply(payload.message.trim()));
          }
          return NextResponse.json(
            {
              error: [
                'No working API key configured.',
                'Log in with the presenter code or add your own OpenRouter/Gemini key on /setup.',
                `Last provider error: ${geminiError.message}`,
              ].join(' '),
            },
            { status: 401 }
          );
        }
      }
    }
  } catch (error) {
    return NextResponse.json(
      { error: `Chat request failed: ${error.message}` },
      { status: 500 }
    );
  }
}
