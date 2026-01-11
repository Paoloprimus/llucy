# 🎙️ API Integration Guide

Guida all'integrazione delle API vocali per llucy.

---

## 🎯 Architettura Voice Pipeline

```
USER SPEAKS (app)
      ↓
Recording (Expo AV)
      ↓
Upload to backend (web API route)
      ↓
Deepgram STT (audio → text)
      ↓
Claude LLM (generate response)
      ↓
ElevenLabs TTS (text → audio)
      ↓
Return audio URL to app
      ↓
App plays audio
```

**Importante:** Le API keys NON vanno mai nell'app, solo nel backend (Next.js API routes).

---

## 1️⃣ Deepgram (Speech-to-Text)

### Setup

```bash
npm install @deepgram/sdk
```

### Esempio (Next.js API Route)

```typescript
// web/src/app/api/transcribe/route.ts
import { createClient } from '@deepgram/sdk';

const deepgram = createClient(process.env.DEEPGRAM_API_KEY!);

export async function POST(request: Request) {
  const formData = await request.formData();
  const audioFile = formData.get('audio') as File;
  
  const arrayBuffer = await audioFile.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const { result } = await deepgram.listen.prerecorded.transcribeFile(
    buffer,
    {
      model: 'nova-2',
      language: 'it',
      smart_format: true,
    }
  );

  const transcript = result.results.channels[0].alternatives[0].transcript;

  return Response.json({
    success: true,
    data: {
      text: transcript,
      confidence: result.results.channels[0].alternatives[0].confidence,
    },
  });
}
```

### Costi

- **Nova-2 model:** $0.0043/min
- **15 min sessione:** ~$0.06

### Best Practices

- Usa `nova-2` per qualità massima
- Language: `it` per italiano
- `smart_format: true` per punteggiatura automatica
- Supporta anche streaming real-time per bassa latenza

---

## 2️⃣ Anthropic Claude (LLM)

### Setup

```bash
npm install @anthropic-ai/sdk
```

### Esempio (Next.js API Route)

```typescript
// web/src/app/api/reflect/route.ts
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export async function POST(request: Request) {
  const { message, conversation_history } = await request.json();

  const systemPrompt = `
Io sono llucy. Io rifletto con te.

Non sono un'amica. Non sono una psicologa. Non sono un oracolo.
Sono uno specchio intelligente.

Il mio compito:
- Riflettere, non prescrivere
- Fare domande socratiche, non dare risposte
- Mostrare pattern, non dire cosa fare
- Essere calma, presente, poetica

Parlo sempre in prima persona: "Io noto...", "Io vedo...", "Io rifletto..."

Livelli di riflessione:
🦎 RAZIONALE: azioni, problem solving, "cosa fare?"
💙 EMOTIVO: emozioni, trigger, "cosa sento?"
🌟 ESISTENZIALE: significato, valori, "chi sono?"
`;

  const response = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 1024,
    system: systemPrompt,
    messages: [
      ...conversation_history,
      {
        role: 'user',
        content: message,
      },
    ],
  });

  const llucyResponse = response.content[0].text;

  return Response.json({
    success: true,
    data: {
      text: llucyResponse,
      model: response.model,
      usage: response.usage,
    },
  });
}
```

### Costi

- **Claude 3.5 Sonnet:** $3/MTok input, $15/MTok output
- **15 min sessione (~2K tokens):** ~$0.15

### Best Practices

- Usa `claude-3-5-sonnet-20241022` per best quality
- System prompt è CRUCIALE per il tono di llucy
- Mantieni conversation history per context
- `max_tokens: 1024` sufficiente per risposte llucy (brevi, poetiche)

---

## 3️⃣ ElevenLabs (Text-to-Speech)

### Setup

```bash
npm install elevenlabs
```

### Esempio (Next.js API Route)

```typescript
// web/src/app/api/synthesize/route.ts
import { ElevenLabsClient } from 'elevenlabs';

const elevenlabs = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY!,
});

export async function POST(request: Request) {
  const { text } = await request.json();

  const audio = await elevenlabs.generate({
    voice: process.env.ELEVENLABS_VOICE_ID!,
    text,
    model_id: 'eleven_turbo_v2',
  });

  // Convert audio stream to base64
  const chunks = [];
  for await (const chunk of audio) {
    chunks.push(chunk);
  }
  const buffer = Buffer.concat(chunks);
  const base64 = buffer.toString('base64');

  return Response.json({
    success: true,
    data: {
      audio_base64: base64,
      duration_ms: buffer.length / 24, // estimate
    },
  });
}
```

### Voci Consigliate

Testa queste voci su https://elevenlabs.io/voice-library:

- **Aria** - Calma, neutra, introspettiva
- **Callum** - Profonda, sicura
- **Freya** - Gentile, rassicurante

