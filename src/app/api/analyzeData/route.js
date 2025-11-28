// API route for Analytics Agent with RAG support
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { data, dataType, isQuery, query } = await request.json();

    // Call Cloud Function for analytics with RAG
    const functionsUrl = process.env.NEXT_PUBLIC_FUNCTIONS_URL || 'https://us-central1-systemicshiftv2.cloudfunctions.net';
    const response = await fetch(`${functionsUrl}/analyzeData`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        data, 
        dataType,
        isQuery, // Flag to indicate this is a query (not data)
        query // Original query for better RAG retrieval
      })
    });

    if (!response.ok) {
      throw new Error('Cloud Function request failed');
    }

    const result = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    console.error('[analyzeData API] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to analyze data' },
      { status: 500 }
    );
  }
}

