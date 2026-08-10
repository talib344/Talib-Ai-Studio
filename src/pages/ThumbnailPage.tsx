import { useState } from "react";
import { motion } from "framer-motion";
import { Image, Sparkles, Save, Download, TrendingUp, Palette } from "lucide-react";
import { SectionTitle, Card, Badge, ErrorBanner, ScoreRing } from "../components/ui/Primitives";
import { Generating } from "../components/ui/Generating";
import { geminiThumbnails } from "../lib/api";
import { useProjectContext } from "../lib/useProjectContext";
import type { ThumbnailConcept } from "../lib/types";

export default function ThumbnailPage() {
  const { current, saveEntry } = useProjectContext();

  const [topic, setTopic] = useState("");
  const [count, setCount] = useState(3);
  const [thumbnails, setThumbnails] = useState<ThumbnailConcept[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const handleGenerate = async () => {
    if (!topic.trim()) { setError("Enter a topic for thumbnail concepts."); return; }
    setLoading(true);
    setError(null);
    setSaved(false);
    try {
      const result = await geminiThumbnails({ topic, count });
      setThumbnails(result.thumbnails);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Thumbnail generation failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (thumbnails.length === 0) return;
    try {
      const projectId = current?.id;
      if (!projectId) { setError("Create or select a project first."); return; }
      await saveEntry(projectId, "thumbnail", { thumbnails, topic });
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    }
  };

  const handleDownload = (thumb: ThumbnailConcept, idx: number) => {
    const text = `Thumbnail Concept ${idx + 1}\n\nHeadline: ${thumb.headline}\n\nImage Prompt:\n${thumb.prompt}\n\nEstimated CTR: ${thumb.ctr}%\n\nColors: ${thumb.colors.join(", ")}`;
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `thumbnail-concept-${idx + 1}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <SectionTitle
        title="Thumbnail Studio"
        subtitle="Gemini generates thumbnail prompts, headline text, CTR estimates, and color palettes for your documentary."
        icon={<Image className="h-5 w-5" />}
      />

      <Card>
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[200px]">
            <label className="mb-1 block text-xs text-slate-400">Topic</label>
            <input
              type="text"
              placeholder="e.g. The Fall of Ancient Rome"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-primary-500/50 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-slate-400">Concepts</label>
            <input type="number" min={1} max={6} value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              className="w-24 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white focus:border-primary-500/50 focus:outline-none" />
          </div>
          <button onClick={handleGenerate} disabled={loading} className="btn-primary py-2.5">
            <Sparkles className="h-4 w-4" /> Generate
          </button>
          {thumbnails.length > 0 && (
            <button onClick={handleSave} className="btn-ghost py-2.5">
              <Save className="h-4 w-4" /> Save to Project
            </button>
          )}
        </div>
      </Card>

      {error && <ErrorBanner message={error} onRetry={() => setError(null)} />}
      {loading && <Generating message="Gemini is creating thumbnail concepts..." />}
      {saved && <Badge color="success"><Save className="mr-1 h-3 w-3" /> Saved to project</Badge>}

      {thumbnails.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {thumbnails.map((thumb, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
              <Card>
                {/* Thumbnail preview with color palette */}
                <div className="relative mb-4 aspect-video overflow-hidden rounded-xl">
                  <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${thumb.colors[0]}, ${thumb.colors[1] || "#000"})` }} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <div className="absolute inset-0 flex items-center justify-center p-4">
                    <p className="text-center font-display text-xl font-extrabold uppercase text-white drop-shadow-lg" style={{ textShadow: "0 2px 8px rgba(0,0,0,0.8)" }}>
                      {thumb.headline}
                    </p>
                  </div>
                  <div className="absolute bottom-2 right-2">
                    <ScoreRing value={Math.round(thumb.ctr * 10)} size={48} label="CTR" />
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-medium text-slate-400">Headline Text</p>
                    <p className="text-sm font-semibold text-white">{thumb.headline}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-400">Image Prompt</p>
                    <p className="text-xs leading-relaxed text-slate-300">{thumb.prompt}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Palette className="h-3.5 w-3.5 text-slate-400" />
                    <div className="flex gap-1.5">
                      {thumb.colors.map((c, j) => (
                        <div key={j} className="h-5 w-5 rounded ring-1 ring-white/20" style={{ backgroundColor: c }} title={c} />
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <TrendingUp className="h-3.5 w-3.5 text-success-400" />
                    <span className="text-slate-300">Est. CTR: <span className="font-semibold text-success-400">{thumb.ctr}%</span></span>
                  </div>
                  <button onClick={() => handleDownload(thumb, i)} className="btn-ghost w-full py-2 text-xs">
                    <Download className="h-3.5 w-3.5" /> Download Concept
                  </button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {!loading && thumbnails.length === 0 && !error && (
        <Card>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Image className="mb-3 h-10 w-10 text-slate-600" />
            <p className="text-sm text-slate-300">Enter a topic to generate thumbnail concepts</p>
            <p className="mt-1 text-xs text-slate-500">Gemini creates headline text, image prompts, CTR scores and colors</p>
          </div>
        </Card>
      )}
    </div>
  );
}
