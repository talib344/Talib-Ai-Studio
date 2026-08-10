import { NavLink, Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Search,
  FileText,
  Film,
  Image as ImageIcon,
  FolderOpen,
  Mic,
  Video,
  Image,
  BarChart3,
  Upload,
  Settings,
  Play,
  Sparkles,
  FolderKanban,
} from "lucide-react";
import { cn } from "../../lib/utils";

const nav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/dashboard/research", label: "AI Research", icon: Search },
  { to: "/dashboard/script", label: "Script Generator", icon: FileText },
  { to: "/dashboard/scenes", label: "Scene Planner", icon: Film },
  { to: "/dashboard/image-generator", label: "Image Generator", icon: ImageIcon },
  { to: "/dashboard/assets", label: "Asset Library", icon: FolderOpen },
  { to: "/dashboard/voice", label: "Voice Studio", icon: Mic },
  { to: "/dashboard/video", label: "Video Studio", icon: Video },
  { to: "/dashboard/thumbnail", label: "Thumbnail Studio", icon: Image },
  { to: "/dashboard/seo", label: "SEO Optimizer", icon: BarChart3 },
  { to: "/dashboard/upload", label: "YouTube Publisher", icon: Upload },
  { to: "/dashboard/projects", label: "Project Manager", icon: FolderKanban },
  { to: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/dashboard/settings", label: "Settings", icon: Settings },
];

export default function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const location = useLocation();
  return (
    <aside className="flex h-full w-64 flex-col border-r border-white/5 bg-[#0a1020]/80 backdrop-blur-xl">
      <Link to="/" className="flex items-center gap-2.5 px-5 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 shadow-lg shadow-primary-500/30">
          <Play className="h-4 w-4 fill-white text-white" />
        </div>
        <div>
          <p className="font-display text-sm font-bold text-white leading-tight">Talib AI Studio</p>
          <p className="text-[10px] uppercase tracking-wider text-slate-500">Free Personal Studio</p>
        </div>
      </Link>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2 scrollbar-none">
        {nav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                isActive ? "text-white" : "text-slate-400 hover:text-white hover:bg-white/5"
              )
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary-500/20 to-accent-500/20 ring-1 ring-primary-500/30"
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  />
                )}
                <item.icon className={cn("relative h-4 w-4 shrink-0", isActive && "text-primary-300")} />
                <span className="relative">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="m-3 rounded-xl border border-white/10 bg-gradient-to-br from-success-500/10 to-accent-500/10 p-4">
        <div className="flex items-center gap-2 text-success-400">
          <Sparkles className="h-4 w-4" />
          <span className="text-xs font-semibold">Free Forever</span>
        </div>
        <p className="mt-2 text-xs text-slate-400">Powered by Gemini &amp; Pexels. No plans, no limits.</p>
      </div>
    </aside>
  );
}
