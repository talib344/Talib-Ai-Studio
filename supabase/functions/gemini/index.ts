import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const GEMINI_MODEL = "gemini-2.0-flash";

interface GeminiPart {
  text: string;
}
interface GeminiContent {
  parts: GeminiPart[];
  role?: string;
}

async function callGemini(
  apiKey: string,
  systemPrompt: string,
  userPrompt: string,
  jsonMode = true
): Promise<string> {
  const contents: GeminiContent[] = [
    { role: "user", parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] },
  ];

  const body: Record<string, unknown> = { contents };
  if (jsonMode) {
    body.generationConfig = {
      responseMimeType: "application/json",
    };
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gemini API error ${res.status}: ${errText}`);
  }

  const json = await res.json();
  const text = json?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Gemini returned no content");
  return text;
}

function safeParse<T>(raw: string): T {
  const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  return JSON.parse(cleaned) as T;
}

// ---- Task handlers -------------------------------------------------------

interface ResearchIdea {
  title: string;
  angle: string;
  difficulty: number;
  virality: number;
  competition: number;
  estimatedViews: number;
}

async function taskResearch(params: Record<string, string>, apiKey: string): Promise<unknown> {
  const system = `You are a YouTube documentary research expert. Return ONLY valid JSON.`;
  const prompt = `Generate 6 trending documentary video ideas for the keyword "${params.keyword || "history"}", country "${params.country || "United States"}", language "${params.language || "English"}", target length "${params.length || "8-12 min"}".

Return a JSON object: { "ideas": [{ "title": string, "angle": string, "difficulty": 1-100, "virality": 1-100, "competition": 1-100, "estimatedViews": number }] }

Make titles catchy and realistic. Scores must be integers. estimatedViews should be a realistic number.`;
  const raw = await callGemini(apiKey, system, prompt);
  return safeParse<{ ideas: ResearchIdea[] }>(raw);
}

async function taskScript(params: Record<string, string>, apiKey: string): Promise<unknown> {
  const system = `You are a professional documentary scriptwriter for YouTube. Return ONLY valid JSON.`;
  const prompt = `Write a complete ${params.durationMin || "10"}-minute documentary script about "${params.topic}" with the angle "${params.angle}" in a ${params.tone || "Dramatic"} tone.

Return JSON: { "scenes": [{ "section": string, "content": string }], "wordCount": number, "estimatedSeconds": number }

Include sections: Hook, Introduction, Act 1, Act 2, Act 3, Ending, Call to Action. Make narration vivid and engaging.`;
  const raw = await callGemini(apiKey, system, prompt);
  return safeParse(raw);
}

async function taskScenes(params: Record<string, string>, apiKey: string): Promise<unknown> {
  const system = `You are a documentary scene planner. Return ONLY valid JSON.`;
  const prompt = `Create ${params.count || "8"} scenes for a documentary about "${params.topic}".

Return JSON: { "scenes": [{ "index": number, "narration": string, "visual": string, "transition": string, "durationSec": number }] }

Visuals should be cinematic and concrete. Transitions like: Cross dissolve, Whip pan, Match cut, Fade to black. durationSec between 15-40.`;
  const raw = await callGemini(apiKey, system, prompt);
  return safeParse(raw);
}

async function taskThumbnail(params: Record<string, string>, apiKey: string): Promise<unknown> {
  const system = `You are a YouTube thumbnail strategist. Return ONLY valid JSON.`;
  const prompt = `Generate ${params.count || "3"} thumbnail concepts for a documentary about "${params.topic}".

Return JSON: { "thumbnails": [{ "headline": string (max 6 words, uppercase, high-impact), "prompt": string (image generation prompt for the visual), "ctr": number (estimated CTR 3-12), "colors": [3 hex colors] }] }`;
  const raw = await callGemini(apiKey, system, prompt);
  return safeParse(raw);
}

async function taskSeo(params: Record<string, string>, apiKey: string): Promise<unknown> {
  const system = `You are a YouTube SEO expert. Return ONLY valid JSON.`;
  const prompt = `Generate complete YouTube SEO for a documentary about "${params.topic}".

Return JSON: { "titles": [3 optimized titles], "description": string (200-300 chars with timestamps placeholder), "tags": [8-12 tags], "hashtags": [5-8 hashtags], "keywords": [6-10 keywords], "seoScore": number (1-100) }`;
  const raw = await callGemini(apiKey, system, prompt);
  return safeParse(raw);
}

async function taskTrend(params: Record<string, string>, apiKey: string): Promise<unknown> {
  const system = `You are a YouTube trend analyst. Return ONLY valid JSON.`;
  const prompt = `Analyze trends for the topic "${params.topic}". Identify what's rising, what's saturated, and what angles are underexplored.

Return JSON: { "rising": [strings], "saturated": [strings], "underexplored": [strings], "recommendation": string }`;
  const raw = await callGemini(apiKey, system, prompt);
  return safeParse(raw);
}

async function taskRecommend(params: Record<string, string>, apiKey: string): Promise<unknown> {
  const system = `You are a YouTube content strategist. Return ONLY valid JSON.`;
  const prompt = `Based on these analytics — views: ${params.views || "N/A"}, top videos: ${params.topVideos || "N/A"} — recommend the next 4 documentary topics.

Return JSON: { "recommendations": [{ "title": string, "reason": string, "potentialScore": number 1-100 }] }`;
  const raw = await callGemini(apiKey, system, prompt);
  return safeParse(raw);
}

async function taskRewrite(params: Record<string, string>, apiKey: string): Promise<unknown> {
  const system = `You are a professional editor. Return ONLY valid JSON.`;
  const prompt = `Rewrite this text to be more engaging and cinematic, keeping the same meaning:

${params.text || ""}

Return JSON: { "text": string }`;
  const raw = await callGemini(apiKey, system, prompt);
  return safeParse(raw);
}

async function taskExpand(params: Record<string, string>, apiKey: string): Promise<unknown> {
  const system = `You are a professional writer. Return ONLY valid JSON.`;
  const prompt = `Expand this narration into a richer, more detailed version while keeping the tone:

${params.text || ""}

Return JSON: { "text": string }`;
  const raw = await callGemini(apiKey, system, prompt);
  return safeParse(raw);
}

async function taskTranslate(params: Record<string, string>, apiKey: string): Promise<unknown> {
  const system = `You are a professional translator. Return ONLY valid JSON.`;
  const prompt = `Translate this text into ${params.targetLang || "Spanish"}:

${params.text || ""}

Return JSON: { "text": string }`;
  const raw = await callGemini(apiKey, system, prompt);
  return safeParse(raw);
}

async function taskImageKeywords(params: Record<string, string>, apiKey: string): Promise<unknown> {
  const system = `You are a stock footage search expert. Return ONLY valid JSON.`;
  const prompt = `The user searched Pexels for "${params.query || ""}" about a documentary scene: "${params.scene || ""}" but found no good results. Generate 5 better English search keywords that would find relevant stock photos/videos on Pexels.

Return JSON: { "keywords": [strings] }`;
  const raw = await callGemini(apiKey, system, prompt);
  return safeParse(raw);
}

const TASKS: Record<string, (p: Record<string, string>, k: string) => Promise<unknown>> = {
  research: taskResearch,
  script: taskScript,
  scenes: taskScenes,
  thumbnail: taskThumbnail,
  seo: taskSeo,
  trend: taskTrend,
  recommend: taskRecommend,
  rewrite: taskRewrite,
  expand: taskExpand,
  translate: taskTranslate,
  image_keywords: taskImageKeywords,
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("GEMINI_API_KEY") || "";
    if (!apiKey) {
      return new Response(
        JSON.stringify({
          error: "GEMINI_API_KEY is not configured. Add it in Settings or as an edge function secret.",
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = await req.json();
    const task: string = body.task;
    const params: Record<string, string> = body.params || {};

    const handler = TASKS[task];
    if (!handler) {
      return new Response(
        JSON.stringify({ error: `Unknown task: ${task}. Available: ${Object.keys(TASKS).join(", ")}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const result = await handler(params, apiKey);
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
