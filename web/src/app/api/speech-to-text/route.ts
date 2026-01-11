import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as Blob;

    if (!audioFile) {
      return NextResponse.json({ error: 'No audio provided' }, { status: 400 });
    }

    const arrayBuffer = await audioFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const response = await fetch('https://api.deepgram.com/v1/listen?model=nova-2&language=it', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${process.env.DEEPGRAM_API_KEY}`,
        'Content-Type': 'audio/webm',
      },
      body: buffer,
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Deepgram error:', error);
      return NextResponse.json({ error: 'Speech-to-text failed' }, { status: 500 });
    }

    const result = await response.json();
    const transcript = result.results?.channels?.[0]?.alternatives?.[0]?.transcript || '';

    return NextResponse.json({ transcript });
  } catch (error) {
    console.error('STT error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