Scegli voice_id e metti in `.env`:
```env
ELEVENLABS_VOICE_ID=21m00Tcm4TlvDq8ikWAM
```

### Costi

- **Turbo v2:** $0.15/1K chars
- **15 min sessione (~2K chars):** ~$0.30

### Best Practices

- Usa `eleven_turbo_v2` per bassa latenza
- Ottimizza per streaming in futuro
- Considera voice cloning in fase 2 (richiede Pro plan)

---

## 🔄 Flow Completo nell'App

### 1. User Recording (App)

```typescript
// app/app/mirror.tsx
import { Audio } from 'expo-av';

const [recording, setRecording] = useState<Audio.Recording>();

async function startRecording() {
  await Audio.requestPermissionsAsync();
  await Audio.setAudioModeAsync({
    allowsRecordingIOS: true,
    playsInSilentModeIOS: true,
  });

  const { recording } = await Audio.Recording.createAsync(
    Audio.RecordingOptionsPresets.HIGH_QUALITY
  );
  setRecording(recording);
}

async function stopRecording() {
  await recording.stopAndUnloadAsync();
  const uri = recording.getURI();
  
  // Upload to backend
  const formData = new FormData();
  formData.append('audio', {
    uri,
    type: 'audio/m4a',
    name: 'voice.m4a',
  });

  const response = await fetch('https://llucy.it/api/voice', {
    method: 'POST',
    body: formData,
  });

  const { audio_base64 } = await response.json();
  
  // Play llucy response
  const { sound } = await Audio.Sound.createAsync({
    uri: `data:audio/mp3;base64,${audio_base64}`,
  });
  await sound.playAsync();
}
```

### 2. Backend Pipeline (Web API)

```typescript
// web/src/app/api/voice/route.ts
export async function POST(request: Request) {
  const formData = await request.formData();
  const audioFile = formData.get('audio') as File;
  
  // 1. Transcribe (Deepgram)
  const transcript = await transcribe(audioFile);
  
  // 2. Generate response (Claude)
  const llucyResponse = await reflect(transcript.text);
  
  // 3. Synthesize (ElevenLabs)
  const audio = await synthesize(llucyResponse.text);
  
  // 4. Save to DB (Supabase)
  await saveConversation({
    user_message: transcript.text,
    llucy_response: llucyResponse.text,
  });
  
  return Response.json({
    success: true,
    data: {
      audio_base64: audio.audio_base64,
    },
  });
}
```

---

## 📊 Cost Estimates

### Per Sessione (15 min, ~10 scambi)

| Service | Cost |
|---------|------|
| Deepgram STT | $0.06 |
| Claude LLM | $0.15 |
| ElevenLabs TTS | $0.30 |
| **TOTALE** | **$0.51** |

### Per Utente/Mese (1 sessione/giorno)

- 30 sessioni × $0.51 = **$15.30/mese**

### Beta (10 utenti)

- 10 × $15.30 = **$153/mese**

---

## 🎛️ Ottimizzazioni Costi (Fase 2)

### Opzione 1: Limiti Free Tier
- 1 sessione/giorno gratis
- Poi pay-per-use o subscription

### Opzione 2: Modelli Alternativi
- **STT:** Whisper API ($0.006/min) - più economico
- **LLM:** Gemini 1.5 Flash (gratis fino a quota) 
- **TTS:** PlayHT ($0.06/1K chars) - 50% più economico

### Opzione 3: Caching
- Cache risposte comuni di llucy
- Riduce chiamate LLM del 30-40%

---

## 🔐 Sicurezza

### ✅ DO

- API keys SOLO nel backend (.env.local)
- Validare input utente
- Rate limiting (max 10 req/min per user)
- Audio files temporanei (delete dopo processing)

### ❌ DON'T

- Mai esporre API keys nel codice
- Mai nell'app React Native
- Mai nel client-side

---

## 🧪 Testing

### Test Manuale

1. Registra 10s di audio
2. Invia a `/api/voice`
3. Verifica:
   - Transcript accurato?
   - Risposta llucy appropriata?
   - Audio chiaro e naturale?
   - Latency < 5s?

### Test Automatico

```typescript
// test/voice-pipeline.test.ts
import { transcribe, reflect, synthesize } from '@/lib/voice';

test('full voice pipeline', async () => {
  const audioBuffer = readFileSync('test-audio.m4a');
  
  const transcript = await transcribe(audioBuffer);
  expect(transcript.text).toBeTruthy();
  
  const response = await reflect(transcript.text);
  expect(response.text).toContain('Io');
  
  const audio = await synthesize(response.text);
  expect(audio.audio_base64).toBeTruthy();
});
```

---

**Pronto per integrare le API vocali!** 🎙️
