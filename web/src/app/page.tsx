'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';

export default function Home() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { error: insertError } = await supabase
        .from('waitlist')
        .insert({ email });

      if (insertError) {
        if (insertError.code === '23505') {
          // Email già presente
          setError('Questa email è già in lista.');
        } else {
          setError('Qualcosa è andato storto. Riprova.');
        }
        return;
      }

      setSubmitted(true);
    } catch {
      setError('Errore di connessione. Riprova.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="max-w-md w-full text-center flex-1 flex flex-col justify-center">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="mb-16"
        >
          <h1 className="text-5xl font-bold text-white">
            Io sono llucy
          </h1>
        </motion.div>

        {/* Email Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="w-full"
        >
          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="La tua email"
                required
                disabled={loading}
                className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-xl
                         text-white placeholder:text-gray-600
                         focus:outline-none focus:border-white/30 transition-colors
                         disabled:opacity-50"
              />
              {error && (
                <p className="text-red-400 text-sm">{error}</p>
              )}
              <button
                type="submit"
                disabled={loading || !email}
                className="w-full px-6 py-4 bg-white/10 hover:bg-white/20 
                         border border-white/20 rounded-xl text-white
                         transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '...' : 'Entra in lista'}
              </button>
            </form>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-4"
            >
              <p className="text-xl text-white">Grazie.</p>
              <p className="text-gray-400">
                Ti contatterò presto.
              </p>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="pb-8 text-center space-y-2"
      >
        <p className="text-sm text-gray-500">
          Beta su invito
        </p>
        <p className="text-sm text-gray-600">
          © 2026 llucy
        </p>
      </motion.footer>
    </main>
  );
}
