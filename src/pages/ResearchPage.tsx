import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Search,
  TrendingUp,
  Save,
  Sparkles,
  ArrowRight,
  Eye,
  Swords,
  Target,
  Flame,
} from "lucide-react";
import { SectionTitle, Card, Badge, ErrorBanner, ProgressBar } from "../components/ui/Primitives";
import { Generating } from "../components/ui/Generating";
import { geminiResearch, geminiTrend } from "../lib/api";
import { useProjectContext } from "../lib/useProjectContext";
import { formatNumber } from "../lib/utils";
import type { ResearchIdea } from "../lib/types";

export default function ResearchPage() {
  const navigate = useNavigate();
  const { current, createProject, saveEntry, appendEntry, getEntriesByType } = useProjectContext();

  const [keyword, setKeyword] = useState("");
  const [country, setCountry] = useState("United States");
  const [language, setLanguage] = useState("English");
  const [length, setLength] = useState("8-12 min");
  const [ideas, setIdeas] = useState<ResearchIdea[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  // Trend state
  const [trend, setTrend] = useState<{ rising: string[]; saturated: string[]; underexplored: string[]; recommendation: string } | null>(null);
  const [trendLoading, setTrendLoading] = useState(false);

  const handleResearch = async () => {
    if (!keyword.trim()) { setError("Enter a keyword or topic to research."); return; }
    setLoading(true);
    setError(null);
    setSaved(false);
    try {
      const result = await geminiResearch({ keyword, country, language, length });
      setIdeas(result.ideas);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Research failed");
    } finally {
      setLoading(false);
    }
  };

  const handleTrend = async () => {
    if (!keyword.trim()) { setError("Enter a keyword first."); return; }
    setTrendLoading(true);
    setError(null);
    try {
      const result = await geminiTrend({ topic: keyword });
      setTrend(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Trend analysis failed");
    } finally {
      setTrendLoading(false);
    }
  };

  const handleSave = async (idea: ResearchIdea) => {
    try {
      let projectId = current?.id;
      if (!projectId) {
        const project = await createProject(idea.title, idea.angle);
        projectId = project.id;
      }
      await appendEntry(projectId, "research", { idea, keyword, country, language, length });
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save idea");
    }
  };

  const handleUseForScript = (idea: ResearchIdea) => {
    handleSave(idea).then(() => navigate("/dashboard/script"));
  };

  return (
    <div className="space-y-6">
      <SectionTitle
        title="AI Research"
        subtitle="Discover trending documentary ideas with Gemini. Get difficulty, virality, and competition scores."
        icon={<Search className="h-5 w-5" />}
      />

      {/* Search bar */}
      <Card>
        <div className="flex flex-wrap gap-3">
          <input
            type="text"
            placeholder="Enter a topic or keyword (e.g. ancient civilizations, cold war, space race)"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleResearch()}
            className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-primary-500/50 focus:outline-none"
          />
          <select value={country} onChange={(e) => setCountry(e.target.value)} className="rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-white focus:border-primary-500/50">
            <option>United States</option><option>United Kingdom</option><option>India</option><option>Germany</option><option>Brazil</option><option>Japan</option>
          </select>
          <select value={language} onChange={(e) => setLanguage(e.target.value)} className="rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-white focus:border-primary-500/50">
            <option>English</option><option>Arabic</option><option>Spanish</option><option>French</option><option>Hindi</option>
          </select>
          <select value={length} onChange={(e) => setLength(e.target.value)} className="rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-white focus:border-primary-500/50">
            <option>5-8 min</option><option>8-12 min</option><option>12-20 min</option><option>20+ min</option>
          </select>
          <button onClick={handleResearch} disabled={loading} className="btn-primary py-3">
            <Search className="h-4 w-4" /> Research
          </button>
          <button onClick={handleTrend} disabled={trendLoading} className="btn-ghost py-3">
            <TrendingUp className="h-4 w-4" /> Trend Analysis
          </button>
        </div>
      </Card>

      {error && <ErrorBanner message={error} onRetry={() => setError(null)} />}

      {loading && <Generating message="Gemini is researching trending documentary ideas..." />}

      {/* Trend analysis */}
      {trend && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <h3 className="mb-4 flex items-center gap-2 font-display text-lg font-semibold text-white">
              <TrendingUp className="h-5 w-5 text-primary-300" /> Trend Analysis for "{keyword}"
            </h3>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <Badge color="success"><Flame className="mr-1 h-3 w-3" /> Rising</Badge>
                <ul className="mt-3 space-y-1.5 text-sm text-slate-300">
                  {trend.rising.map((t, i) => <li key={i} className="rounded-lg bg-white/5 px-3 py-1.5">{t}</li>)}
                </ul>
              </div>
              <div>
                <Badge color="error"><Swords className="mr-1 h-3 w-3" /> Saturated</Badge>
                <ul className="mt-3 space-y-1.5 text-sm text-slate-300">
                  {trend.saturated.map((t, i) => <li key={i} className="rounded-lg bg-white/5 px-3 py-1.5">{t}</li>)}
                </ul>
              </div>
              <div>
                <Badge color="accent"><Target className="mr-1 h-3 w-3" /> Underexplored</Badge>
                <ul className="mt-3 space-y-1.5 text-sm text-slate-300">
                  {trend.underexplored.map((t, i) => <li key={i} className="rounded-lg bg-white/5 px-3 py-1.5">{t}</li>)}
                </ul>
              </div>
            </div>
            <div className="mt-4 rounded-xl border border-primary-500/20 bg-primary-500/10 p-4 text-sm text-slate-200">
              <span className="font-semibold text-primary-300">Recommendation: </span>{trend.recommendation}
            </div>
          </Card>
        </motion.div>
      )}

      {/* Results */}
      {ideas.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-lg font-semibold text-white">{ideas.length} Documentary Ideas</h3>
            {saved && <Badge color="success"><Save className="mr-1 h-3 w-3" /> Saved to project</Badge>}
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {ideas.map((idea, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                <Card>
                  <div className="flex items-start justify-between gap-3">
                    <h4 className="font-medium text-white">{idea.title}</h4>
                    <Badge color="accent">{formatNumber(idea.estimatedViews)} views</Badge>
                  </div>
                  <p className="mt-2 text-sm text-slate-400">{idea.angle}</p>
                  <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
                    <ScoreBar label="Virality" value={idea.virality} color="from-primary-500 to-accent-500" icon={<Flame className="h-3 w-3" />} />
                    <ScoreBar label="Difficulty" value={idea.difficulty} color="from-warning-500 to-error-500" icon={<Target className="h-3 w-3" />} />
                    <ScoreBar label="Competition" value={idea.competition} color="from-error-500 to-warning-500" icon={<Swords className="h-3 w-3" />} />
                  </div>
                  <div className="mt-4 flex gap-2">
                    <button onClick={() => handleSave(idea)} className="btn-ghost py-2 text-xs">
                      <Save className="h-3.5 w-3.5" /> Save
                    </button>
                    <button onClick={() => handleUseForScript(idea)} className="btn-primary py-2 text-xs">
                      <ArrowRight className="h-3.5 w-3.5" /> Use for Script
                    </button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {!loading && ideas.length === 0 && !error && (
        <Card>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Sparkles className="mb-3 h-10 w-10 text-slate-600" />
            <p className="text-sm text-slate-300">Enter a topic above to generate documentary ideas</p>
            <p className="mt-1 text-xs text-slate-500">Gemini will analyze trends and suggest 6 ideas with scores</p>
          </div>
        </Card>
      )}
    </div>
  );
}

function ScoreBar({ label, value, color, icon }: { label: string; value: number; color: string; icon: React.ReactNode }) {
  return (
    <div>
      <div className="mb-1 flex items-center gap-1 text-slate-400">{icon}{label}</div>
      <ProgressBar value={value} color={color} />
      <p className="mt-0.5 text-right text-[10px] text-slate-500">{value}/100</p>
    </div>
  );
}
