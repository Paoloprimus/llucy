# llucy 🪞

**Il tuo specchio intelligente** · *Io rifletto con te*

[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![Expo](https://img.shields.io/badge/Expo-52-blue)](https://expo.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-Postgres-green)](https://supabase.com/)

---

## 🚀 Quick Start

```bash
# 1. Clone e setup
git clone https://github.com/TUO_USERNAME/llucy.git
cd llucy
npm run setup

# 2. Configura servizi (5-10 min)
# Segui: QUICK_START.md

# 3. Sviluppo
npm run web:dev      # Landing page su localhost:3000
npm run app:start    # App React Native su Expo Go
```

---

## 📁 Struttura

```
llucy/
├── web/              Next.js (llucy.it)
├── app/              Expo React Native (iOS/Android)
├── shared/           TypeScript types condivisi
├── supabase/         Database migrations
│
├── CONCEPT.md        🎯 Vision e filosofia
├── SETUP_GUIDE.md    📖 Setup completo dettagliato
├── QUICK_START.md    ⚡ Checklist rapida
└── API_INTEGRATION.md 🎙️ Voice APIs guide
```

---

## 🛠️ Stack

- **Web:** Next.js 15, React 19, Tailwind CSS 4
- **Mobile:** Expo 52, React Native
- **Database:** Supabase (PostgreSQL)
- **Voice:** Deepgram (STT), Claude 3.5 (LLM), ElevenLabs (TTS)
- **Hosting:** Vercel

---

## 📚 Documentazione

| File | Contenuto |
|------|-----------|
| [CONCEPT.md](./CONCEPT.md) | Vision, filosofia, UX design |
| [SETUP_GUIDE.md](./SETUP_GUIDE.md) | Setup completo step-by-step |
| [QUICK_START.md](./QUICK_START.md) | Checklist rapida 30 min |
| [API_INTEGRATION.md](./API_INTEGRATION.md) | Integrazione voice APIs |

---

## 🎯 Roadmap

### ✅ STEP 1: Foundation (Settimana 1)
- [x] Mono-repo structure
- [x] Next.js landing page
- [x] Expo app base
- [x] Supabase schema
- [ ] Deploy Vercel
- [ ] API keys setup

### 🔄 STEP 2: Voice Pipeline (Settimana 2)
- [ ] Deepgram integration
- [ ] Claude integration
- [ ] ElevenLabs integration
- [ ] Salvataggio conversazioni
- [ ] Test voice quality

### 🎨 STEP 3: Polish (Settimane 3-4)
- [ ] Camera effetti specchio
- [ ] Visual refinements
- [ ] Settings page
- [ ] Beta TestFlight

---

## 💰 Costs (Beta Estimate)

**Per utente/mese (1 sessione/giorno):**
- Deepgram: $1.80
- Claude: $4.50
- ElevenLabs: $9.00
- **Total:** ~$15/utente/mese

**Beta 10 utenti:** ~$150/mese

---

## 🔐 Security

- ✅ API keys solo nel backend
- ✅ Row Level Security (RLS) su Supabase
- ✅ Environment variables
- ✅ Audio files temporanei

---

## 📱 Platforms

- **iOS:** 15.0+
- **Android:** API 21+
- **Web:** Modern browsers

---

## 🤝 Contributing

Progetto privato in beta chiusa.

---

## 📄 License

Private - All rights reserved

---

**llucy.it** · Made with 🪞 and 🤖 · 2026
