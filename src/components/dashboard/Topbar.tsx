import { Search, Bell, Menu, Sun, Moon } from "lucide-react";
import { useSettingsStore } from "../../lib/store";

export default function Topbar({ onMenu }: { onMenu: () => void }) {
  const { theme, setTheme } = useSettingsStore();
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-white/5 bg-[#070b16]/70 px-4 backdrop-blur-xl md:px-6">
      <button onClick={onMenu} className="rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white md:hidden">
        <Menu className="h-5 w-5" />
      </button>

      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
        <input
          placeholder="Search projects, scenes, assets..."
          className="w-full rounded-xl border border-white/10 bg-white/[0.04] py-2 pl-9 pr-4 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:border-primary-500/50 focus:ring-2 focus:ring-primary-500/15"
        />
      </div>

      <div className="ml-auto flex items-center gap-2">
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-white/5 hover:text-white"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>
        <button className="relative rounded-lg p-2 text-slate-400 transition-colors hover:bg-white/5 hover:text-white">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-primary-500 ring-2 ring-[#070b16]" />
        </button>
        <div className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/5 py-1.5 pl-1.5 pr-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 text-xs font-bold text-white">
            T
          </div>
          <div className="hidden sm:block">
            <p className="text-xs font-medium text-white leading-tight">Talib Creator</p>
            <p className="text-[10px] text-slate-500">Pro plan</p>
          </div>
        </div>
      </div>
    </header>
  );
}
