// API route for Visual Agent
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const { mode, imageUrl, imageUrls, imageUrl1, imageUrl2, context } = body;

    // Validate required fields based on mode
    const analysisMode = mode || 'single';
    
    if (analysisMode === 'single' || analysisMode === 'ocr' || analysisMode === 'similarity') {
      if (!imageUrl) {
        return NextResponse.json(
          { error: 'imageUrl is required for this mode' },
          { status: 400 }
        );
      }
    } else if (analysisMode === 'batch') {
      if (!imageUrls || !Array.isArray(imageUrls) || imageUrls.length === 0) {
        return NextResponse.json(
          { error: 'imageUrls array is required for batch mode' },
          { status: 400 }
        );
      }
    } else if (analysisMode === 'compare') {
      if (!imageUrl1 || !imageUrl2) {
        return NextResponse.json(
          { error: 'imageUrl1 and imageUrl2 are required for compare mode' },
          { status: 400 }
        );
      }
    }

    // Call Cloud Function for visual analysis
    const functionUrl = process.env.NEXT_PUBLIC_ANALYZE_IMAGE_URL || 
                       'https://analyzeimage-el2jwxb5bq-uc.a.run.app';
    
    console.log('[analyzeImage API] Calling Cloud Function:', functionUrl);
    console.log('[analyzeImage API] Mode:', analysisMode);
    
    let response;
    try {
      response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mode: analysisMode,
          imageUrl,
          imageUrls,
          imageUrl1,
          imageUrl2,
          context
        })
      });
    } catch (fetchError) {
      console.error('[analyzeImage API] Fetch error:', fetchError);
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
      
      console.error('[analyzeImage API] Cloud Function error:', {
        status,
        statusText,
        error: errorData.error || errorData.message
      });
      
      throw new Error(errorData.error || errorData.message || `Cloud Function request failed with status ${status}`);
    }

    const result = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    console.error('[analyzeImage API] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to analyze image' },
      { status: 500 }
    );
  }
}

