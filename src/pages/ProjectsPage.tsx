import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  FolderKanban,
  Plus,
  Trash2,
  Folder,
  FileText,
  Image as ImageIcon,
  Mic,
  Video,
  BarChart3,
  Search,
  Film,
  Upload,
  ArrowRight,
  X,
} from "lucide-react";
import { SectionTitle, Card, Badge, ErrorBanner, ProgressBar, Empty } from "../components/ui/Primitives";
import { useProjectContext } from "../lib/useProjectContext";
import { formatNumber, timeAgo } from "../lib/utils";
import type { EntryType } from "../lib/types";

const ENTRY_LABELS: Record<EntryType, { label: string; icon: React.ReactNode }> = {
  research: { label: "Research", icon: <Search className="h-3.5 w-3.5" /> },
  script: { label: "Script", icon: <FileText className="h-3.5 w-3.5" /> },
  scenes: { label: "Scenes", icon: <Film className="h-3.5 w-3.5" /> },
  image_search: { label: "Image Search", icon: <ImageIcon className="h-3.5 w-3.5" /> },
  selected_images: { label: "Images", icon: <ImageIcon className="h-3.5 w-3.5" /> },
  voice: { label: "Voice", icon: <Mic className="h-3.5 w-3.5" /> },
  video: { label: "Video", icon: <Video className="h-3.5 w-3.5" /> },
  thumbnail: { label: "Thumbnail", icon: <ImageIcon className="h-3.5 w-3.5" /> },
  seo: { label: "SEO", icon: <BarChart3 className="h-3.5 w-3.5" /> },
  log: { label: "Log", icon: <FileText className="h-3.5 w-3.5" /> },
  upload_history: { label: "Upload", icon: <Upload className="h-3.5 w-3.5" /> },
};

export default function ProjectsPage() {
  const navigate = useNavigate();
  const { projects, loading, error, loadProjects, createProject, deleteProject, selectProject, loadEntries, entries } = useProjectContext();
  const [showNew, setShowNew] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newTopic, setNewTopic] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!newTitle.trim()) return;
    try {
      await createProject(newTitle, newTopic);
      setShowNew(false);
      setNewTitle("");
      setNewTopic("");
    } catch {
      // ignore
    }
  };

  const handleSelect = async (id: string) => {
    await selectProject(id);
    setSelectedProjectId(id);
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Delete this project and all its contents?")) return;
    await deleteProject(id);
    if (selectedProjectId === id) setSelectedProjectId(null);
  };

  const selectedEntries = selectedProjectId ? entries : [];

  return (
    <div className="space-y-6">
      <SectionTitle
        title="Project Manager"
        subtitle="Every project contains scripts, assets, images, voice, video, thumbnails, SEO and history — all in one place."
        icon={<FolderKanban className="h-5 w-5" />}
        action={
          <button onClick={() => setShowNew(true)} className="btn-primary py-2.5 text-sm">
            <Plus className="h-4 w-4" /> New Project
          </button>
        }
      />

      {error && <ErrorBanner message={error} onRetry={() => loadProjects()} />}

      {/* New project modal */}
      <AnimatePresence>
        {showNew && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
            onClick={() => setShowNew(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="glass w-full max-w-md p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-display text-lg font-semibold text-white">New Project</h3>
                <button onClick={() => setShowNew(false)} className="text-slate-400 hover:text-white"><X className="h-5 w-5" /></button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="mb-1 block text-xs text-slate-400">Project Title</label>
                  <input type="text" value={newTitle} onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. The Fall of Ancient Rome"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-primary-500/50 focus:outline-none" />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-slate-400">Topic (optional)</label>
                  <input type="text" value={newTopic} onChange={(e) => setNewTopic(e.target.value)}
                    placeholder="e.g. Roman Empire collapse"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-primary-500/50 focus:outline-none" />
                </div>
                <button onClick={handleCreate} className="btn-primary w-full py-2.5">Create Project</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Project list */}
        <Card className="lg:col-span-1">
          <h3 className="mb-4 font-display text-sm font-semibold text-white">All Projects ({projects.length})</h3>
          {loading && projects.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-400">Loading...</p>
          ) : projects.length === 0 ? (
            <p className="py-6 text-center text-xs text-slate-500">No projects yet. Create one to get started.</p>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {projects.map((p) => (
                <motion.button
                  key={p.id}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  onClick={() => handleSelect(p.id)}
                  className={`group flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-all ${
                    selectedProjectId === p.id ? "border-primary-500/50 bg-primary-500/10" : "border-white/5 bg-white/[0.02] hover:bg-white/[0.05]"
                  }`}
                >
                  <Folder className={`h-5 w-5 shrink-0 ${selectedProjectId === p.id ? "text-primary-300" : "text-slate-500"}`} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-white">{p.title}</p>
                    <p className="text-[10px] text-slate-500">{timeAgo(p.updated_at)} · {p.status}</p>
                  </div>
                  <button onClick={(e) => handleDelete(p.id, e)} className="text-slate-500 opacity-0 transition-opacity hover:text-error-400 group-hover:opacity-100">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </motion.button>
              ))}
            </div>
          )}
        </Card>

        {/* Project detail */}
        <div className="lg:col-span-2">
          {selectedProjectId ? (
            <ProjectDetail
              projectId={selectedProjectId}
              entries={selectedEntries}
              onNavigate={(path) => navigate(path)}
            />
          ) : (
            <Empty
              icon={<FolderKanban className="h-7 w-7" />}
              title="Select a project"
              message="Choose a project from the list to view its contents, or create a new one."
            />
          )}
        </div>
      </div>
    </div>
  );
}

