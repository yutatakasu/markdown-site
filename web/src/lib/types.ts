// Shared types for the web app

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
