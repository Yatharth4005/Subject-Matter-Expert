// ============================================
// SME Agent Platform — Type Definitions
// ============================================

// Agent types
export interface AgentConfig {
  slug: string;
  displayName: string;
  description: string;
  icon: string;
  color: string;
  category: 'subject' | 'creative' | 'navigator';
}

// WebSocket message types
export type WSMessageType =
  | 'audio'
  | 'text'
  | 'video_url'
  | 'web_search'
  | 'audio_response'
  | 'text_response'
  | 'web_content'
  | 'story_chunk'
  | 'suggestions'
  | 'error';

export interface SuggestionItem {
  title: string;
  url: string;
  type: 'youtube' | 'doc' | 'web';
  thumbnail?: string;
}

export interface WSMessage {
  type: WSMessageType;
  data?: string;
  content?: string;
  url?: string;
  query?: string;
  audio?: string;
  text?: string;
  screenshot?: string;
  summary?: string;
  imageUrl?: string;
  is_chunk?: boolean;
  items?: SuggestionItem[];
}

// Dashboard stats
export interface StatsData {
  totalSessions: number;
  totalMessages: number;
  avgDuration: number; // in minutes
  favoriteAgent: string;
  dailySessions: number[];
  weeklyChange: {
    sessions: number;
    messages: number;
    duration: number;
  };
}

// Conversation types
export interface Conversation {
  id: string;
  agentSlug: string;
  title: string;
  startedAt: string;
  endedAt?: string;
  messageCount: number;
}

export interface Message {
  id: string;
  role: 'user' | 'agent';
  contentType: 'text' | 'audio' | 'video' | 'image' | 'screenshot';
  content?: string;
  audioUrl?: string;
  mediaUrl?: string;
  createdAt: string;
}

// Story chunk for Creative Storyteller
export interface StoryChunk {
  type: 'text' | 'image';
  content: string; // text content or base64/URL for image
}
