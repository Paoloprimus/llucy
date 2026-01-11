# ✅ QUICK START CHECKLIST

Tutto quello che devi fare per mettere online llucy.

---

## 📋 Checklist Completa

### 1. Supabase (5 min)

- [ ] Vai su https://supabase.com
- [ ] Crea progetto "llucy"
- [ ] Esegui migration SQL (copia `/supabase/migrations/001_initial_schema.sql`)
- [ ] Copia URL + anon key
- [ ] Incolla in `web/.env.local` e `app/.env`

### 2. GitHub (2 min)

- [ ] Vai su https://github.com/new
- [ ] Nome: `llucy`, Private
- [ ] Nel terminale:
```bash
cd /Users/paolo.olivato/Desktop/llucy
git init
git add .
git commit -m "🪞 Initial commit"
git remote add origin https://github.com/TUO_USERNAME/llucy.git
git push -u origin main
```

### 3. Vercel (3 min)

- [ ] Vai su https://vercel.com
- [ ] Import progetto GitHub `llucy`
- [ ] Root Directory: `web`
- [ ] Aggiungi environment variables (da `web/env.template`)
- [ ] Deploy

### 4. API Keys (10 min)

**Deepgram:**
- [ ] https://console.deepgram.com/signup
- [ ] Crea API key
- [ ] Aggiungi a `web/.env.local`

**Anthropic:**
- [ ] https://console.anthropic.com/
- [ ] Crea API key
- [ ] Aggiungi a `web/.env.local`

**ElevenLabs:**
- [ ] https://elevenlabs.io/sign-up
- [ ] Crea API key
- [ ] Scegli voice (Aria consigliata)
- [ ] Aggiungi key + voice_id a `web/.env.local`

### 5. DNS (2 min)

**Tophost:**
- [ ] Login https://tophost.it
- [ ] DNS llucy.it
- [ ] Aggiungi CNAME: `@` → `cname.vercel-dns.com`
- [ ] Aggiungi CNAME: `settings` → `cname.vercel-dns.com`
- [ ] Aspetta propagazione (10-30 min)

### 6. Test (5 min)

**Web:**
```bash
cd web
npm install
npm run dev
```
- [ ] Apri http://localhost:3000
- [ ] Vedi landing page

**App:**
```bash
cd app
npm install
npm start
```
- [ ] Scansiona QR con Expo Go
- [ ] Vedi app

---

## 🎉 FATTO!

Ora hai:
- ✅ Codice base completo
- ✅ Database configurato
- ✅ Landing page online
- ✅ App funzionante

**Prossimi step:**
1. Integra voice APIs (vedi `API_INTEGRATION.md`)
2. Build TestFlight per iOS
3. Beta testing

---

**Tempo totale: ~30 minuti** ⏱️
