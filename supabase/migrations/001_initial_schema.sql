-- llucy Database Schema
-- Initial migration: Users, Sessions, Conversations, Insights

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- USERS TABLE
-- =====================================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  
  -- Dati da form onboarding
  screening_data JSONB DEFAULT '{}'::jsonb,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_active TIMESTAMPTZ DEFAULT NOW(),
  
  -- Preferences
  preferences JSONB DEFAULT '{
    "voice_type": "neutral",
    "mirror_intensity": 0.5
  }'::jsonb
);

-- Index per performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_last_active ON users(last_active);

-- =====================================================
-- SESSIONS TABLE
-- =====================================================
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Timing
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  duration_seconds INTEGER,
  
  -- Metadata
  device_info JSONB,
  
  -- Computed
  conversation_count INTEGER DEFAULT 0
);

-- Index
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_started_at ON sessions(started_at DESC);

-- =====================================================
-- CONVERSATIONS TABLE
-- Salva TUTTO quello che si dice
-- =====================================================
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Chi parla
  speaker TEXT NOT NULL CHECK (speaker IN ('user', 'llucy')),
  
  -- Contenuto
  text TEXT NOT NULL,
  
  -- Audio metadata
  audio_duration_ms INTEGER,
  
  -- Timing
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  
  -- AI-generated metadata
  metadata JSONB DEFAULT '{
    "sentiment": null,
    "keywords": [],
    "themes": []
  }'::jsonb
);

-- Index per performance (queries frequenti)
CREATE INDEX idx_conversations_session_id ON conversations(session_id);
CREATE INDEX idx_conversations_user_id ON conversations(user_id);
CREATE INDEX idx_conversations_timestamp ON conversations(timestamp DESC);
CREATE INDEX idx_conversations_speaker ON conversations(speaker);

-- =====================================================
-- INSIGHTS TABLE
-- Pattern e temi identificati dall'AI
-- =====================================================
CREATE TABLE insights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Il tema/pattern
  theme TEXT NOT NULL,
  description TEXT,
  
  -- Conversazioni correlate
  related_conversation_ids UUID[] DEFAULT ARRAY[]::UUID[],
  
  -- Confidence AI
  confidence FLOAT CHECK (confidence >= 0 AND confidence <= 1),
  
  -- Tracking temporale
  first_seen TIMESTAMPTZ DEFAULT NOW(),
  last_seen TIMESTAMPTZ DEFAULT NOW(),
  frequency INTEGER DEFAULT 1,
  
  -- Livello (razionale/emotivo/esistenziale)
  level TEXT CHECK (level IN ('rational', 'emotional', 'existential'))
);

-- Index
CREATE INDEX idx_insights_user_id ON insights(user_id);
CREATE INDEX idx_insights_theme ON insights(theme);
CREATE INDEX idx_insights_last_seen ON insights(last_seen DESC);
CREATE INDEX idx_insights_level ON insights(level);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- Gli utenti vedono solo i PROPRI dati
-- =====================================================

-- Enable RLS su tutte le tabelle
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE insights ENABLE ROW LEVEL SECURITY;

-- USERS policies
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- SESSIONS policies
CREATE POLICY "Users can view own sessions"
  ON sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sessions"
  ON sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions"
  ON sessions FOR UPDATE
  USING (auth.uid() = user_id);

-- CONVERSATIONS policies
CREATE POLICY "Users can view own conversations"
  ON conversations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own conversations"
  ON conversations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- INSIGHTS policies
CREATE POLICY "Users can view own insights"
  ON insights FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own insights"
  ON insights FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own insights"
  ON insights FOR UPDATE
  USING (auth.uid() = user_id);

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function: Update last_active quando user fa una sessione
CREATE OR REPLACE FUNCTION update_user_last_active()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE users
  SET last_active = NEW.started_at
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_last_active
  AFTER INSERT ON sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_user_last_active();

-- Function: Update conversation_count in session
CREATE OR REPLACE FUNCTION update_session_conversation_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE sessions
  SET conversation_count = (
    SELECT COUNT(*)
    FROM conversations
    WHERE session_id = NEW.session_id
  )
  WHERE id = NEW.session_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_conversation_count
  AFTER INSERT ON conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_session_conversation_count();

-- =====================================================
-- VIEWS (per query complesse)
-- =====================================================

-- View: Recent conversations con user info
CREATE VIEW recent_conversations_with_users AS
SELECT 
  c.*,
  u.email,
  s.started_at as session_started
FROM conversations c
JOIN users u ON c.user_id = u.id
JOIN sessions s ON c.session_id = s.id
ORDER BY c.timestamp DESC;

-- View: User insights summary
CREATE VIEW user_insights_summary AS
SELECT 
  user_id,
  COUNT(*) as total_insights,
  COUNT(DISTINCT theme) as unique_themes,
  MAX(last_seen) as most_recent_insight
FROM insights
GROUP BY user_id;

-- =====================================================
-- SEED DATA (opzionale, per testing)
-- =====================================================

-- Uncomment per avere un utente di test
-- INSERT INTO users (email, screening_data) VALUES
-- ('test@llucy.it', '{"age": 30, "purpose": "self_reflection"}'::jsonb);

-- =====================================================
-- SUCCESS
-- =====================================================

-- Se vedi questo, il migration è andato a buon fine! ✅
SELECT 'llucy database schema created successfully! 🪞' as status;
