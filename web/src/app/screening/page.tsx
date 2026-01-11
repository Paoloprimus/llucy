'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type Status = 'idle' | 'listening' | 'processing' | 'speaking';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function ScreeningPage() {
  const [status, setStatus] = useState<Status>('idle');
  const [messages, setMessages] = useState<Message[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Inizia la conversazione quando la pagina si carica
  useEffect(() => {
    startConversation();
  }, []);

  const startConversation = async () => {
    try {
      setStatus('processing');
      
      // Ottieni il messaggio di apertura da llucy
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isStart: true }),
      });

      const data = await response.json();
      if (data.response) {
        setMessages([{ role: 'assistant', content: data.response }]);
        await speakText(data.response);
      }
    } catch (err) {
      console.error('Start error:', err);
      setError('Errore di connessione');
      setStatus('idle');
    }
  };

  const speakText = async (text: string) => {
    try {
      setStatus('speaking');
      
      const response = await fetch('/api/text-to-speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      const contentType = response.headers.get('content-type');
      
      // Se il server restituisce JSON, usa Browser TTS
      if (contentType?.includes('application/json')) {
        const data = await response.json();
        if (data.useBrowserTTS) {
          await speakWithBrowser(data.text);
          return;
        }
      }

      if (!response.ok) throw new Error('TTS failed');

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      
      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
        if (!isComplete) {
          startListening();
        } else {
          setStatus('idle');
        }
      };
      
      await audio.play();
    } catch (err) {
      console.error('TTS error:', err);
      setError('Errore audio');
      setStatus('idle');
    }
  };

  const speakWithBrowser = (text: string): Promise<void> => {
    return new Promise((resolve) => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'it-IT';
      utterance.rate = 0.9;
      utterance.pitch = 1;
      
      // Cerca una voce italiana femminile
      const voices = speechSynthesis.getVoices();
      const italianVoice = voices.find(v => 
        v.lang.startsWith('it') && v.name.toLowerCase().includes('female')
      ) || voices.find(v => v.lang.startsWith('it'));
      
      if (italianVoice) {
        utterance.voice = italianVoice;
      }
      
      utterance.onend = () => {
        if (!isComplete) {
          startListening();
        } else {
          setStatus('idle');
        }
        resolve();
      };
      
      utterance.onerror = () => {
        setError('Errore sintesi vocale');
        setStatus('idle');
        resolve();
      };
      
      speechSynthesis.speak(utterance);
    });
  };

  const startListening = useCallback(async () => {
    try {
      setStatus('listening');
      setError(null);
      audioChunksRef.current = [];

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus',
      });
      
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach(track => track.stop());
        
        if (audioChunksRef.current.length > 0) {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          await processAudio(audioBlob);
        }
      };

      mediaRecorder.start();
    } catch (err) {
      console.error('Microphone error:', err);
      setError('Permesso microfono negato');
      setStatus('idle');
    }
  }, []);

  const stopListening = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setStatus('processing');
    }
  }, []);

  const processAudio = async (audioBlob: Blob) => {
    try {
      setStatus('processing');

      // Speech-to-text
      const formData = new FormData();
      formData.append('audio', audioBlob);

      const sttResponse = await fetch('/api/speech-to-text', {
        method: 'POST',
        body: formData,
      });

      const sttData = await sttResponse.json();
      
      if (!sttData.transcript || sttData.transcript.trim() === '') {
        // Nessun audio rilevato, riprova
        startListening();
        return;
      }

      const userMessage = sttData.transcript;
      const newMessages: Message[] = [...messages, { role: 'user', content: userMessage }];
      setMessages(newMessages);

      // Chat con Claude
      const chatResponse = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      });

      const chatData = await chatResponse.json();
      
      if (chatData.isComplete) {
        setIsComplete(true);
      }

      if (chatData.response) {
        setMessages([...newMessages, { role: 'assistant', content: chatData.response }]);
        await speakText(chatData.response);
      }
    } catch (err) {
      console.error('Process error:', err);
      setError('Errore di elaborazione');
      setStatus('idle');
    }
  };

  return (
    <main className="min-h-screen bg-black flex flex-col items-center justify-center p-8">
      {/* Stato visivo minimo */}
      <div className="flex flex-col items-center gap-8">
        
        {/* Indicatore di stato */}
        <AnimatePresence mode="wait">
          {status === 'listening' && (
            <motion.div
              key="listening"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="flex flex-col items-center gap-4"
            >
              {/* Cerchio pulsante - ascolto */}
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="w-24 h-24 rounded-full bg-white/10 border border-white/30
                          flex items-center justify-center cursor-pointer"
                onClick={stopListening}
              >
                <div className="w-4 h-4 rounded-full bg-white" />
              </motion.div>
              <p className="text-gray-500 text-sm">Tocca quando hai finito</p>
            </motion.div>
          )}

          {status === 'speaking' && (
            <motion.div
              key="speaking"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="flex flex-col items-center gap-4"
            >
              {/* Onda sonora stilizzata */}
              <div className="flex items-center gap-1 h-24">
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{ height: [20, 40 + i * 10, 20] }}
                    transition={{ 
                      repeat: Infinity, 
                      duration: 0.8,
                      delay: i * 0.1,
                    }}
                    className="w-2 bg-white/50 rounded-full"
                  />
                ))}
              </div>
            </motion.div>
          )}

          {status === 'processing' && (
            <motion.div
              key="processing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-4"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
                className="w-24 h-24 rounded-full border border-white/20 border-t-white/60"
              />
            </motion.div>
          )}

          {status === 'idle' && !isComplete && (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-4"
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-24 h-24 rounded-full bg-white/5 border border-white/20
                          flex items-center justify-center cursor-pointer"
                onClick={startListening}
              >
                <div className="w-4 h-4 rounded-full bg-white/50" />
              </motion.div>
              <p className="text-gray-500 text-sm">Tocca per parlare</p>
            </motion.div>
          )}

          {isComplete && (
            <motion.div
              key="complete"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <p className="text-white text-lg">Grazie.</p>
              <p className="text-gray-500 mt-2">Riceverai presto una risposta.</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Errore */}
        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-red-400 text-sm"
          >
            {error}
          </motion.p>
        )}
      </div>
    </main>
  );
}
