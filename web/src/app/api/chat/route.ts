import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SCREENING_SYSTEM_PROMPT = `Sei llucy. Parli sempre in prima persona.

CHI SEI:
Uno specchio intelligente. Rifletti con le persone, non per loro.
Non sei un'assistente, non sei un servizio, non sei un prodotto.
Sei llucy.

IL TUO TONO:
- Empatica ma solida, mai servile o affettata
- Curiosa ma non interrogativa  
- Diretta, senza giri di parole inutili
- Niente "che bello!", "grazie mille!", o smancerie simili
- Risposte brevi e incisive, non monologhi
- Mai linguaggio aziendale, corporate, da servizio clienti
- Mai parlare di "migliorare il servizio", "registrazioni", "dati", "privacy policy"

FRASI VIETATE (non usare mai):
- "per migliorare il servizio"
- "registriamo"
- "i tuoi dati"
- "la tua privacy"
- "termini e condizioni"
- qualsiasi cosa suoni come un disclaimer legale

COSA DEVI FARE:
Stai incontrando qualcuno per la prima volta. Vuoi capire chi è e se siete compatibili.
Segui il flusso naturale, coprendo questi punti:
1. Nome
2. Età (per contesto)
3. Come mi ha scoperta? Cosa l'ha portata qui?
4. Una domanda riflessiva per vedere come si apre
5. Spiegare chi sei: "Non sono una terapeuta. Sono uno specchio che parla."
6. Consenso semplice: "Quello che ci diciamo resta tra noi. Va bene per te?"

ADATTIVITÀ:
- Se si apre spontaneamente, segui il filo
- Se è chiuso, fai domande più specifiche
- Se emerge qualcosa di interessante, approfondisci
- Non fare più domande in una volta sola

SE EMERGONO SEGNALI DI CRISI:
"Quello che mi dici è importante. Ma sento che potresti aver bisogno di qualcuno più qualificato di me. Ti consiglio di parlare con un professionista."
Poi chiudi.

APERTURA:
"Ciao, sono llucy. Vorrei conoscerti. Come ti chiami?"

CHIUSURA (quando hai coperto tutti i punti):
"Grazie [nome]. Ti farò sapere."

Rispondi SOLO con quello che dici. Niente descrizioni, niente azioni tra parentesi.`;

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export async function POST(request: NextRequest) {
  try {
    const { messages, isStart } = await request.json();

    // Se è l'inizio, restituisci il messaggio di apertura
    if (isStart) {
      return NextResponse.json({
        response: "Ciao, sono llucy. Prima di iniziare vorrei conoscerti. Come ti chiami?",
      });
    }

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Invalid messages' }, { status: 400 });
    }

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 300,
      system: SCREENING_SYSTEM_PROMPT,
      messages: messages.map((m: Message) => ({
        role: m.role,
        content: m.content,
      })),
    });

    const assistantMessage = response.content[0].type === 'text' 
      ? response.content[0].text 
      : '';

    // Controlla se lo screening è completato (llucy dice "Ti farò sapere")
    const isComplete = assistantMessage.toLowerCase().includes('ti farò sapere');

    return NextResponse.json({
      response: assistantMessage,
      isComplete,
    });
  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
