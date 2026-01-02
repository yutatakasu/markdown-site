import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for clips data
export interface HighlightAnchor {
  xpath: string;
  text_offset: number;
  text_length: number;
  text_content: string;
}

export interface Highlight {
  id: string;
  article_id: string;
  user_id: string;
  selected_text: string;
  comment: string;
  position: number;
  anchor: HighlightAnchor;
  created_at: string;
  updated_at: string;
}

export interface Article {
  id: string;
  user_id: string;
  url: string;
  title: string;
  domain: string;
  summary: string | null;
  summary_status: 'pending' | 'completed' | 'failed';
  tags: string[];
  highlight_count: number;
  created_at: string;
  updated_at: string;
  highlights?: Highlight[];
}

export interface Folder {
  tag: string;
  article_count: number;
}

// Hardcoded user ID (same as web app)
export const USER_ID = '00000000-0000-0000-0000-000000000001';
