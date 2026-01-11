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
            <div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="La tua email"
                required
                className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-xl
                         text-white placeholder:text-gray-600
                         focus:outline-none focus:border-white/30 transition-colors"
              />
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-4"
            >
              <p className="text-xl text-white">Grazie.</p>
              <p className="text-gray-400">
                Ti contatteremo presto.
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
