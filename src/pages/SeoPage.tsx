import { useState } from "react";
import { motion } from "framer-motion";
import { BarChart3, Sparkles, Save, Download, Copy, Check, Hash, Tag, FileText } from "lucide-react";
import { SectionTitle, Card, Badge, ErrorBanner, ScoreRing } from "../components/ui/Primitives";
import { Generating } from "../components/ui/Generating";
import { geminiSeo } from "../lib/api";
import { useProjectContext } from "../lib/useProjectContext";
import type { SeoSet } from "../lib/types";

export default function SeoPage() {
  const { current, saveEntry } = useProjectContext();

  const [topic, setTopic] = useState("");
  const [seo, setSeo] = useState<SeoSet | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!topic.trim()) { setError("Enter a topic for SEO optimization."); return; }
    setLoading(true);
    setError(null);
    setSaved(false);
    try {
      const result = await geminiSeo({ topic });
      setSeo(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "SEO generation failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!seo) return;
    try {
      const projectId = current?.id;
      if (!projectId) { setError("Create or select a project first."); return; }
      await saveEntry(projectId, "seo", { ...seo, topic });
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    }
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleDownload = () => {
    if (!seo) return;
    const text = `SEO Package for "${topic}"\n\n=== TITLES ===\n${seo.titles.join("\n")}\n\n=== DESCRIPTION ===\n${seo.description}\n\n=== TAGS ===\n${seo.tags.join(", ")}\n\n=== HASHTAGS ===\n${seo.hashtags.join(" ")}\n\n=== KEYWORDS ===\n${seo.keywords.join(", ")}\n\n=== SEO SCORE ===\n${seo.seoScore}/100`;
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `seo-${topic.slice(0, 20).replace(/\s+/g, "-")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <SectionTitle
        title="SEO Optimizer"
        subtitle="Gemini generates optimized titles, descriptions, tags, hashtags, keywords and an SEO score."
        icon={<BarChart3 className="h-5 w-5" />}
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
          <button onClick={handleGenerate} disabled={loading} className="btn-primary py-2.5">
            <Sparkles className="h-4 w-4" /> Generate SEO
          </button>
          {seo && (
            <>
              <button onClick={handleSave} className="btn-ghost py-2.5">
                <Save className="h-4 w-4" /> Save
              </button>
              <button onClick={handleDownload} className="btn-ghost py-2.5">
                <Download className="h-4 w-4" /> Download
              </button>
            </>
          )}
        </div>
      </Card>

      {error && <ErrorBanner message={error} onRetry={() => setError(null)} />}
      {loading && <Generating message="Gemini is optimizing your SEO..." />}
      {saved && <Badge color="success"><Save className="mr-1 h-3 w-3" /> SEO saved to project</Badge>}

      {seo && (
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          {/* Score */}
          <Card>
            <div className="flex items-center gap-6">
              <ScoreRing value={seo.seoScore} size={90} label="SEO Score" />
              <div>
                <h3 className="font-display text-lg font-semibold text-white">SEO Score: {seo.seoScore}/100</h3>
                <p className="mt-1 text-sm text-slate-400">
                  {seo.seoScore >= 80 ? "Excellent — your video is well optimized for search." : seo.seoScore >= 60 ? "Good — some areas can be improved." : "Needs work — consider refining your metadata."}
                </p>
              </div>
            </div>
          </Card>

          {/* Titles */}
          <Card>
            <h3 className="mb-3 flex items-center gap-2 font-display text-sm font-semibold text-white">
              <FileText className="h-4 w-4 text-primary-300" /> Title Options
            </h3>
            <div className="space-y-2">
              {seo.titles.map((title, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2.5">
                  <p className="flex-1 text-sm text-slate-200">{title}</p>
                  <button onClick={() => handleCopy(title, `title-${i}`)} className="ml-2 text-slate-400 hover:text-white">
                    {copied === `title-${i}` ? <Check className="h-4 w-4 text-success-400" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
              ))}
            </div>
          </Card>

          {/* Description */}
          <Card>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="flex items-center gap-2 font-display text-sm font-semibold text-white">
                <FileText className="h-4 w-4 text-primary-300" /> Description
              </h3>
              <button onClick={() => handleCopy(seo.description, "desc")} className="text-xs text-slate-400 hover:text-white">
                {copied === "desc" ? <Check className="h-3.5 w-3.5 text-success-400" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
            </div>
            <p className="rounded-lg bg-white/5 p-3 text-sm leading-relaxed text-slate-200">{seo.description}</p>
          </Card>

          {/* Tags + Hashtags + Keywords */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <h3 className="mb-3 flex items-center gap-2 font-display text-sm font-semibold text-white">
                <Tag className="h-4 w-4 text-primary-300" /> Tags
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {seo.tags.map((tag, i) => (
                  <span key={i} className="rounded-lg bg-primary-500/15 px-2.5 py-1 text-xs text-primary-200 ring-1 ring-primary-500/20">{tag}</span>
                ))}
              </div>
            </Card>
            <Card>
              <h3 className="mb-3 flex items-center gap-2 font-display text-sm font-semibold text-white">
                <Hash className="h-4 w-4 text-accent-300" /> Hashtags
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {seo.hashtags.map((tag, i) => (
                  <span key={i} className="rounded-lg bg-accent-500/15 px-2.5 py-1 text-xs text-accent-200 ring-1 ring-accent-500/20">{tag}</span>
                ))}
              </div>
            </Card>
            <Card>
              <h3 className="mb-3 flex items-center gap-2 font-display text-sm font-semibold text-white">
                <Sparkles className="h-4 w-4 text-success-400" /> Keywords
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {seo.keywords.map((kw, i) => (
                  <span key={i} className="rounded-lg bg-success-500/15 px-2.5 py-1 text-xs text-success-200 ring-1 ring-success-500/20">{kw}</span>
                ))}
              </div>
            </Card>
          </div>
        </motion.div>
      )}

      {!loading && !seo && !error && (
        <Card>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <BarChart3 className="mb-3 h-10 w-10 text-slate-600" />
            <p className="text-sm text-slate-300">Enter a topic to generate SEO metadata</p>
            <p className="mt-1 text-xs text-slate-500">Titles, description, tags, hashtags, keywords and SEO score</p>
          </div>
        </Card>
      )}
    </div>
  );
}
