import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface PexelsPhoto {
  id: number;
  src: { original: string; large2x: string; large: string; medium: string; small: string; portrait: string; landscape: string };
  alt: string;
  width: number;
  height: number;
  photographer: string;
  photographer_url: string;
  url: string;
  avg_color: string;
}

interface PexelsVideo {
  id: number;
  width: number;
  height: number;
  duration: number;
  image: string;
  full_res: string | null;
  video_files: { id: number; quality: string; file_type: string; link: string; width: number; height: number }[];
  video_pictures: { id: number; picture: string; nr: number }[];
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("PEXELS_API_KEY") || "";
    if (!apiKey) {
      return new Response(
        JSON.stringify({
          error: "PEXELS_API_KEY is not configured. Add it in Settings or as an edge function secret.",
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = await req.json();
    const query: string = body.query || "documentary";
    const type: "image" | "video" = body.type || "image";
    const perPage: number = Math.min(body.perPage || 15, 80);

    const endpoint =
      type === "video"
        ? `https://api.pexels.com/videos/search?query=${encodeURIComponent(query)}&per_page=${perPage}`
        : `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=${perPage}&orientation=landscape`;

    const res = await fetch(endpoint, {
      headers: { Authorization: apiKey },
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Pexels API error ${res.status}: ${errText}`);
    }

    const data = await res.json();

    if (type === "video") {
      const videos: PexelsVideo[] = data.videos || [];
      const results = videos.map((v) => ({
        id: `pex-vid-${v.id}`,
        type: "video" as const,
        title: `Video ${v.id} · ${v.duration}s`,
        url: v.video_files?.find((f) => f.quality === "hd")?.link || v.video_files?.[0]?.link || "",
        thumb: v.image,
        source: "Pexels",
        license: "Pexels License (free)",
        photographer: "",
        width: v.width,
        height: v.height,
        duration: v.duration,
      }));
      return new Response(JSON.stringify({ results }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } else {
      const photos: PexelsPhoto[] = data.photos || [];
      const results = photos.map((p) => ({
        id: `pex-img-${p.id}`,
        type: "image" as const,
        title: p.alt || `Photo ${p.id}`,
        url: p.src.large2x || p.src.large,
        thumb: p.src.medium || p.src.small,
        fullUrl: p.src.original,
        source: "Pexels",
        license: "Pexels License (free)",
        photographer: p.photographer,
        photographerUrl: p.photographer_url,
        avgColor: p.avg_color,
        width: p.width,
        height: p.height,
      }));
      return new Response(JSON.stringify({ results }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
