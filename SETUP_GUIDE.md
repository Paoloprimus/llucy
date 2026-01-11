# 🎯 SETUP GUIDE - llucy

Guida completa per mettere online llucy in **30 minuti**.

---

## ✅ CHECKLIST

- [ ] 1. Supabase (5 min)
- [ ] 2. GitHub Repository (2 min)
- [ ] 3. Vercel Deploy (3 min)
- [ ] 4. API Keys (10 min)
- [ ] 5. DNS Configuration (2 min)
- [ ] 6. Test Locale (5 min)

---

## 1️⃣ SUPABASE (Database)

### Step 1: Crea Progetto
1. Vai su: https://supabase.com
2. Click **"Start your project"** → Sign in con GitHub
3. Click **"New project"**
4. Compila:
   - **Name:** `llucy`
   - **Database Password:** (genera sicura, salvala!)
   - **Region:** Europe (Italy/Germany)
5. Click **"Create new project"** (ci vogliono ~2 min)

### Step 2: Esegui Migrations
1. Nel progetto Supabase, vai su **SQL Editor** (menu laterale)
2. Click **"New query"**
3. Copia e incolla il contenuto di `/supabase/migrations/001_initial_schema.sql`
4. Click **"Run"**
5. Dovresti vedere: ✅ Success

### Step 3: Copia Credenziali
1. Vai su **Project Settings** (icona ingranaggio in basso a sinistra)
2. Click **API** nel menu
3. Copia e salva:
   - **Project URL** (es. `https://xxxxx.supabase.co`)
   - **anon public key** (lunga stringa che inizia con `eyJ...`)

### Step 4: Configura `.env`
Nel tuo computer:

```bash
cd /Users/paolo.olivato/Desktop/llucy/web
```

Crea file `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

Stessa cosa per `/app`:
```bash
cd /Users/paolo.olivato/Desktop/llucy/app
```

Crea file `.env`:
```env
EXPO_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

✅ **FATTO!**

---

## 2️⃣ GITHUB REPOSITORY

### Step 1: Crea Repo
1. Vai su: https://github.com/new
2. Compila:
   - **Repository name:** `llucy`
   - **Description:** `🪞 Il tuo specchio intelligente`
   - **Private** (selezionato)
3. Click **"Create repository"**

### Step 2: Push Codice
Nel terminale:

```bash
cd /Users/paolo.olivato/Desktop/llucy
git init
git add .
git commit -m "🪞 Initial commit - llucy"
git branch -M main
git remote add origin https://github.com/TUO_USERNAME/llucy.git
git push -u origin main
```

(Sostituisci `TUO_USERNAME` con il tuo username GitHub)

✅ **FATTO!**

---

## 3️⃣ VERCEL DEPLOY

### Step 1: Connetti GitHub
1. Vai su: https://vercel.com
2. Click **"Sign Up"** → Continue with GitHub
3. Autorizza Vercel

### Step 2: Import Progetto Web
1. Click **"Add New..."** → Project
2. Select il repo **`llucy`**
3. Vercel rileva Next.js automaticamente
4. **IMPORTANTE:** Cambia **Root Directory** → `web`
5. Click **"Environment Variables"** e aggiungi:
   ```
   NEXT_PUBLIC_SUPABASE_URL = https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJ...
   ```
6. Click **"Deploy"**

Aspetta 2-3 minuti... ✅ Deployed!

### Step 3: Copia URL
Vercel ti darà un URL tipo: `https://llucy-xxxx.vercel.app`

### Step 4: Deploy Settings (opzionale)
1. Vai su Project Settings → Domains
2. Aggiungi dominio custom: `llucy.it` (lo configureremo dopo)
3. Per `settings.llucy.it`:
   - Importa di nuovo il progetto
   - Root directory → `web`
   - Deploy su subdomain separato

✅ **FATTO!**

---

## 4️⃣ API KEYS

### 4.1 Deepgram (Speech-to-Text)

1. Vai su: https://console.deepgram.com/signup
2. Sign up (free $200 credit)
3. Vai su **API Keys** (menu laterale)
4. Click **"Create a New API Key"**
5. Name: `llucy-production`
6. Copia la key (inizia con `DG...`)

