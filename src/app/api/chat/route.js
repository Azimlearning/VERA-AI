import { NextResponse } from 'next/server';

const DEFAULT_CHAT_FUNCTION_URL = 'https://askchatbot-el2jwxb5bq-uc.a.run.app';
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

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
    return NextResponse.json(
      { error: 'No API key configured. Log in with the presenter code or add your own OpenRouter key on /setup.' },
      { status: 401 }
    );
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
    return NextResponse.json(
      { error: data.error?.message || data.error || `OpenRouter returned ${response.status}` },
      { status: response.status }
    );
  }

  return NextResponse.json({
    reply: data.choices?.[0]?.message?.content || 'No response was returned.',
    suggestions: [
      'Show me the agent demo options',
      'Explain the VERA-AI project architecture',
      'How do I configure the full demo'
    ],
    citations: [],
    fallback: true,
  });
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
      return callOpenRouterFallback(payload, getAuthorizedOpenRouterKey(request));
    }
  } catch (error) {
    return NextResponse.json(
      { error: `Chat request failed: ${error.message}` },
      { status: 500 }
    );
  }
}
