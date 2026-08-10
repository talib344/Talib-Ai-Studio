import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FolderOpen, Image as ImageIcon, Video, Download, Trash2, Filter } from "lucide-react";
import { SectionTitle, Card, Badge, ErrorBanner, Empty } from "../components/ui/Primitives";
import { useProjectContext } from "../lib/useProjectContext";
import type { PexelsResult } from "../lib/types";

export default function AssetsPage() {
  const { current, entries, loadEntries } = useProjectContext();
  const [filter, setFilter] = useState<"all" | "image" | "video">("all");

  // Collect all saved images from project entries
  const imageEntries = entries.filter((e) => e.entry_type === "selected_images");
  const allAssets: PexelsResult[] = imageEntries.flatMap((e) => {
    const data = e.data as { images?: PexelsResult[] };
    return data.images || [];
  });

  const filtered = filter === "all" ? allAssets : allAssets.filter((a) => a.type === filter);

  const handleDownload = async (asset: PexelsResult) => {
    try {
      const res = await fetch(asset.url);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${asset.type}-${asset.id}.${asset.type === "video" ? "mp4" : "jpg"}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // ignore
    }
  };

  return (
    <div className="space-y-6">
      <SectionTitle
        title="Asset Library"
        subtitle="All images and videos saved across your projects. Download or manage them here."
        icon={<FolderOpen className="h-5 w-5" />}
      />

      <Card>
        <div className="flex items-center justify-between">
          <div className="flex gap-1 rounded-xl border border-white/10 bg-white/5 p-1">
            {(["all", "image", "video"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-lg px-3 py-2 text-xs font-medium capitalize transition-colors ${filter === f ? "bg-primary-500 text-white" : "text-slate-400 hover:text-white"}`}
              >
                {f === "image" ? <ImageIcon className="inline h-3.5 w-3.5 mr-1" /> : f === "video" ? <Video className="inline h-3.5 w-3.5 mr-1" /> : <Filter className="inline h-3.5 w-3.5 mr-1" />}
                {f}s
              </button>
            ))}
          </div>
          <Badge color="neutral">{filtered.length} assets</Badge>
        </div>
      </Card>

      {!current && (
        <ErrorBanner message="Select a project in the Project Manager to view its assets." />
      )}

      {current && filtered.length === 0 && (
        <Empty
          icon={<FolderOpen className="h-7 w-7" />}
          title="No assets yet"
          message="Save images from the Image Generator and they'll appear here."
        />
      )}

      {filtered.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <AnimatePresence>
            {filtered.map((asset, i) => (
              <motion.div
                key={asset.id + i}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <Card className="overflow-hidden p-0">
                  <div className="relative aspect-video">
                    <img src={asset.thumb} alt={asset.title} className="h-full w-full object-cover" loading="lazy" />
                    {asset.type === "video" && (
                      <div className="absolute left-2 top-2">
                        <Badge color="primary"><Video className="mr-1 h-3 w-3" /> {asset.duration}s</Badge>
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="truncate text-xs text-slate-300">{asset.title}</p>
                    <p className="mt-0.5 text-[10px] text-slate-500">{asset.source} · {asset.license}</p>
                    <div className="mt-2 flex gap-2">
                      <button onClick={() => handleDownload(asset)} className="btn-ghost py-1.5 text-[10px]">
                        <Download className="h-3 w-3" /> Download
                      </button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
