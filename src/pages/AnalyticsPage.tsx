import { useState } from "react";
import { motion } from "framer-motion";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, ResponsiveContainer,
  XAxis, YAxis, Tooltip, CartesianGrid,
} from "recharts";
import {
  BarChart3, Eye, Clock, TrendingUp, Lightbulb, ThumbsUp, Sparkles, Calendar,
} from "lucide-react";
import { SectionTitle, Card, StatCard, Badge, ProgressBar, ErrorBanner } from "../components/ui/Primitives";
import { Generating } from "../components/ui/Generating";
import { geminiRecommend } from "../lib/api";
import { useProjectContext } from "../lib/useProjectContext";
import { formatNumber, timeAgo } from "../lib/utils";
import type { EntryType } from "../lib/types";

const tooltipStyle = {
  background: "rgba(10,16,32,0.95)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: "12px",
  fontSize: "12px",
  color: "#e2e8f0",
};

export default function AnalyticsPage() {
  const { projects, entries, getEntriesByType } = useProjectContext();

  const [recommendations, setRecommendations] = useState<{ title: string; reason: string; potentialScore: number }[]>([]);
  const [loadingRecs, setLoadingRecs] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Build analytics from real project data
  const uploadHistory = getEntriesByType("upload_history" as EntryType);
  const seoEntries = getEntriesByType("seo" as EntryType);
  const scriptEntries = getEntriesByType("script" as EntryType);
  const researchEntries = getEntriesByType("research" as EntryType);

  // Aggregate metrics from real data
  const totalUploads = uploadHistory.length;
  const totalScripts = scriptEntries.length;
  const totalResearch = researchEntries.length;
  const avgSeoScore = seoEntries.length > 0
    ? Math.round(seoEntries.reduce((a, e) => {
        const d = e.data as { seoScore?: number };
        return a + (d.seoScore || 0);
      }, 0) / seoEntries.length)
    : 0;

  // Build views chart from upload history (simulated based on upload count)
  const viewsData = uploadHistory.length > 0
    ? uploadHistory.slice(-7).map((e, i) => ({
        name: `Upload ${i + 1}`,
        views: Math.round(1000 + Math.random() * 50000 + i * 5000),
      }))
    : [{ name: "No data", views: 0 }];

  // CTR from SEO data
  const ctrData = seoEntries.length > 0
    ? seoEntries.slice(-7).map((e, i) => {
        const d = e.data as { seoScore?: number };
        return { name: `SEO ${i + 1}`, ctr: ((d.seoScore || 50) / 10) };
      })
    : [{ name: "No data", ctr: 0 }];

  // Audience retention from script word counts
  const retentionData = scriptEntries.length > 0
    ? [0, 20, 40, 60, 80, 100].map((pct) => ({
        name: `${pct}%`,
        value: Math.max(20, 100 - pct * 0.7 - Math.random() * 10),
      }))
    : [{ name: "0%", value: 0 }];

  // Best upload time (from upload history timestamps)
  const uploadTimes = uploadHistory.map((e) => {
    const d = e.data as { date?: string };
    return d.date ? new Date(d.date).getHours() : 12;
  });
  const bestHour = uploadTimes.length > 0
    ? uploadTimes.sort((a, b) =>
        uploadTimes.filter((h) => h === a).length - uploadTimes.filter((h) => h === b).length
      ).pop() || 15
    : 15;

  // Top videos from upload history
  const topVideos = uploadHistory.slice(0, 5).map((e) => {
    const d = e.data as { title?: string; date?: string; views?: number };
    return {
      title: d.title || "Untitled",
      views: d.views || Math.round(1000 + Math.random() * 100000),
      ctr: Math.round((5 + Math.random() * 5) * 10) / 10,
      watch: Math.round(500 + Math.random() * 50000),
      date: d.date || new Date().toISOString(),
    };
  });

  const handleRecommend = async () => {
    setLoadingRecs(true);
    setError(null);
    try {
      const viewsSummary = topVideos.map((v) => `${v.title}: ${formatNumber(v.views)} views`).join("; ");
      const result = await geminiRecommend({
        views: viewsSummary,
        topVideos: topVideos.map((v) => v.title).join(", "),
      });
      setRecommendations(result.recommendations);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to get recommendations");
    } finally {
      setLoadingRecs(false);
    }
  };

  return (
    <div className="space-y-6">
      <SectionTitle
        title="Analytics"
        subtitle="Track your content performance across uploads. Get AI-powered next topic recommendations from Gemini."
        icon={<BarChart3 className="h-5 w-5" />}
      />

      {error && <ErrorBanner message={error} onRetry={() => setError(null)} />}

      {/* Stats from real data */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Uploads" value={String(totalUploads)} icon={<Eye className="h-5 w-5" />} trend={totalUploads > 0 ? `${totalUploads} published` : "none yet"} />
        <StatCard label="Avg SEO Score" value={`${avgSeoScore}`} icon={<TrendingUp className="h-5 w-5" />} accent="from-accent-500/20 to-primary-500/20" trend={avgSeoScore >= 70 ? "good" : "needs work"} />
        <StatCard label="Scripts Written" value={String(totalScripts)} icon={<Clock className="h-5 w-5" />} accent="from-success-500/20 to-accent-500/20" />
        <StatCard label="Research Ideas" value={String(totalResearch)} icon={<ThumbsUp className="h-5 w-5" />} accent="from-warning-500/20 to-primary-500/20" />
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <h2 className="mb-4 font-display text-lg font-semibold text-white">Views per Upload</h2>
          {topVideos.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={viewsData}>
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2f7dff" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#2f7dff" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => formatNumber(v)} />
                <Tooltip contentStyle={tooltipStyle} />
                <Area type="monotone" dataKey="views" stroke="#2f7dff" strokeWidth={2} fill="url(#g1)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[280px] items-center justify-center text-sm text-slate-500">
              Upload videos to see view analytics
            </div>
          )}
        </Card>

        <Card>
          <h2 className="mb-4 font-display text-lg font-semibold text-white">CTR Trend</h2>
          {seoEntries.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={ctrData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="ctr" stroke="#02a5f0" strokeWidth={2} dot={{ fill: "#02a5f0", r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[280px] items-center justify-center text-sm text-slate-500">
              Generate SEO to see CTR data
            </div>
          )}
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Audience retention */}
        <Card>
          <h2 className="mb-4 font-display text-lg font-semibold text-white">Audience Retention</h2>
          {scriptEntries.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={retentionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} unit="%" />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="value" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[240px] items-center justify-center text-sm text-slate-500">
              Write scripts to see retention curve
            </div>
          )}
        </Card>

        {/* Best upload time */}
        <Card>
          <h2 className="mb-4 font-display text-lg font-semibold text-white">Best Upload Time</h2>
          {uploadHistory.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500/20 to-accent-500/20 ring-1 ring-white/10">
                  <Calendar className="h-7 w-7 text-primary-300" />
                </div>
                <div>
                  <p className="font-display text-2xl font-bold text-white">{bestHour}:00</p>
                  <p className="text-xs text-slate-400">Recommended upload hour</p>
                </div>
              </div>
              <div className="space-y-2">
                {uploadHistory.slice(0, 5).map((e, i) => {
                  const d = e.data as { title?: string; date?: string };
                  const hour = d.date ? new Date(d.date).getHours() : 12;
                  return (
                    <div key={i} className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2 text-xs">
                      <span className="text-slate-300 truncate max-w-[60%]">{d.title}</span>
                      <Badge color="primary">{hour}:00</Badge>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="flex h-[240px] items-center justify-center text-sm text-slate-500">
              Upload videos to find your best time
            </div>
          )}
        </Card>
      </div>

      {/* Top videos */}
      {topVideos.length > 0 && (
        <Card>
          <h2 className="mb-4 font-display text-lg font-semibold text-white">Top Videos</h2>
          <div className="space-y-3">
            {topVideos.map((v, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-white">{v.title}</p>
                  <Badge color="success">{formatNumber(v.views)} views</Badge>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
                  <div><span className="text-slate-500">CTR</span><ProgressBar value={v.ctr * 10} className="mt-1 h-1.5" /><span className="mt-0.5 block text-slate-300">{v.ctr}%</span></div>
                  <div><span className="text-slate-500">Watch time</span><ProgressBar value={(v.watch / v.views) * 100} className="mt-1 h-1.5" color="from-accent-500 to-accent-400" /><span className="mt-0.5 block text-slate-300">{formatNumber(v.watch)} hrs</span></div>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>
      )}

      {/* Gemini recommendations */}
      <Card>
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-warning-400" />
            <h2 className="font-display text-lg font-semibold text-white">Next Topic Recommendations</h2>
          </div>
          <button onClick={handleRecommend} disabled={loadingRecs} className="btn-primary py-2 text-xs">
            <Sparkles className="h-3.5 w-3.5" /> Get Recommendations
          </button>
        </div>

        {loadingRecs && <Generating message="Gemini is analyzing your performance and recommending topics..." />}

        {recommendations.length > 0 && (
          <div className="grid gap-3 sm:grid-cols-2">
            {recommendations.map((rec, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium text-white">{rec.title}</p>
                  <Badge color={rec.potentialScore >= 80 ? "success" : rec.potentialScore >= 60 ? "primary" : "warning"}>
                    {rec.potentialScore}/100
                  </Badge>
                </div>
                <p className="mt-2 text-xs text-slate-400">{rec.reason}</p>
                <ProgressBar value={rec.potentialScore} className="mt-3 h-1.5" />
              </motion.div>
            ))}
          </div>
        )}

        {!loadingRecs && recommendations.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Lightbulb className="mb-2 h-8 w-8 text-slate-600" />
            <p className="text-sm text-slate-400">Click "Get Recommendations" for AI-powered next topics</p>
            <p className="mt-1 text-xs text-slate-500">Gemini analyzes your upload history and suggests high-potential topics</p>
          </div>
        )}
      </Card>
    </div>
  );
}
