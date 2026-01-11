// llucy Shared Types
// Used by both web and app

export interface User {
  id: string;
  email: string;
  phone?: string;
  screening_data?: Record<string, any>;
  created_at: string;
  last_active: string;
  preferences: UserPreferences;
}

export interface UserPreferences {
  voice_type: 'neutral' | 'female' | 'male';
  mirror_intensity: number; // 0-1
}

export interface Session {
  id: string;
  user_id: string;
  started_at: string;
  ended_at?: string;
  duration_seconds?: number;
  device_info?: Record<string, any>;
  conversation_count: number;
}

export type Speaker = 'user' | 'llucy';

export interface Conversation {
  id: string;
  session_id: string;
  user_id: string;
  speaker: Speaker;
  text: string;
  audio_duration_ms?: number;
  timestamp: string;
  metadata?: ConversationMetadata;
}

export interface ConversationMetadata {
  sentiment?: 'positive' | 'negative' | 'neutral';
  keywords?: string[];
  themes?: string[];
}

export type InsightLevel = 'rational' | 'emotional' | 'existential';

export interface Insight {
  id: string;
  user_id: string;
  theme: string;
  description?: string;
  related_conversation_ids: string[];
  confidence: number; // 0-1
  first_seen: string;
  last_seen: string;
  frequency: number;
  level: InsightLevel;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

// Voice API types
export interface TranscriptionResult {
  text: string;
  confidence: number;
  duration_ms: number;
}

export interface LLMResponse {
  text: string;
  model: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
  };
}

export interface TTSResult {
  audio_url?: string;
  audio_base64?: string;
  duration_ms: number;
}