Aggiungi a `.env.local` (web) e `.env` (app):
```env
DEEPGRAM_API_KEY=DG...
```

**Costi:** $0.0043/min (~$0.06 per sessione 15 min)

### 4.2 Anthropic Claude (LLM)

1. Vai su: https://console.anthropic.com/
2. Sign up
3. Vai su **API Keys**
4. Click **"Create Key"**
5. Name: `llucy`
6. Copia la key (inizia con `sk-ant...`)

Aggiungi a `.env.local`:
```env
ANTHROPIC_API_KEY=sk-ant...
```

**Costi:** ~$0.15 per sessione 15 min

⚠️ **IMPORTANTE:** Questa key VA SOLO nel backend (web/.env.local), MAI nell'app!

### 4.3 ElevenLabs (Text-to-Speech)

1. Vai su: https://elevenlabs.io/sign-up
2. Sign up (free tier: 10k chars/month)
3. Vai su **Profile Settings** → API Keys
4. Click **"Create API Key"**
5. Copia la key

Aggiungi a `.env.local`:
```env
ELEVENLABS_API_KEY=...
```

**Costi:** $0.18 per sessione 15 min (Turbo v2)

### 4.4 Scegli Voce llucy

1. Vai su: https://elevenlabs.io/voice-library
2. Ascolta voci disponibili
3. Scegli una voce (es. "Aria" - calma, neutra)
4. Copia il **Voice ID** (trovi nell'URL o nei dettagli voce)

Aggiungi a `.env.local`:
```env
ELEVENLABS_VOICE_ID=21m00Tcm4TlvDq8ikWAM
```

✅ **FATTO!**

---

## 5️⃣ DNS CONFIGURATION

### Configura llucy.it su Tophost

1. Login su Tophost: https://tophost.it
2. Vai su **Gestione DNS** del dominio `llucy.it`
3. Aggiungi questi record:

**Per llucy.it (app principale):**
```
Type: CNAME
Name: @
Value: cname.vercel-dns.com
TTL: 3600
```

**Per settings.llucy.it:**
```
Type: CNAME
Name: settings
Value: cname.vercel-dns.com
TTL: 3600
```

4. Salva modifiche
5. Aspetta 10-30 min per propagazione DNS

### Verifica Dominio su Vercel

1. Torna su Vercel → Project Settings → Domains
2. Aggiungi `llucy.it`
3. Vercel verificherà automaticamente (potrebbe servire qualche minuto)
4. Quando vedi ✅ sei online!

✅ **FATTO!**

---

## 6️⃣ TEST LOCALE

### Test Web (Landing Page)

```bash
cd /Users/paolo.olivato/Desktop/llucy/web
npm run dev
```

Apri: http://localhost:3000

Dovresti vedere la landing page di llucy.

### Test App (React Native)

```bash
cd /Users/paolo.olivato/Desktop/llucy/app
npm start
```

1. Installa **Expo Go** sul tuo iPhone
   - App Store: https://apps.apple.com/app/expo-go/id982107779
2. Scansiona il QR code che appare nel terminale
3. L'app si aprirà su Expo Go

⚠️ **Per testare voce/camera:** serve build nativa (TestFlight), Expo Go ha limitazioni.

✅ **TUTTO PRONTO!**

---

## 🎉 COMPLIMENTI!

Hai configurato tutto! 

### Prossimi Step:

1. ✅ Verifica che llucy.it sia raggiungibile
2. ✅ Testa onboarding form su llucy.it
3. ✅ Testa voice flow nell'app (Expo Go per debug)
4. 🚀 Quando pronto: build TestFlight per beta tester

---

## 🆘 Problemi?

### Supabase non connette
- Controlla che `.env` abbia le credenziali giuste
- Verifica RLS policies nel dashboard Supabase

### Vercel build fallisce
- Controlla logs nel Vercel dashboard
- Verifica che tutte le env variables siano settate

### DNS non funziona
- Aspetta 30-60 min per propagazione
- Verifica con: https://dnschecker.org

### App non parte
- Controlla che Expo Go sia aggiornato
- Prova: `cd app && npm start -- --clear`

---

**Hai finito il setup? Sei pronto per sviluppare llucy! 🪞✨**
