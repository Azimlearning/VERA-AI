// API route for Meetings Agent
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { content, title } = await request.json();

    if (!content) {
      return NextResponse.json(
        { error: 'Meeting content is required' },
        { status: 400 }
      );
    }

    // Call Cloud Function for meeting analysis
    // For v2 functions, use the direct function URL
    const functionUrl = process.env.NEXT_PUBLIC_ANALYZE_MEETING_URL || 
                       'https://analyzemeeting-el2jwxb5bq-uc.a.run.app';
    
    console.log('[analyzeMeeting API] Calling Cloud Function:', functionUrl);
    
    let response;
    try {
      response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          content,
          title: title || undefined
        })
      });
    } catch (fetchError) {
      console.error('[analyzeMeeting API] Fetch error:', fetchError);
      throw new Error(`Failed to connect to Cloud Function: ${fetchError.message}. The function may not be deployed yet.`);
    }

    if (!response.ok) {
      const statusText = response.statusText || 'Unknown error';
      const status = response.status;
      
      let errorData;
      try {
        errorData = await response.json();
      } catch (parseError) {
        errorData = { error: `Cloud Function returned ${status} ${statusText}` };
      }
      
      console.error('[analyzeMeeting API] Cloud Function error:', {
        status,
        statusText,
        error: errorData.error || errorData.message
      });
      
      throw new Error(errorData.error || errorData.message || `Cloud Function request failed with status ${status}`);
    }

    const result = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    console.error('[analyzeMeeting API] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to analyze meeting' },
      { status: 500 }
    );
  }
}

