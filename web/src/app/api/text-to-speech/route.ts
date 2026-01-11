import { NextRequest, NextResponse } from 'next/server';

// Flag per scegliere TTS: 'browser' (gratis) o 'elevenlabs' (qualità)
const TTS_PROVIDER = 'browser';

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();

    if (!text) {
      return NextResponse.json({ error: 'No text provided' }, { status: 400 });
    }

    if (TTS_PROVIDER === 'browser') {
      // Restituisce il testo - il browser userà Web Speech API
      return NextResponse.json({ text, useBrowserTTS: true });
    }

    // ElevenLabs TTS
    const voiceId = process.env.ELEVENLABS_VOICE_ID;
    const apiKey = process.env.ELEVENLABS_API_KEY;
    
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey || '',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('ElevenLabs error:', error);
      return NextResponse.json({ error: 'Text-to-speech failed' }, { status: 500 });
    }

    const audioBuffer = await response.arrayBuffer();
    
    return new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
      },
    });
  } catch (error) {
    console.error('TTS error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
