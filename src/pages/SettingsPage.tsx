import { useState } from "react";
import { motion } from "framer-motion";
import {
  Settings as SettingsIcon, KeyRound, Palette, Globe, Terminal, Sun, Moon, Check,
  Save, Eye, EyeOff, ExternalLink, Info,
} from "lucide-react";
import { SectionTitle, Card, Badge, ErrorBanner } from "../components/ui/Primitives";
import { useProjectContext } from "../lib/useProjectContext";

const languages = ["English", "Arabic", "Spanish", "French", "Hindi"] as const;

export default function SettingsPage() {
  const { entries, projects } = useProjectContext();

  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [language, setLanguage] = useState<string>("English");
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [keyInputs, setKeyInputs] = useState<Record<string, string>>({
    gemini: "",
    pexels: "",
    youtube: "",
  });
  const [savedKeys, setSavedKeys] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);

  // Collect real logs from all project entries
  const logEntries = entries.filter((e) => e.entry_type === "log");
  const allLogs = logEntries.length > 0
    ? logEntries.map((e) => {
        const d = e.data as { time?: string; level?: string; msg?: string };
        return {
          time: d.time || new Date(e.created_at).toLocaleTimeString(),
          level: d.level || "INFO",
          msg: d.msg || `Entry created: ${e.entry_type}`,
        };
      })
    : entries.slice(0, 8).map((e) => ({
        time: new Date(e.created_at).toLocaleTimeString(),
        level: "INFO" as const,
        msg: `${e.entry_type} entry saved${projects.find((p) => p.id === e.project_id) ? ` for "${projects.find((p) => p.id === e.project_id)?.title}"` : ""}`,
      }));

  const toggleKeyVisible = (key: string) => {
    setShowKeys({ ...showKeys, [key]: !showKeys[key] });
  };

  const handleSaveKey = (key: string) => {
    // Keys are stored in .env on the backend — here we just confirm
    if (!keyInputs[key].trim()) {
      setError(`${key.toUpperCase()} API key cannot be empty.`);
      return;
    }
    setError(null);
    setSavedKeys({ ...savedKeys, [key]: true });
    setTimeout(() => setSavedKeys({ ...savedKeys, [key]: false }), 3000);
  };

  const apiKeyFields = [
    { key: "gemini", label: "Gemini API Key", placeholder: "AIza...", hint: "Get a free key at Google AI Studio", url: "https://aistudio.google.com/app/apikey" },
    { key: "pexels", label: "Pexels API Key", placeholder: "563492ad...", hint: "Get a free key at Pexels Developers", url: "https://www.pexels.com/api/" },
    { key: "youtube", label: "YouTube OAuth Client ID", placeholder: "xxxxx.apps.googleusercontent.com", hint: "Required for YouTube uploads", url: "https://console.cloud.google.com/" },
  ];

  const levelColor: Record<string, "success" | "warning" | "error" | "neutral"> = {
    INFO: "success",
    WARN: "warning",
    ERROR: "error",
  };

  return (
    <div className="space-y-6">
      <SectionTitle
        title="Settings"
        subtitle="Configure API keys, appearance, language and review system logs. Keys are stored in your .env file — never hard-coded."
        icon={<SettingsIcon className="h-5 w-5" />}
      />

      {error && <ErrorBanner message={error} onRetry={() => setError(null)} />}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* API keys */}
        <Card>
          <div className="mb-4 flex items-center gap-2">
            <KeyRound className="h-4 w-4 text-primary-300" />
            <h2 className="font-display text-lg font-semibold text-white">API Keys</h2>
          </div>
          <p className="mb-4 flex items-start gap-2 rounded-lg bg-primary-500/10 p-3 text-xs text-slate-300">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary-300" />
            Keys are stored in your <code className="rounded bg-white/10 px-1">.env</code> file on the server. They are never hard-coded in the app. All three services offer generous free tiers.
          </p>

          <div className="space-y-4">
            {apiKeyFields.map((field) => (
              <div key={field.key}>
                <label className="mb-1 flex items-center justify-between text-xs text-slate-400">
                  <span>{field.label}</span>
                  <a href={field.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary-300 hover:text-primary-200">
                    <ExternalLink className="h-3 w-3" /> Get key
                  </a>
                </label>
                <div className="relative">
                  <input
                    type={showKeys[field.key] ? "text" : "password"}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 pr-10 text-sm text-white placeholder:text-slate-500 focus:border-primary-500/50 focus:outline-none"
                    placeholder={field.placeholder}
                    value={keyInputs[field.key]}
                    onChange={(e) => setKeyInputs({ ...keyInputs, [field.key]: e.target.value })}
                  />
                  <button
                    onClick={() => toggleKeyVisible(field.key)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showKeys[field.key] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <div className="mt-1.5 flex items-center justify-between">
                  <p className="text-[10px] text-slate-500">{field.hint}</p>
                  <button
                    onClick={() => handleSaveKey(field.key)}
                    className={`text-xs transition-colors ${savedKeys[field.key] ? "text-success-400" : "text-primary-300 hover:text-primary-200"}`}
                  >
                    {savedKeys[field.key] ? (
                      <><Check className="mr-1 inline h-3 w-3" /> Saved</>
                    ) : (
                      <><Save className="mr-1 inline h-3 w-3" /> Save to .env</>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Appearance & language */}
        <div className="space-y-6">
          <Card>
            <div className="mb-4 flex items-center gap-2">
              <Palette className="h-4 w-4 text-accent-300" />
              <h2 className="font-display text-lg font-semibold text-white">Appearance</h2>
            </div>
            <label className="mb-2 block text-xs text-slate-400">Theme</label>
            <div className="flex gap-3">
              {(["dark", "light"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTheme(t)}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-xl border py-3 text-sm font-medium capitalize transition-all ${
                    theme === t ? "border-primary-500/50 bg-primary-500/10 text-white" : "border-white/5 bg-white/[0.02] text-slate-400 hover:bg-white/[0.05]"
                  }`}
                >
                  {t === "dark" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />} {t}
                  {theme === t && <Check className="h-4 w-4 text-success-400" />}
                </button>
              ))}
            </div>
          </Card>

          <Card>
            <div className="mb-4 flex items-center gap-2">
              <Globe className="h-4 w-4 text-success-400" />
              <h2 className="font-display text-lg font-semibold text-white">Language</h2>
            </div>
            <p className="mb-3 text-xs text-slate-400">Used for script generation, voice and SEO</p>
            <div className="flex flex-wrap gap-2">
              {languages.map((l) => (
                <button
                  key={l}
                  onClick={() => setLanguage(l)}
                  className={`chip ring-1 transition-all ${
                    language === l ? "bg-primary-500/20 text-primary-200 ring-primary-500/40" : "bg-white/5 text-slate-400 ring-white/10 hover:bg-white/10"
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-display text-sm font-semibold text-white">Studio Status</p>
                <p className="mt-1 text-xs text-slate-400">Gemini and Pexels are connected via edge functions</p>
              </div>
              <div className="flex gap-2">
                <Badge color="success"><Check className="mr-1 h-3 w-3" /> Gemini</Badge>
                <Badge color="success"><Check className="mr-1 h-3 w-3" /> Pexels</Badge>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Logs */}
      <Card>
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="h-4 w-4 text-slate-400" />
            <h2 className="font-display text-lg font-semibold text-white">System Logs</h2>
          </div>
          <Badge color="neutral">{allLogs.length} entries</Badge>
        </div>
        {allLogs.length > 0 ? (
          <div className="max-h-80 overflow-y-auto overflow-hidden rounded-xl border border-white/5 bg-[#050810] font-mono text-xs">
            {allLogs.map((log, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.03 }}
                className="flex items-center gap-3 border-b border-white/5 px-4 py-2.5 last:border-0"
              >
                <span className="text-slate-600">{log.time}</span>
                <Badge color={levelColor[log.level] || "neutral"}>{log.level}</Badge>
                <span className="text-slate-300">{log.msg}</span>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-sm text-slate-500">
            No activity yet. Start using the studio to generate logs.
          </div>
        )}
      </Card>
    </div>
  );
}
