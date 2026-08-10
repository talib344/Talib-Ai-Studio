import { supabase } from "./supabaseClient";
import type {
  ResearchIdea,
  ScriptSection,
  SceneItem,
  ThumbnailConcept,
  SeoSet,
  PexelsResult,
} from "./types";

function edgeUrl(slug: string): string {
  return `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/${slug}`;
}

async function callEdge<T>(slug: string, payload: unknown): Promise<T> {
  const res = await fetch(edgeUrl(slug), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json?.error || `Request failed (${res.status})`);
  }
  return json as T;
}

// ---- Gemini ---------------------------------------------------------------

export async function geminiResearch(params: {
  keyword: string;
  country: string;
  language: string;
  length: string;
}): Promise<{ ideas: ResearchIdea[] }> {
  return callEdge("gemini", { task: "research", params });
}

export async function geminiScript(params: {
  topic: string;
  angle: string;
  durationMin: number;
  tone: string;
}): Promise<{ scenes: ScriptSection[]; wordCount: number; estimatedSeconds: number }> {
  return callEdge("gemini", { task: "script", params });
}

export async function geminiScenes(params: {
  topic: string;
  count: number;
}): Promise<{ scenes: SceneItem[] }> {
  return callEdge("gemini", { task: "scenes", params });
}

export async function geminiThumbnails(params: {
  topic: string;
  count: number;
}): Promise<{ thumbnails: ThumbnailConcept[] }> {
  return callEdge("gemini", { task: "thumbnail", params });
}

export async function geminiSeo(params: {
  topic: string;
}): Promise<SeoSet> {
  return callEdge("gemini", { task: "seo", params });
}

export async function geminiTrend(params: {
  topic: string;
}): Promise<{ rising: string[]; saturated: string[]; underexplored: string[]; recommendation: string }> {
  return callEdge("gemini", { task: "trend", params });
}

export async function geminiRecommend(params: {
  views?: string;
  topVideos?: string;
}): Promise<{ recommendations: { title: string; reason: string; potentialScore: number }[] }> {
  return callEdge("gemini", { task: "recommend", params });
}

export async function geminiRewrite(text: string): Promise<{ text: string }> {
  return callEdge("gemini", { task: "rewrite", params: { text } });
}

export async function geminiExpand(text: string): Promise<{ text: string }> {
  return callEdge("gemini", { task: "expand", params: { text } });
}

export async function geminiTranslate(text: string, targetLang: string): Promise<{ text: string }> {
  return callEdge("gemini", { task: "translate", params: { text, targetLang } });
}

export async function geminiImageKeywords(query: string, scene: string): Promise<{ keywords: string[] }> {
  return callEdge("gemini", { task: "image_keywords", params: { query, scene } });
}

// ---- Pexels ---------------------------------------------------------------

export async function pexelsSearch(params: {
  query: string;
  type?: "image" | "video";
  perPage?: number;
}): Promise<{ results: PexelsResult[] }> {
  return callEdge("pexels", params);
}

// ---- TTS (browser SpeechSynthesis) ---------------------------------------

export interface TTSConfig {
  voice: SpeechSynthesisVoice | null;
  rate: number;
  pitch: number;
  volume: number;
}

export function getAvailableVoices(): SpeechSynthesisVoice[] {
  return typeof speechSynthesis !== "undefined" ? speechSynthesis.getVoices() : [];
}

export function speak(text: string, config: TTSConfig, onEnd?: () => void): void {
  if (typeof speechSynthesis === "undefined") return;
  speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  if (config.voice) utter.voice = config.voice;
  utter.rate = config.rate;
  utter.pitch = config.pitch;
  utter.volume = config.volume;
  if (onEnd) utter.onend = onEnd;
  speechSynthesis.speak(utter);
}

export function stopSpeaking(): void {
  if (typeof speechSynthesis !== "undefined") speechSynthesis.cancel();
}
