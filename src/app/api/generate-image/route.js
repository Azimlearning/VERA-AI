// src/app/api/generate-image/route.js
// API route for generating images using Gemini 3 Pro Image
// This can be called directly or used as a fallback for local generation

import { NextResponse } from 'next/server';
import { generateImageWithGemini3, buildInfographicPrompt } from '../../../lib/gemini3ImageGen';
import { db, storage } from '../../../lib/firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export async function POST(request) {
  console.log('[generate-image] POST request received');
  
  try {
    const body = await request.json();
    const { storyId, prompt, concept, title, aspectRatio = '1:1', imageSize = '2K' } = body;

    if (!storyId && !prompt) {
      return NextResponse.json(
        { error: 'Either storyId or prompt is required' },
        { status: 400 }
      );
    }

    // Build the prompt
    let imagePrompt = prompt;
    if (!imagePrompt && concept) {
      imagePrompt = buildInfographicPrompt(concept, title);
    }
    if (!imagePrompt) {
      imagePrompt = `Create a professional corporate infographic for PETRONAS Upstream. Title: "${title || 'Systemic Shift Story'}". Use teal and white colors, flat design, vertical layout.`;
    }

    console.log('[generate-image] Calling Gemini 3 with prompt:', imagePrompt.substring(0, 150) + '...');

    const providedApiKey = request.headers.get('x-gemini-api-key') || body.geminiApiKey || '';
    const demoCode = request.headers.get('x-vera-demo-code') || body.demoAccessCode || '';
    const canUseServerKey = process.env.VERA_DEMO_ACCESS_CODE &&
      demoCode &&
      demoCode === process.env.VERA_DEMO_ACCESS_CODE;
    const apiKey = providedApiKey || (canUseServerKey ? process.env.GEMINI_API_KEY : '');

    if (!apiKey) {
      return NextResponse.json(
        { error: 'No API key configured. Add your Gemini key on /setup or use the presenter access code.' },
        { status: 401 }
      );
    }

    // Generate image with Gemini 3
    const result = await generateImageWithGemini3(imagePrompt, {
      aspectRatio,
      imageSize,
      apiKey,
    });

    if (!result || !result.imageBase64) {
      throw new Error('No image generated');
    }

    // Convert base64 to buffer
    const imageBuffer = Buffer.from(result.imageBase64, 'base64');
    
    // Upload to Firebase Storage
    const filename = `generated_images/${storyId || 'direct'}_${Date.now()}.png`;
    const storageRef = ref(storage, filename);
    
    await uploadBytes(storageRef, imageBuffer, {
      contentType: result.mimeType || 'image/png',
    });
    
    const imageUrl = await getDownloadURL(storageRef);
    console.log('[generate-image] Image uploaded:', imageUrl);

    // If storyId provided, update Firestore
    if (storyId) {
      try {
        const storyRef = doc(db, 'stories', storyId);
        await updateDoc(storyRef, {
          aiGeneratedImageUrl: imageUrl,
          imageGeneratedAt: serverTimestamp(),
          imageGeneratedBy: 'gemini-3-pro-image',
        });
        console.log('[generate-image] Firestore updated for story:', storyId);
      } catch (firestoreError) {
        console.error('[generate-image] Firestore update error:', firestoreError);
        // Continue - image was still generated
      }
    }

    return NextResponse.json({
      success: true,
      imageUrl,
      storyId: storyId || null,
    }, { status: 200 });

  } catch (error) {
    console.error('[generate-image] Error:', error);
    return NextResponse.json(
      { error: `Image generation failed: ${error.message}` },
      { status: 500 }
    );
  }
}

