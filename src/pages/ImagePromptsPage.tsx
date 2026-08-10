import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Image as ImageIcon,
  Search,
  Download,
  Check,
  Save,
  Video,
  Sparkles,
  X,
  CheckCircle2,
} from "lucide-react";
import { SectionTitle, Card, Badge, ErrorBanner } from "../components/ui/Primitives";
import { Generating } from "../components/ui/Generating";
import { pexelsSearch, geminiImageKeywords } from "../lib/api";
import { useProjectContext } from "../lib/useProjectContext";
import type { PexelsResult } from "../lib/types";

export default function ImagePromptsPage() {
  const { current, saveEntry, getEntriesByType } = useProjectContext();

  const [query, setQuery] = useState("");
  const [scene, setScene] = useState("");
  const [type, setType] = useState<"image" | "video">("image");
  const [results, setResults] = useState<PexelsResult[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [keywordSuggestions, setKeywordSuggestions] = useState<string[]>([]);

  const handleSearch = async () => {
    if (!query.trim()) { setError("Enter a search query."); return; }
    setLoading(true);
    setError(null);
    setKeywordSuggestions([]);
    try {
      const result = await pexelsSearch({ query, type });
      setResults(result.results);
      setSelected(new Set());
      if (result.results.length === 0) {
        // Ask Gemini for better keywords
        try {
          const kw = await geminiImageKeywords(query, scene);
          setKeywordSuggestions(kw.keywords);
        } catch { /* ignore keyword failure */ }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed");
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };

  const handleDownload = async () => {
    if (selected.size === 0) return;
    setDownloading(true);
    setDownloadProgress(0);
    const selectedItems = results.filter((r) => selected.has(r.id));
    const total = selectedItems.length;

    for (let i = 0; i < selectedItems.length; i++) {
      const item = selectedItems[i];
      try {
        const res = await fetch(item.url);
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${item.type}-${item.id}.${item.type === "video" ? "mp4" : "jpg"}`;
        a.click();
        URL.revokeObjectURL(url);
      } catch {
        // skip failed downloads
      }
      setDownloadProgress(Math.round(((i + 1) / total) * 100));
    }

    setDownloading(false);
  };

  const handleSave = async () => {
    if (selected.size === 0) return;
    try {
      const projectId = current?.id;
      if (!projectId) { setError("Create or select a project first."); return; }
      const selectedItems = results.filter((r) => selected.has(r.id));
      await saveEntry(projectId, "selected_images", { images: selectedItems, query, scene });
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    }
  };

  const useKeyword = (kw: string) => {
    setQuery(kw);
    handleSearch();
  };

  return (
    <div className="space-y-6">
      <SectionTitle
        title="Image Generator"
        subtitle="Search Pexels for stock images and videos. Select multiple, download automatically, and store them in your project."
        icon={<ImageIcon className="h-5 w-5" />}
      />

      <Card>
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[200px]">
            <label className="mb-1 block text-xs text-slate-400">Search query</label>
            <input
              type="text"
              placeholder="e.g. ancient roman ruins"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-primary-500/50 focus:outline-none"
            />
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="mb-1 block text-xs text-slate-400">Scene description (optional)</label>
            <input
              type="text"
              placeholder="e.g. establishing shot of the Colosseum"
              value={scene}
              onChange={(e) => setScene(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-primary-500/50 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-slate-400">Type</label>
            <div className="flex gap-1 rounded-xl border border-white/10 bg-white/5 p-1">
              <button
                onClick={() => setType("image")}
                className={`rounded-lg px-3 py-2 text-xs font-medium transition-colors ${type === "image" ? "bg-primary-500 text-white" : "text-slate-400 hover:text-white"}`}
              >
                <ImageIcon className="inline h-3.5 w-3.5 mr-1" /> Photos
              </button>
              <button
                onClick={() => setType("video")}
                className={`rounded-lg px-3 py-2 text-xs font-medium transition-colors ${type === "video" ? "bg-primary-500 text-white" : "text-slate-400 hover:text-white"}`}
              >
                <Video className="inline h-3.5 w-3.5 mr-1" /> Videos
              </button>
            </div>
          </div>
          <button onClick={handleSearch} disabled={loading} className="btn-primary py-2.5">
            <Search className="h-4 w-4" /> Search
          </button>
        </div>

        {selected.size > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Badge color="success"><Check className="mr-1 h-3 w-3" /> {selected.size} selected</Badge>
            <button onClick={handleDownload} disabled={downloading} className="btn-primary py-2 text-xs">
              <Download className="h-3.5 w-3.5" /> Download Selected
            </button>
            <button onClick={handleSave} className="btn-ghost py-2 text-xs">
              <Save className="h-3.5 w-3.5" /> Save to Project
            </button>
            <button onClick={() => setSelected(new Set())} className="btn-ghost py-2 text-xs">
              <X className="h-3.5 w-3.5" /> Clear
            </button>
          </div>
        )}

        {downloading && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Downloading {selected.size} files...</span>
              <span>{downloadProgress}%</span>
            </div>
            <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-white/10">
              <motion.div className="h-full rounded-full bg-gradient-to-r from-primary-500 to-accent-500"
                animate={{ width: `${downloadProgress}%` }} transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        )}
      </Card>

      {error && <ErrorBanner message={error} onRetry={() => setError(null)} />}
      {loading && <Generating message={`Searching Pexels for ${type}s...`} />}
      {saved && <Badge color="success"><CheckCircle2 className="mr-1 h-3 w-3" /> Images saved to project</Badge>}

      {/* Keyword suggestions when no results */}
      {keywordSuggestions.length > 0 && (
        <Card>
          <div className="flex items-start gap-3">
            <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-primary-300" />
            <div>
              <p className="text-sm font-medium text-white">No results found. Gemini suggests better keywords:</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {keywordSuggestions.map((kw) => (
                  <button
                    key={kw}
                    onClick={() => useKeyword(kw)}
                    className="rounded-lg border border-primary-500/30 bg-primary-500/10 px-3 py-1.5 text-xs text-primary-200 transition-colors hover:bg-primary-500/20"
                  >
                    {kw}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Results grid */}
      {results.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <AnimatePresence>
            {results.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: i * 0.03 }}
                className={`group relative cursor-pointer overflow-hidden rounded-xl border bg-black/30 transition-all ${
                  selected.has(item.id) ? "border-primary-500 ring-2 ring-primary-500/40" : "border-white/10 hover:border-white/20"
                }`}
                onClick={() => toggleSelect(item.id)}
              >
                <div className="relative aspect-video">
                  <img src={item.thumb} alt={item.title} className="h-full w-full object-cover" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  {selected.has(item.id) && (
                    <div className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-primary-500 text-white shadow-lg">
                      <Check className="h-4 w-4" />
                    </div>
                  )}
                  {item.type === "video" && (
                    <div className="absolute left-2 top-2">
                      <Badge color="primary"><Video className="mr-1 h-3 w-3" /> {item.duration}s</Badge>
                    </div>
                  )}
                </div>
                <div className="p-2.5">
                  <p className="truncate text-xs text-slate-300">{item.title}</p>
                  <p className="mt-0.5 text-[10px] text-slate-500">{item.source} · {item.license}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {!loading && results.length === 0 && !error && keywordSuggestions.length === 0 && (
        <Card>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <ImageIcon className="mb-3 h-10 w-10 text-slate-600" />
            <p className="text-sm text-slate-300">Search Pexels for stock photos and videos</p>
            <p className="mt-1 text-xs text-slate-500">If nothing is found, Gemini will suggest better keywords</p>
          </div>
        </Card>
      )}
    </div>
  );
}
