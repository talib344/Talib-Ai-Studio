// Local generation service — simulates AI pipeline output deterministically
// so the UI is fully interactive without external API keys. The FastAPI
// backend in /backend mirrors these endpoints for real model calls.

import { delay, pseudoRandom } from "./utils";

export interface ResearchIdea {
  id: string;
  title: string;
  angle: string;
  difficulty: number;
  virality: number;
  competition: number;
  estimatedViews: number;
}

const TOPIC_ANGLES = [
  "The Untold Origin Story",
  "How It Changed the World",
  "The Hidden Conspiracy",
  "A Forgotten Tragedy",
  "Rise and Fall",
  "The Science Explained",
  "The People Behind It",
  "What Really Happened",
  "The Economic Machine",
  "Cultural Phenomenon",
];

const TOPIC_SUBJECTS = [
  "ancient civilizations",
  "tech giants",
  "the Cold War",
  "ocean mysteries",
  "space exploration",
  "economic empires",
  "forgotten empires",
  "medical breakthroughs",
  "the internet age",
  "war and revolution",
];

function seedFromString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h << 5) - h + s.charCodeAt(i);
  return Math.abs(h);
}

export async function researchTopic(params: {
  keyword: string;
  country: string;
  language: string;
  length: string;
}): Promise<ResearchIdea[]> {
  await delay(900);
  const seed = seedFromString(params.keyword + params.country + params.language);
  return Array.from({ length: 6 }).map((_, i) => {
    const r = (n: number) => Math.round(pseudoRandom(seed + i + n) * 100);
    const views = Math.round(50000 + pseudoRandom(seed + i + 5) * 4_500_000);
    return {
      id: `idea-${seed}-${i}`,
      title: `${TOPIC_ANGLES[(seed + i) % TOPIC_ANGLES.length]} — ${
        params.keyword || TOPIC_SUBJECTS[(seed + i) % TOPIC_SUBJECTS.length]
      }`,
      angle: TOPIC_ANGLES[(seed + i) % TOPIC_ANGLES.length],
      difficulty: r(1),
      virality: r(2),
      competition: r(3),
      estimatedViews: views,
    };
  });
}

export interface SceneScript {
  section: string;
  content: string;
}

export async function generateScript(params: {
  topic: string;
  angle: string;
  durationMin: number;
  tone: string;
}): Promise<{ scenes: SceneScript[]; wordCount: number; estimatedSeconds: number }> {
  await delay(1200);
  const scenes: SceneScript[] = [
    { section: "Hook", content: `What if everything you knew about ${params.topic} was only half the story? In the next ${params.durationMin} minutes, you'll see the side that was never shown.` },
    { section: "Introduction", content: `${params.topic} has shaped history in ways most people never realize. This is the ${params.angle.toLowerCase()} — told from the inside.` },
    { section: "Act 1 — Origins", content: `It started quietly. Long before the headlines, a few unlikely figures set the wheels in motion. Their decisions would ripple across decades.` },
    { section: "Act 2 — The Turning Point", content: `Then came the moment that changed everything. Pressure built, alliances shifted, and a single event forced the world to pay attention.` },
    { section: "Act 3 — Consequences", content: `The aftermath was not what anyone predicted. Some gained power, others lost everything, and the public was left to piece together the truth.` },
    { section: "Narration — Reflective", content: `Looking back, the real story was never the event itself — it was the chain of choices that led there, each one feeling small at the time.` },
    { section: "Ending", content: `${params.topic} is far from over. The patterns that built it are still moving today, hidden in plain sight.` },
    { section: "Call to Action", content: `If this changed how you see ${params.topic}, subscribe and turn on the bell — new documentaries every week.` },
  ];
  const wordCount = scenes.reduce((a, s) => a + s.content.split(/\s+/).length, 0);
  return { scenes, wordCount, estimatedSeconds: wordCount * 6 };
}

export interface Scene {
  id: string;
  index: number;
  narration: string;
  visual: string;
  transition: string;
  durationSec: number;
}

