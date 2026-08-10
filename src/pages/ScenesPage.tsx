import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Film, Sparkles, Save, ArrowRight, Clock, Image as ImageIcon } from "lucide-react";
import { SectionTitle, Card, Badge, ErrorBanner } from "../components/ui/Primitives";
import { Generating } from "../components/ui/Generating";
import { geminiScenes } from "../lib/api";
import { useProjectContext } from "../lib/useProjectContext";
import type { SceneItem } from "../lib/types";

export default function ScenesPage() {
  const navigate = useNavigate();
  const { current, saveEntry } = useProjectContext();

  const [topic, setTopic] = useState("");
  const [count, setCount] = useState(8);
  const [scenes, setScenes] = useState<SceneItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const handleGenerate = async () => {
    if (!topic.trim()) { setError("Enter a topic for scene planning."); return; }
    setLoading(true);
    setError(null);
    setSaved(false);
    try {
      const result = await geminiScenes({ topic, count });
      setScenes(result.scenes);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Scene generation failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (scenes.length === 0) return;
    try {
      const projectId = current?.id;
      if (!projectId) { setError("Create or select a project first."); return; }
      await saveEntry(projectId, "scenes", { scenes, topic, count });
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save scenes");
    }
  };

  const totalDuration = scenes.reduce((a, s) => a + s.durationSec, 0);

  return (
    <div className="space-y-6">
      <SectionTitle
        title="Scene Planner"
        subtitle="Break your documentary into cinematic scenes with Gemini. Each scene gets narration, visual direction, and transition."
        icon={<Film className="h-5 w-5" />}
      />

      <Card>
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex-1">
            <label className="mb-1 block text-xs text-slate-400">Topic</label>
            <input
              type="text"
              placeholder="e.g. The Space Race"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-primary-500/50 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-slate-400">Scenes</label>
            <input
              type="number"
              min={3}
              max={20}
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              className="w-24 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white focus:border-primary-500/50 focus:outline-none"
            />
          </div>
          <button onClick={handleGenerate} disabled={loading} className="btn-primary py-2.5">
            <Sparkles className="h-4 w-4" /> Generate Scenes
          </button>
          {scenes.length > 0 && (
            <button onClick={handleSave} className="btn-ghost py-2.5">
              <Save className="h-4 w-4" /> Save to Project
            </button>
          )}
        </div>
      </Card>

      {error && <ErrorBanner message={error} onRetry={() => setError(null)} />}
      {loading && <Generating message="Gemini is planning your scenes..." />}
      {saved && <Badge color="success"><Save className="mr-1 h-3 w-3" /> Scenes saved to project</Badge>}

      {scenes.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-4 text-xs text-slate-400">
            <span>{scenes.length} scenes</span>
            <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> ~{Math.round(totalDuration / 60)} min total</span>
          </div>

          {scenes.map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card>
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500/20 to-accent-500/20 font-display text-sm font-bold text-white ring-1 ring-white/10">
                    {s.index}
                  </div>
                  <div className="flex-1">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <Badge color="accent"><Clock className="mr-1 h-3 w-3" /> {s.durationSec}s</Badge>
                      <Badge color="neutral">{s.transition}</Badge>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <p className="text-xs font-medium text-slate-400">Narration</p>
                        <p className="text-sm leading-relaxed text-slate-200">{s.narration}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-slate-400">Visual</p>
                        <p className="text-sm leading-relaxed text-primary-200">{s.visual}</p>
                      </div>
                    </div>
                  </div>
                </div>
                {i === scenes.length - 1 && (
                  <button
                    onClick={() => navigate("/dashboard/image-generator")}
                    className="mt-4 btn-primary py-2 text-xs"
                  >
                    <ArrowRight className="h-3.5 w-3.5" /> Find Images for These Scenes
                  </button>
                )}
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {!loading && scenes.length === 0 && !error && (
        <Card>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Film className="mb-3 h-10 w-10 text-slate-600" />
            <p className="text-sm text-slate-300">Enter a topic to plan your scenes</p>
            <p className="mt-1 text-xs text-slate-500">Each scene includes narration, visual direction and transition</p>
          </div>
        </Card>
      )}
    </div>
  );
}
