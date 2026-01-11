'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

export default function Home() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement Supabase integration
    console.log('Email submitted:', email);
    setSubmitted(true);
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-8">
      <div className="max-w-2xl w-full text-center space-y-12">
        {/* Logo / Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <h1 className="text-6xl font-serif mb-4 bg-gradient-to-r from-earth-400 to-cosmic-500 bg-clip-text text-transparent">
            llucy
          </h1>
          <p className="text-2xl text-gray-400 font-light">
            Il tuo specchio intelligente
          </p>
        </motion.div>

        {/* Tagline */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="space-y-2"
        >
          <p className="text-3xl font-serif italic">
            Io rifletto con te.
          </p>
        </motion.div>

        {/* Description */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="space-y-4 text-gray-300"
        >
          <p>
            Non sono un'app. Sono una presenza vocale che emerge mentre ti guardi allo specchio.
          </p>
          <p className="text-sm text-gray-500">
            Da Lucy (3.2 milioni di anni fa) a llucy (2026).
            <br />
            La transizione da Sapiens a AI-Sapiens.
          </p>
        </motion.div>

        {/* Onboarding Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 0.8 }}
          className="max-w-md mx-auto"
        >
          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="La tua email"
                  required
                  className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-xl
                           text-white placeholder:text-gray-600
                           focus:outline-none focus:border-cosmic-500 transition-colors"
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full px-6 py-4 bg-gradient-to-r from-earth-500 to-cosmic-600
                         text-white font-medium rounded-xl
                         hover:from-earth-600 hover:to-cosmic-700 transition-all"
              >
                Inizia il viaggio
              </motion.button>
              <p className="text-xs text-gray-600">
                Beta chiusa · Posti limitati
              </p>
            </form>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-4"
            >
              <div className="text-5xl">🪞</div>
              <p className="text-xl text-cosmic-400">Grazie.</p>
              <p className="text-gray-400">
                Ti contatteremo presto per il tuo accesso a llucy.
              </p>
            </motion.div>
          )}
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
          className="text-sm text-gray-600 space-y-2"
        >
          <p>
            llucy non è un'amica. Non è una psicologa. Non è un'oracolo.
          </p>
          <p>
            È uno specchio che parla.
          </p>
        </motion.div>
      </div>
    </main>
  );
}