const VISUALS = [
  "Slow archival pan over vintage newspaper clippings",
  "Cinematic drone shot of a windswept coastline at dawn",
  "Close-up interview in moody low-key lighting",
  "Animated map tracing the historic trade route",
  "Reenactment silhouette against a flame-lit wall",
  "Macro shot of weathered hands turning a journal page",
  "Time-lapse of a modern skyline dissolving to 1900s streets",
  "Aerial glide over an ancient ruin at golden hour",
];
const TRANSITIONS = ["Cross dissolve", "Whip pan", "Match cut", "Fade to black", "Slow zoom", "Light leak wipe"];

export async function generateScenes(params: { topic: string; count: number }): Promise<Scene[]> {
  await delay(1000);
  const seed = seedFromString(params.topic);
  return Array.from({ length: params.count }).map((_, i) => ({
    id: `scene-${i}`,
    index: i + 1,
    narration: `Scene ${i + 1}: The narrative explores a critical dimension of ${params.topic}, drawing the viewer deeper into the story with measured pacing and rising tension.`,
    visual: VISUALS[(seed + i) % VISUALS.length],
    transition: TRANSITIONS[(seed + i) % TRANSITIONS.length],
    durationSec: 18 + Math.round(pseudoRandom(seed + i) * 22),
  }));
}

export interface ImagePrompt {
  id: string;
  scene: number;
  style: string;
  prompt: string;
}

const STYLE_MODIFIERS: Record<string, string> = {
  Realistic: "photorealistic, natural lighting, 35mm film, ultra detailed, 8k",
  Documentary: "documentary still, candid, editorial photo, shallow depth of field",
  News: "press photo, photojournalism, high contrast, on-scene, 50mm",
  War: "war photography, dramatic chiaroscuro, smoke and ash, grit, handheld",
  History: "historical reenactment, period-accurate, sepia undertones, painterly realism",
  Politics: "political editorial photo, formal composition, soft studio key light",
  Nature: "nature documentary, golden hour, sweeping landscape, crisp atmospheric haze",
};

export async function generateImagePrompts(params: {
  topic: string;
  style: string;
  count: number;
}): Promise<ImagePrompt[]> {
  await delay(1100);
  const seed = seedFromString(params.topic + params.style);
  const mod = STYLE_MODIFIERS[params.style] ?? STYLE_MODIFIERS.Realistic;
  return Array.from({ length: params.count }).map((_, i) => ({
    id: `img-${i}`,
    scene: i + 1,
    style: params.style,
    prompt: `A cinematic ${params.style.toLowerCase()} image about ${params.topic}, scene ${i + 1}, wide establishing composition, ${mod}, --ar 16:9`,
  }));
}

export interface VoiceOption {
  id: string;
  name: string;
  gender: string;
  language: string;
  description: string;
}

export const VOICE_OPTIONS: VoiceOption[] = [
  { id: "narrator-deep-m", name: "Atlas", gender: "Male", language: "English", description: "Deep documentary narrator, BBC-style gravitas" },
  { id: "narrator-warm-f", name: "Nova", gender: "Female", language: "English", description: "Warm, clear, National Geographic tone" },
  { id: "narrator-neutral", name: "Orion", gender: "Neutral", language: "English", description: "Calm, analytical, tech documentary voice" },
  { id: "narrator-arabic-m", name: "Zafar", gender: "Male", language: "Arabic", description: "Authoritative Arabic narrator, Al Jazeera style" },
  { id: "narrator-spanish-f", name: "Luna", gender: "Female", language: "Spanish", description: "Expressive Spanish documentary voice" },
  { id: "narrator-hindi-m", name: "Veer", gender: "Male", language: "Hindi", description: "Resonant Hindi narrator, cinematic pacing" },
];

export interface ThumbnailSet {
  id: string;
  headline: string;
  prompt: string;
  ctr: number;
  colors: string[];
}

