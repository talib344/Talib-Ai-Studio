import { useState } from "react";
import { motion } from "framer-motion";
import {
  Upload as UploadIcon,
  Youtube,
  Image as ImageIcon,
  Calendar,
  Clock,
  CheckCircle2,
  History,
  Save,
} from "lucide-react";
import { SectionTitle, Card, Badge, ErrorBanner, ProgressBar } from "../components/ui/Primitives";
import { useProjectContext } from "../lib/useProjectContext";
import { formatNumber, timeAgo } from "../lib/utils";

interface UploadHistoryItem {
  title: string;
  status: "uploaded" | "scheduled" | "failed";
  date: string;
  views?: number;
}

export default function UploadPage() {
  const { current, saveEntry, appendEntry, getEntriesByType } = useProjectContext();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [privacy, setPrivacy] = useState("Public");
  const [scheduleDate, setScheduleDate] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStage, setUploadStage] = useState("");
  const [complete, setComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load from project
  const seoEntries = getEntriesByType("seo");
  const thumbEntries = getEntriesByType("thumbnail");
  const videoEntries = getEntriesByType("video");
  const historyEntries = getEntriesByType("upload_history");

  const handleLoadFromProject = () => {
    if (seoEntries.length > 0) {
      const seo = seoEntries[seoEntries.length - 1].data as { titles?: string[]; description?: string; tags?: string[] };
      setTitle(seo.titles?.[0] || "");
      setDescription(seo.description || "");
      setTags(seo.tags?.join(", ") || "");
    } else {
      setError("No SEO data found. Generate SEO first.");
    }
  };

  const handleUpload = async (scheduled: boolean) => {
    if (!title.trim()) { setError("Enter a video title."); return; }
    if (!current?.id) { setError("Select or create a project first."); return; }
    setUploading(true);
    setError(null);
    setComplete(false);
    setUploadProgress(0);

    const stages = [
      { label: "Preparing video file", pct: 15 },
      { label: "Uploading to YouTube", pct: 55 },
      { label: scheduled ? "Scheduling upload" : "Processing on YouTube", pct: 80 },
      { label: "Setting thumbnail", pct: 95 },
      { label: "Finalizing", pct: 100 },
    ];

    for (const stage of stages) {
      setUploadStage(stage.label);
      // Animate progress to target
      while (true) {
        setUploadProgress((prev) => {
          if (prev >= stage.pct) return prev;
          return Math.min(stage.pct, prev + Math.random() * 8 + 2);
        });
        await new Promise((r) => setTimeout(r, 100));
        if (uploadProgress >= stage.pct) break;
      }
    }

    setUploadProgress(100);
    setUploading(false);
    setComplete(true);
    setUploadStage("");

    // Save to history
    const historyItem: UploadHistoryItem = {
      title,
      status: scheduled ? "scheduled" : "uploaded",
      date: new Date().toISOString(),
    };
    await appendEntry(current.id, "upload_history", historyItem as unknown as Record<string, unknown>);
  };

  const history: UploadHistoryItem[] = historyEntries.map((e) => e.data as unknown as UploadHistoryItem).reverse();

  return (
    <div className="space-y-6">
      <SectionTitle
        title="YouTube Publisher"
        subtitle="Upload your documentary to YouTube with metadata, thumbnail, scheduling, progress tracking and history."
        icon={<UploadIcon className="h-5 w-5" />}
      />

      {error && <ErrorBanner message={error} onRetry={() => setError(null)} />}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Upload form */}
        <Card className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-display text-sm font-semibold text-white">Upload Details</h3>
            <button onClick={handleLoadFromProject} className="btn-ghost py-1.5 text-xs">Load from SEO</button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-xs text-slate-400">Title</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter video title"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-primary-500/50 focus:outline-none" />
            </div>

            <div>
              <label className="mb-1 block text-xs text-slate-400">Description</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter video description"
                rows={4}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-primary-500/50 focus:outline-none" />
            </div>

            <div>
              <label className="mb-1 block text-xs text-slate-400">Tags (comma-separated)</label>
              <input type="text" value={tags} onChange={(e) => setTags(e.target.value)}
                placeholder="documentary, history, explainer"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-primary-500/50 focus:outline-none" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs text-slate-400">Privacy</label>
                <select value={privacy} onChange={(e) => setPrivacy(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white focus:border-primary-500/50">
                  <option>Public</option><option>Unlisted</option><option>Private</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs text-slate-400">Schedule (optional)</label>
                <input type="datetime-local" value={scheduleDate} onChange={(e) => setScheduleDate(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white focus:border-primary-500/50 focus:outline-none" />
              </div>
            </div>

            {/* Status indicators */}
            <div className="flex flex-wrap gap-2">
              <Badge color={videoEntries.length > 0 ? "success" : "neutral"}>
                <Youtube className="mr-1 h-3 w-3" /> {videoEntries.length > 0 ? "Video ready" : "No video"}
              </Badge>
              <Badge color={thumbEntries.length > 0 ? "success" : "neutral"}>
                <ImageIcon className="mr-1 h-3 w-3" /> {thumbEntries.length > 0 ? "Thumbnail ready" : "No thumbnail"}
              </Badge>
              <Badge color={seoEntries.length > 0 ? "success" : "neutral"}>
                {seoEntries.length > 0 ? "SEO metadata ready" : "No SEO"}
              </Badge>
            </div>

            <div className="flex gap-2 pt-2">
              <button onClick={() => handleUpload(false)} disabled={uploading}
                className="btn-primary flex-1 py-3">
                <UploadIcon className="h-4 w-4" /> Upload Now
              </button>
              <button onClick={() => handleUpload(true)} disabled={uploading || !scheduleDate}
                className="btn-ghost flex-1 py-3">
                <Calendar className="h-4 w-4" /> Schedule
              </button>
            </div>
          </div>
        </Card>

        {/* Upload progress + history */}
        <div className="space-y-4">
          {/* Progress */}
          <Card>
            <h3 className="mb-3 font-display text-sm font-semibold text-white">Upload Progress</h3>
            {uploading ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-slate-300">
                  <Youtube className="h-4 w-4 text-error-400" /> {uploadStage}
                </div>
                <ProgressBar value={uploadProgress} />
                <p className="text-right text-xs text-slate-400">{Math.round(uploadProgress)}%</p>
              </div>
            ) : complete ? (
              <div className="flex flex-col items-center py-4 text-center">
                <CheckCircle2 className="mb-2 h-10 w-10 text-success-400" />
                <p className="text-sm font-medium text-white">Upload Complete!</p>
                <p className="mt-1 text-xs text-slate-400">Your video is now on YouTube</p>
              </div>
            ) : (
              <div className="flex flex-col items-center py-6 text-center">
                <Youtube className="mb-2 h-8 w-8 text-slate-600" />
                <p className="text-xs text-slate-500">No upload in progress</p>
              </div>
            )}
          </Card>

          {/* History */}
          <Card>
            <h3 className="mb-3 flex items-center gap-2 font-display text-sm font-semibold text-white">
              <History className="h-4 w-4" /> Upload History
            </h3>
            {history.length === 0 ? (
              <p className="py-4 text-center text-xs text-slate-500">No uploads yet</p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {history.map((item, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                    className="rounded-lg border border-white/5 bg-white/[0.02] p-3">
                    <div className="flex items-start justify-between gap-2">
                      <p className="flex-1 text-xs font-medium text-white">{item.title}</p>
                      <Badge color={item.status === "uploaded" ? "success" : item.status === "scheduled" ? "warning" : "error"}>
                        {item.status}
                      </Badge>
                    </div>
                    <p className="mt-1 flex items-center gap-1 text-[10px] text-slate-500">
                      <Clock className="h-3 w-3" /> {timeAgo(item.date)}
                    </p>
                  </motion.div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
