import { useState } from "react";
import { motion } from "framer-motion";
import {
  FileText,
  Sparkles,
  Save,
  Download,
  Wand2,
  Languages,
  Maximize2,
  Clock,
} from "lucide-react";
import { SectionTitle, Card, Badge, ErrorBanner } from "../components/ui/Primitives";
import { Generating } from "../components/ui/Generating";
import { geminiScript, geminiRewrite, geminiExpand, geminiTranslate } from "../lib/api";
import { useProjectContext } from "../lib/useProjectContext";
import type { ScriptSection } from "../lib/types";

export default function ScriptPage() {
  const { current, saveEntry } = useProjectContext();

  const [topic, setTopic] = useState("");
  const [angle, setAngle] = useState("");
  const [duration, setDuration] = useState(10);
  const [tone, setTone] = useState("Dramatic");
  const [scenes, setScenes] = useState<ScriptSection[]>([]);
  const [wordCount, setWordCount] = useState(0);
  const [estSeconds, setEstSeconds] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  // Rewrite/Expand/Translate
  const [editingSection, setEditingSection] = useState<number | null>(null);
  const [toolLoading, setToolLoading] = useState(false);
  const [translateLang, setTranslateLang] = useState("Spanish");

  const handleGenerate = async () => {
    if (!topic.trim()) { setError("Enter a topic for your documentary."); return; }
    setLoading(true);
    setError(null);
    setSaved(false);
    try {
      const result = await geminiScript({ topic, angle, durationMin: duration, tone });
      setScenes(result.scenes);
      setWordCount(result.wordCount);
      setEstSeconds(result.estimatedSeconds);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Script generation failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (scenes.length === 0) return;
    try {
      const projectId = current?.id;
      if (!projectId) { setError("Create or select a project first."); return; }
      await saveEntry(projectId, "script", { scenes, wordCount, estimatedSeconds: estSeconds, topic, angle, tone });
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save script");
    }
  };

  const handleTool = async (action: "rewrite" | "expand" | "translate", idx: number) => {
    if (editingSection === null) return;
    setToolLoading(true);
    setError(null);
    try {
      const text = scenes[idx].content;
      let result: { text: string };
      if (action === "rewrite") result = await geminiRewrite(text);
      else if (action === "expand") result = await geminiExpand(text);
      else result = await geminiTranslate(text, translateLang);

      const updated = [...scenes];
      updated[idx] = { ...updated[idx], content: result.text };
      setScenes(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : `${action} failed`);
    } finally {
      setToolLoading(false);
    }
  };

  const handleDownload = () => {
    const text = scenes.map((s) => `[${s.section}]\n${s.content}\n`).join("\n");
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `script-${topic.slice(0, 20).replace(/\s+/g, "-")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <SectionTitle
        title="Script Generator"
        subtitle="Generate a complete documentary script with Gemini. Rewrite, expand, or translate any section."
        icon={<FileText className="h-5 w-5" />}
      />

      <Card>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="mb-1 block text-xs text-slate-400">Topic</label>
            <input
              type="text"
              placeholder="e.g. The Fall of Rome"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-primary-500/50 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-slate-400">Angle</label>
            <input
              type="text"
              placeholder="e.g. The Untold Story"
              value={angle}
              onChange={(e) => setAngle(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-primary-500/50 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-slate-400">Duration (min)</label>
            <input
              type="number"
              min={5}
              max={60}
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white focus:border-primary-500/50 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-slate-400">Tone</label>
            <select value={tone} onChange={(e) => setTone(e.target.value)} className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white focus:border-primary-500/50">
              <option>Dramatic</option><option>Informative</option><option>Mysterious</option><option>Inspirational</option><option>Neutral</option>
            </select>
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <button onClick={handleGenerate} disabled={loading} className="btn-primary py-2.5">
            <Sparkles className="h-4 w-4" /> Generate Script
          </button>
          {scenes.length > 0 && (
            <>
              <button onClick={handleSave} className="btn-ghost py-2.5">
                <Save className="h-4 w-4" /> Save to Project
              </button>
              <button onClick={handleDownload} className="btn-ghost py-2.5">
                <Download className="h-4 w-4" /> Download .txt
              </button>
            </>
          )}
        </div>
      </Card>

      {error && <ErrorBanner message={error} onRetry={() => setError(null)} />}

      {loading && <Generating message="Gemini is writing your documentary script..." />}

      {saved && <Badge color="success"><Save className="mr-1 h-3 w-3" /> Script saved to project</Badge>}

      {scenes.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-4 text-xs text-slate-400">
            <span className="flex items-center gap-1"><FileText className="h-3.5 w-3.5" /> {wordCount} words</span>
            <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> ~{Math.round(estSeconds / 60)} min</span>
            <span>{scenes.length} sections</span>
          </div>

          {scenes.map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card>
                <div className="mb-2 flex items-center justify-between">
                  <Badge color="primary">{s.section}</Badge>
                  <button
                    onClick={() => setEditingSection(editingSection === i ? null : i)}
                    className="text-xs text-slate-400 hover:text-white"
                  >
                    {editingSection === i ? "Close" : "Edit"}
                  </button>
                </div>
                <p className="text-sm leading-relaxed text-slate-200">{s.content}</p>

                {editingSection === i && (
                  <div className="mt-4 border-t border-white/10 pt-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <button onClick={() => handleTool("rewrite", i)} disabled={toolLoading} className="btn-ghost py-2 text-xs">
                        <Wand2 className="h-3.5 w-3.5" /> Rewrite
                      </button>
                      <button onClick={() => handleTool("expand", i)} disabled={toolLoading} className="btn-ghost py-2 text-xs">
                        <Maximize2 className="h-3.5 w-3.5" /> Expand
                      </button>
                      <div className="flex items-center gap-1">
                        <select value={translateLang} onChange={(e) => setTranslateLang(e.target.value)} className="rounded-lg border border-white/10 bg-white/5 px-2 py-2 text-xs text-white">
                          <option>Spanish</option><option>Arabic</option><option>French</option><option>Hindi</option><option>German</option>
                        </select>
                        <button onClick={() => handleTool("translate", i)} disabled={toolLoading} className="btn-ghost py-2 text-xs">
                          <Languages className="h-3.5 w-3.5" /> Translate
                        </button>
                      </div>
                      {toolLoading && <span className="text-xs text-slate-400">Working...</span>}
                    </div>
                  </div>
                )}
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {!loading && scenes.length === 0 && !error && (
        <Card>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <FileText className="mb-3 h-10 w-10 text-slate-600" />
            <p className="text-sm text-slate-300">Enter a topic to generate a complete script</p>
            <p className="mt-1 text-xs text-slate-500">Gemini writes hook, intro, acts, ending and CTA</p>
          </div>
        </Card>
      )}
    </div>
  );
}