export async function generateThumbnails(params: { topic: string; count: number }): Promise<ThumbnailSet[]> {
  await delay(900);
  const seed = seedFromString(params.topic);
  const palettes = [
    ["#1a5ff0", "#02a5f0", "#0b1020"],
    ["#ef4444", "#f59e0b", "#0b1020"],
    ["#10b981", "#22bdff", "#0b1020"],
    ["#f59e0b", "#ef4444", "#1a0a0a"],
  ];
  const hooks = ["THE TRUTH REVEALED", "WHAT THEY HID", "NEVER TOLD", "THE REAL STORY", "EXPOSED", "UNTOLD HISTORY"];
  return Array.from({ length: params.count }).map((_, i) => ({
    id: `thumb-${i}`,
    headline: hooks[(seed + i) % hooks.length] + ": " + (params.topic.toUpperCase().slice(0, 24)),
    prompt: `YouTube thumbnail, ${params.topic}, bold shocked face left, dramatic text right, high contrast, cinematic lighting, ${palettes[(seed + i) % palettes.length].join(", ")}`,
    ctr: Math.round((3 + pseudoRandom(seed + i) * 9) * 10) / 10,
    colors: palettes[(seed + i) % palettes.length],
  }));
}

export interface SeoSet {
  titles: string[];
  description: string;
  tags: string[];
  hashtags: string[];
  keywords: string[];
  seoScore: number;
}

export async function generateSeo(params: { topic: string }): Promise<SeoSet> {
  await delay(800);
  const seed = seedFromString(params.topic);
  return {
    titles: [
      `The ${params.topic} Documentary They Tried to Bury`,
      `${params.topic}: The Full Story Explained in 10 Minutes`,
      `What Really Happened with ${params.topic}? | Documentary`,
    ],
    description: `Discover the untold story of ${params.topic}. From hidden origins to today's consequences, this documentary reveals what the headlines missed. Subscribe for weekly deep-dives.`,
    tags: [params.topic, "documentary", "history", "explainer", "true story", `${params.topic} explained`, "mini documentary"],
    hashtags: ["#documentary", "#history", `#${params.topic.replace(/\s+/g, "")}`, "#explained", "#shorts"],
    keywords: [params.topic, `${params.topic} documentary`, `${params.topic} explained`, `${params.topic} history`, `what is ${params.topic}`],
    seoScore: 70 + Math.round(pseudoRandom(seed) * 28),
  };
}

export interface AssetItem {
  id: string;
  type: "image" | "video";
  title: string;
  url: string;
  source: string;
  license: string;
}

export async function fetchAssets(params: { topic: string }): Promise<AssetItem[]> {
  await delay(700);
  const seed = seedFromString(params.topic);
  return Array.from({ length: 8 }).map((_, i) => ({
    id: `asset-${i}`,
    type: i % 3 === 0 ? "video" : "image",
    title: `${params.topic} — archival ${i + 1}`,
    url: `https://placehold.co/600x360/0b1020/2f7dff?text=${encodeURIComponent(params.topic.slice(0, 14))}+${i + 1}`,
    source: ["Pexels", "Unsplash", "Wikimedia", "Pixabay"][(seed + i) % 4],
    license: "CC0 / Royalty-free",
  }));
}

export interface PipelineStage {
  id: string;
  label: string;
  status: "pending" | "running" | "done";
  progress: number;
}

export async function runVideoPipeline(stages: PipelineStage[], onUpdate: (s: PipelineStage[]) => void): Promise<void> {
  const next = [...stages];
  for (let i = 0; i < next.length; i++) {
    next[i] = { ...next[i], status: "running" };
    onUpdate([...next]);
    while (next[i].progress < 100) {
      await delay(120);
      next[i] = { ...next[i], progress: Math.min(100, next[i].progress + 12) };
      onUpdate([...next]);
    }
    next[i] = { ...next[i], status: "done" };
    onUpdate([...next]);
  }
}
