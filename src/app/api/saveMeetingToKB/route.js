// API route for saving meeting analysis to knowledge base
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { title, content, analysis } = await request.json();

    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    if (!analysis) {
      return NextResponse.json(
        { error: 'Analysis object is required' },
        { status: 400 }
      );
    }

    // Call Cloud Function for saving meeting to KB
    // For 2nd gen functions, use the Cloud Run URL format
    const functionUrl = process.env.NEXT_PUBLIC_SAVE_MEETING_TO_KB_URL || 
                       'https://savemeetingtoknowledgebase-el2jwxb5bq-uc.a.run.app';
    
    console.log('[saveMeetingToKB API] Calling Cloud Function:', functionUrl);
    console.log('[saveMeetingToKB API] Request payload:', {
      title: title?.substring(0, 50),
      hasContent: !!content,
      hasAnalysis: !!analysis,
      analysisKeys: analysis ? Object.keys(analysis) : []
    });
    
    let response;
    try {
      response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          title,
          content: content || '',
          analysis
        })
      });
    } catch (fetchError) {
      console.error('[saveMeetingToKB API] Fetch error:', fetchError);
      throw new Error(`Failed to connect to Cloud Function: ${fetchError.message}. The function may not be deployed yet. Please deploy with: firebase deploy --only functions:saveMeetingToKnowledgeBase`);
    }

    if (!response.ok) {
      let errorData;
      try {
        const text = await response.text();
        errorData = text ? JSON.parse(text) : { error: 'Failed to save meeting' };
      } catch (parseError) {
        errorData = { error: `Cloud Function returned ${response.status} ${response.statusText}` };
      }
      console.error('[saveMeetingToKB API] Cloud Function error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData,
        url: functionUrl
      });
      
      // Provide helpful error message if function not found
      if (response.status === 404) {
        throw new Error(`Cloud Function 'saveMeetingToKnowledgeBase' not found. Please deploy it with: firebase deploy --only functions:saveMeetingToKnowledgeBase`);
      }
      
      throw new Error(errorData.error || errorData.message || `Cloud Function request failed with status ${response.status}`);
    }

    const result = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    console.error('[saveMeetingToKB API] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to save meeting to knowledge base' },
      { status: 500 }
    );
  }
}

