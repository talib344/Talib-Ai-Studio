import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import {
  Video as VideoIcon,
  Search,
  Film,
  Sparkles,
  Plus,
  FileText,
  Mic,
  Image,
  Upload,
  ArrowRight,
  FolderKanban,
} from "lucide-react";
import { StatCard, Card, Badge, ProgressBar, ErrorBanner } from "../components/ui/Primitives";
import { formatNumber, timeAgo } from "../lib/utils";
import { useProjectContext } from "../lib/useProjectContext";

const quickActions = [
  { to: "/dashboard/research", label: "Research a topic", icon: Search, color: "from-primary-500/20 to-accent-500/20" },
  { to: "/dashboard/script", label: "Write a script", icon: FileText, color: "from-success-500/20 to-accent-500/20" },
  { to: "/dashboard/voice", label: "Generate voice", icon: Mic, color: "from-warning-500/20 to-primary-500/20" },
  { to: "/dashboard/thumbnail", label: "Make thumbnail", icon: Image, color: "from-error-500/20 to-primary-500/20" },
];

export default function DashboardHome() {
  const navigate = useNavigate();
  const { projects, loading, error, loadProjects, selectProject, entries } = useProjectContext();

  const totalEntries = entries.length;
  const researchCount = entries.filter((e) => e.entry_type === "research").length;
  const scriptCount = entries.filter((e) => e.entry_type === "script").length;

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold text-white">Welcome to your AI Studio</h1>
            <p className="mt-1 text-slate-400">Your free documentary pipeline. Pick up where you left off or start something new.</p>
          </div>
          <Link to="/dashboard/research" className="btn-primary">
            <Plus className="h-4 w-4" /> New Documentary
          </Link>
        </div>
      </motion.div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Projects" value={String(projects.length)} icon={<FolderKanban className="h-5 w-5" />} trend={projects.length > 0 ? `${projects.length} total` : "none yet"} />
        <StatCard label="Saved Items" value={String(totalEntries)} icon={<VideoIcon className="h-5 w-5" />} accent="from-accent-500/20 to-primary-500/20" trend={totalEntries > 0 ? "across all modules" : "empty"} />
        <StatCard label="Research Ideas" value={String(researchCount)} icon={<Search className="h-5 w-5" />} accent="from-warning-500/20 to-primary-500/20" />
        <StatCard label="Scripts" value={String(scriptCount)} icon={<FileText className="h-5 w-5" />} accent="from-success-500/20 to-accent-500/20" />
      </div>

      {error && <ErrorBanner message={error} onRetry={() => loadProjects()} />}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent projects */}
        <Card className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-white">Recent Projects</h2>
            <Link to="/dashboard/projects" className="text-xs text-primary-300 hover:text-primary-200">View all</Link>
          </div>
          {loading && projects.length === 0 ? (
            <div className="py-8 text-center text-sm text-slate-400">Loading projects...</div>
          ) : projects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <FolderKanban className="mb-3 h-10 w-10 text-slate-600" />
              <p className="text-sm text-slate-300">No projects yet</p>
              <p className="mt-1 text-xs text-slate-500">Start by researching a topic — your project will be created automatically.</p>
              <Link to="/dashboard/research" className="btn-primary mt-4 py-2 text-xs">
                <Plus className="h-3.5 w-3.5" /> Start Researching
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {projects.slice(0, 6).map((p, i) => (
                <motion.button
                  key={p.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => { selectProject(p.id); navigate("/dashboard/script"); }}
                  className="flex w-full items-center gap-4 rounded-xl border border-white/5 bg-white/[0.02] p-3 text-left transition-colors hover:bg-white/[0.05]"
                >
                  <div className="h-12 w-16 shrink-0 rounded-lg bg-gradient-to-br from-primary-500/30 to-accent-500/20" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-white">{p.title}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <Badge color={p.status === "Completed" ? "success" : p.progress > 0 ? "primary" : "neutral"}>
                        {p.status}
                      </Badge>
                      <span className="text-xs text-slate-500">{timeAgo(p.updated_at)}</span>
                    </div>
                  </div>
                  <div className="hidden w-28 sm:block">
                    <ProgressBar value={p.progress} />
                    <p className="mt-1 text-right text-[10px] text-slate-500">{p.progress}%</p>
                  </div>
                </motion.button>
              ))}
            </div>
          )}
        </Card>

        {/* Quick actions */}
        <Card>
          <h2 className="mb-4 font-display text-lg font-semibold text-white">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((a) => (
              <Link
                key={a.to}
                to={a.to}
                className="group rounded-xl border border-white/5 bg-white/[0.02] p-4 transition-all hover:-translate-y-0.5 hover:border-white/15 hover:bg-white/[0.05]"
              >
                <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${a.color} ring-1 ring-white/10`}>
                  <a.icon className="h-5 w-5 text-white" />
                </div>
                <p className="text-sm font-medium text-white">{a.label}</p>
                <ArrowRight className="mt-1 h-3.5 w-3.5 text-slate-500 transition-transform group-hover:translate-x-1 group-hover:text-primary-300" />
              </Link>
            ))}
          </div>
          <Link to="/dashboard/projects" className="mt-4 flex items-center justify-center gap-2 rounded-xl border border-white/5 bg-white/[0.02] p-3 text-sm text-slate-300 transition-colors hover:bg-white/[0.05]">
            <FolderKanban className="h-4 w-4" /> Open Project Manager
          </Link>
        </Card>
      </div>

      {/* Module overview */}
      <Card>
        <h2 className="mb-4 font-display text-lg font-semibold text-white">Studio Modules</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { to: "/dashboard/research", label: "AI Research", icon: Search },
            { to: "/dashboard/script", label: "Script Generator", icon: FileText },
            { to: "/dashboard/scenes", label: "Scene Planner", icon: Film },
            { to: "/dashboard/image-generator", label: "Image Generator", icon: Image },
            { to: "/dashboard/voice", label: "Voice Studio", icon: Mic },
            { to: "/dashboard/video", label: "Video Studio", icon: VideoIcon },
            { to: "/dashboard/seo", label: "SEO Optimizer", icon: Sparkles },
            { to: "/dashboard/upload", label: "YouTube Publisher", icon: Upload },
          ].map((m) => (
            <Link
              key={m.to}
              to={m.to}
              className="group flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-3 transition-all hover:border-white/15 hover:bg-white/[0.05]"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 ring-1 ring-white/10">
                <m.icon className="h-4 w-4 text-slate-300 group-hover:text-primary-300" />
              </div>
              <span className="text-sm text-slate-300 group-hover:text-white">{m.label}</span>
            </Link>
          ))}
        </div>
      </Card>
    </div>
  );
}
