export type EntryType =
  | "research"
  | "script"
  | "scenes"
  | "image_search"
  | "selected_images"
  | "voice"
  | "video"
  | "thumbnail"
  | "seo"
  | "log"
  | "upload_history";

export interface Project {
  id: string;
  title: string;
  topic: string;
  status: string;
  progress: number;
  created_at: string;
  updated_at: string;
}

export interface ProjectEntry {
  id: string;
  project_id: string;
  entry_type: EntryType;
  data: Record<string, unknown>;
  created_at: string;
}

export interface ResearchIdea {
  title: string;
  angle: string;
  difficulty: number;
  virality: number;
  competition: number;
  estimatedViews: number;
}

export interface ScriptSection {
  section: string;
  content: string;
}

export interface SceneItem {
  index: number;
  narration: string;
  visual: string;
  transition: string;
  durationSec: number;
}

export interface ThumbnailConcept {
  headline: string;
  prompt: string;
  ctr: number;
  colors: string[];
}

export interface SeoSet {
  titles: string[];
  description: string;
  tags: string[];
  hashtags: string[];
  keywords: string[];
  seoScore: number;
}

export interface PexelsResult {
  id: string;
  type: "image" | "video";
  title: string;
  url: string;
  thumb: string;
  fullUrl?: string;
  source: string;
  license: string;
  photographer?: string;
  photographerUrl?: string;
  avgColor?: string;
  width?: number;
  height?: number;
  duration?: number;
}
