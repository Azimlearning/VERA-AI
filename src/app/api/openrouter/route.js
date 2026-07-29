import { NextResponse } from 'next/server';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1';

function getAuthorizedApiKey(request, body) {
  if (body.apiKey) {
    return body.apiKey;
  }

  const demoCode = request.headers.get('x-vera-demo-code') || body.demoAccessCode;
  const expectedCode = process.env.VERA_DEMO_ACCESS_CODE;
  const presenterSession = request.cookies.get('vera-presenter-session')?.value;

  if (presenterSession === 'active' || (expectedCode && demoCode && demoCode === expectedCode)) {
    return process.env.OPENROUTER_API_KEY;
  }

  return '';
}

export async function POST(request) {
  try {
    const body = await request.json();
    const apiKey = getAuthorizedApiKey(request, body);

    if (!apiKey) {
      return NextResponse.json(
        { error: 'No API key configured. Add your key on /setup or use the presenter access code.' },
        { status: 401 }
      );
    }

    const endpoint = body.endpoint || 'chat/completions';
    const allowedEndpoints = new Set(['chat/completions', 'embeddings', 'images/generations']);

    if (!allowedEndpoints.has(endpoint)) {
      return NextResponse.json({ error: 'Unsupported OpenRouter endpoint.' }, { status: 400 });
    }

    const response = await fetch(`${OPENROUTER_API_URL}/${endpoint}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': request.headers.get('origin') || 'https://upstream-vera-ai.vercel.app',
        'X-Title': 'VERA-AI Showcase',
      },
      body: JSON.stringify(body.payload || {}),
    });

    const responseText = await response.text();
    const json = responseText ? JSON.parse(responseText) : {};

    return NextResponse.json(json, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      { error: `OpenRouter proxy failed: ${error.message}` },
      { status: 500 }
    );
  }
}