function ProjectDetail({ projectId, entries, onNavigate }: {
  projectId: string;
  entries: { id: string; entry_type: EntryType; data: Record<string, unknown>; created_at: string }[];
  onNavigate: (path: string) => void;
}) {
  const { projects } = useProjectContext();
  const project = projects.find((p) => p.id === projectId);

  if (!project) return null;

  // Group entries by type
  const byType: Partial<Record<EntryType, typeof entries>> = {};
  for (const e of entries) {
    if (!byType[e.entry_type]) byType[e.entry_type] = [];
    byType[e.entry_type]!.push(e);
  }

  const modules: { type: EntryType; path: string }[] = [
    { type: "research", path: "/dashboard/research" },
    { type: "script", path: "/dashboard/script" },
    { type: "scenes", path: "/dashboard/scenes" },
    { type: "selected_images", path: "/dashboard/image-generator" },
    { type: "voice", path: "/dashboard/voice" },
    { type: "video", path: "/dashboard/video" },
    { type: "thumbnail", path: "/dashboard/thumbnail" },
    { type: "seo", path: "/dashboard/seo" },
    { type: "upload_history", path: "/dashboard/upload" },
  ];

  return (
    <div className="space-y-4">
      <Card>
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-display text-lg font-semibold text-white">{project.title}</h3>
            <p className="mt-1 text-sm text-slate-400">{project.topic || "No topic set"}</p>
          </div>
          <Badge color={project.status === "Completed" ? "success" : project.progress > 0 ? "primary" : "neutral"}>
            {project.status}
          </Badge>
        </div>
        <div className="mt-4">
          <ProgressBar value={project.progress} />
          <p className="mt-1 text-right text-xs text-slate-500">{project.progress}% complete</p>
        </div>
      </Card>

      <div className="grid gap-3 sm:grid-cols-2">
        {modules.map((m) => {
          const items = byType[m.type] || [];
          const meta = ENTRY_LABELS[m.type];
          const hasContent = items.length > 0;
          return (
            <button
              key={m.type}
              onClick={() => onNavigate(m.path)}
              className="group flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-4 text-left transition-all hover:border-white/15 hover:bg-white/[0.05]"
            >
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ring-1 ${hasContent ? "bg-primary-500/15 ring-primary-500/20 text-primary-300" : "bg-white/5 ring-white/10 text-slate-500"}`}>
                {meta.icon}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-white">{meta.label}</p>
                <p className="text-xs text-slate-500">{hasContent ? `${items.length} item${items.length > 1 ? "s" : ""}` : "Empty"}</p>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-500 transition-transform group-hover:translate-x-1 group-hover:text-primary-300" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
