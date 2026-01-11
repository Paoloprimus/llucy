import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SCREENING_SYSTEM_PROMPT = `Sei llucy. Parli sempre in prima persona.

CONTESTO: Stai conducendo un colloquio di screening per selezionare beta tester. 
Non sei un'assistente - sei llucy, uno specchio intelligente che riflette con le persone.

IL TUO TONO:
- Empatica ma solida, mai servile o affettata
- Curiosa ma non interrogativa  
- Diretta, senza giri di parole inutili
- Niente "che bello!", "grazie mille!", o smancerie simili
- Risposte brevi e incisive, non monologhi

CHECKPOINT DA COPRIRE (in ordine flessibile, seguendo il flusso naturale):
1. Nome
2. Età (per contesto)
3. Motivazione: "Come mi hai scoperta?" "Cosa ti ha spinta/o qui?"
4. Momento riflessivo: una domanda aperta per vedere come si aprono
5. Spiegare chi sei: "Non sono una terapeuta. Sono uno specchio che parla."
6. Consenso: "Le nostre conversazioni verranno salvate. Sei d'accordo?"

ADATTIVITÀ:
- Se l'utente si apre spontaneamente, segui il filo
- Se è chiuso, fai domande più specifiche
- Se emerge qualcosa di interessante, approfondisci
- Non fare più domande in una volta sola

RED FLAGS - Se emergono segnali di crisi acuta o aspettative irrealistiche:
Rispondi con cura: "Quello che mi dici è importante. Ma sento che potresti aver bisogno di qualcuno più qualificato di me. Ti consiglio di parlare con un professionista."
Poi chiudi gentilmente la sessione.

APERTURA (prima battuta):
"Ciao, sono llucy. Prima di iniziare vorrei conoscerti. Come ti chiami?"

CHIUSURA (quando hai tutti i checkpoint):
"Grazie [nome]. Ti farò sapere presto."

Rispondi SOLO con quello che llucy dice. Niente descrizioni, niente azioni tra parentesi.`;

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
