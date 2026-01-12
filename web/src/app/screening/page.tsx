'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';

type Status = 'waiting' | 'idle' | 'listening' | 'processing' | 'speaking' | 'paused';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function ScreeningPage() {
  const [status, setStatus] = useState<Status>('waiting');
  const [error, setError] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  
  const messagesRef = useRef<Message[]>([]);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const isCompleteRef = useRef(false);
  const sessionIdRef = useRef<string | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    isCompleteRef.current = isComplete;
  }, [isComplete]);

  useEffect(() => {
    speechSynthesis.getVoices();
  }, []);

  // Salva la sessione nel database
  const saveSession = async (finalStatus?: string) => {
    try {
      const isCompleted = finalStatus === 'completed';
      
      const sessionData = {
        transcript: messagesRef.current,
        status: finalStatus || 'in_progress',
        ...(isCompleted && { completed_at: new Date().toISOString() }),
      };

      if (sessionIdRef.current) {
        const { error } = await supabase
          .from('screening_sessions')
          .update(sessionData)
          .eq('id', sessionIdRef.current);
        
        if (error) console.error('Update error:', error);
      } else {
        const { data, error } = await supabase
          .from('screening_sessions')
          .insert({
            ...sessionData,
            email: 'anonymous', // Per ora, poi collegheremo all'invito
          })
          .select('id')
          .single();
        
        if (error) {
          console.error('Insert error:', error);
        } else if (data) {
          sessionIdRef.current = data.id;
        }
      }
    } catch (err) {
      console.error('Save session error:', err);
    }
  };

  const startConversation = async () => {
    try {
      setStatus('processing');
      setError(null);
      
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isStart: true }),
      });

      const data = await response.json();
      if (data.response) {
        messagesRef.current = [{ role: 'assistant', content: data.response }];
        await saveSession();
        await speakText(data.response);
      }
    } catch (err) {
      console.error('Start error:', err);
      setError('Errore di connessione');
      setStatus('idle');
    }
  };

  const pauseConversation = () => {
    // Ferma tutto
    speechSynthesis.cancel();
    
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    setStatus('paused');
    saveSession('paused');
  };

  const resumeConversation = async () => {
    setStatus('processing');
    
    // llucy riprende in modo naturale
    const resumeMessage = messagesRef.current.length > 2 
      ? "Eccomi. Dove eravamo rimasti?"
      : "Rieccomi. Continuiamo?";
    
    messagesRef.current.push({ role: 'assistant', content: resumeMessage });
    await saveSession('in_progress');
    await speakText(resumeMessage);
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
      
      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
        if (!isCompleteRef.current) {
          startListening();
        } else {
          setStatus('idle');
          saveSession('completed');
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
      speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'it-IT';
      utterance.rate = 0.95;
      utterance.pitch = 1;
      
      const voices = speechSynthesis.getVoices();
      const italianVoice = voices.find(v => v.lang.startsWith('it'));
      
      if (italianVoice) {
        utterance.voice = italianVoice;
      }
      
      utterance.onend = () => {
        if (!isCompleteRef.current) {
          startListening();
        } else {
          setStatus('idle');
          saveSession('completed');
        }
        resolve();
      };
      
      utterance.onerror = (e) => {
        console.error('Speech error:', e);
        if (!isCompleteRef.current) {
          startListening();
        } else {
          setStatus('idle');
        }
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
      streamRef.current = stream;
      
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
        streamRef.current = null;
        
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

      const formData = new FormData();
      formData.append('audio', audioBlob);

      const sttResponse = await fetch('/api/speech-to-text', {
        method: 'POST',
        body: formData,
      });

      const sttData = await sttResponse.json();
      
      if (!sttData.transcript || sttData.transcript.trim() === '') {
        startListening();
        return;
      }

      const userMessage = sttData.transcript;
      
      const currentMessages = messagesRef.current;
      const newMessages: Message[] = [...currentMessages, { role: 'user', content: userMessage }];
      messagesRef.current = newMessages;

      await saveSession();

      const chatResponse = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      });

      const chatData = await chatResponse.json();
      
      if (chatData.isComplete) {
        setIsComplete(true);
        isCompleteRef.current = true;
      }

      if (chatData.response) {
        messagesRef.current = [...newMessages, { role: 'assistant', content: chatData.response }];
        await saveSession(chatData.isComplete ? 'completed' : 'in_progress');
        await speakText(chatData.response);
      }
    } catch (err) {
      console.error('Process error:', err);
      setError('Errore di elaborazione');
      setStatus('idle');
    }
  };

  const showPauseButton = status === 'speaking' || status === 'listening' || status === 'processing';

  return (
    <main className="min-h-screen bg-black flex flex-col items-center justify-center p-8 relative">
      {/* Pulsante Pausa - sempre visibile durante la conversazione */}
      {showPauseButton && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute top-8 right-8 w-12 h-12 rounded-full bg-white/5 
                    border border-white/20 flex items-center justify-center
                    hover:bg-white/10 transition-colors"
          onClick={pauseConversation}
        >
          <div className="flex gap-1">
            <div className="w-1 h-4 bg-white/50 rounded" />
            <div className="w-1 h-4 bg-white/50 rounded" />
          </div>
        </motion.button>
      )}

      <div className="flex flex-col items-center gap-8">
        
        <AnimatePresence mode="wait">
          {status === 'waiting' && (
            <motion.div
              key="waiting"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-6"
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-32 h-32 rounded-full bg-white/5 border border-white/20
                          flex items-center justify-center cursor-pointer"
                onClick={startConversation}
              >
                <div className="w-6 h-6 rounded-full bg-white/50" />
              </motion.div>
              <p className="text-gray-400">Tocca per iniziare</p>
            </motion.div>
          )}

          {status === 'paused' && (
            <motion.div
              key="paused"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-6"
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-32 h-32 rounded-full bg-white/5 border border-white/20
                          flex items-center justify-center cursor-pointer"
                onClick={resumeConversation}
              >
                {/* Play icon */}
                <div className="w-0 h-0 border-t-[12px] border-t-transparent 
                              border-l-[20px] border-l-white/50 
                              border-b-[12px] border-b-transparent ml-1" />
              </motion.div>
              <p className="text-gray-400">Tocca per riprendere</p>
            </motion.div>
          )}

          {status === 'listening' && (
            <motion.div
              key="listening"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="flex flex-col items-center gap-4"
            >
              <motion.div
                animate={{ scale: [1, 1.15, 1] }}
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
