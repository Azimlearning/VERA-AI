import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    serverKeys: {
      openRouter: Boolean(process.env.OPENROUTER_API_KEY),
      gemini: Boolean(process.env.GEMINI_API_KEY),
      firebaseProject: Boolean(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID),
    },
    demoAccessEnabled: Boolean(process.env.VERA_DEMO_ACCESS_CODE),
  });
}
