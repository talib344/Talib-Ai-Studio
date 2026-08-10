import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Play,
  Search,
  FileText,
  Film,
  Mic,
  Image as ImageIcon,
  Video,
  BarChart3,
  Upload,
  Sparkles,
  ShieldCheck,
  Zap,
  Globe,
  ChevronDown,
} from "lucide-react";
import { useState } from "react";

const features = [
  { icon: Search, title: "Topic Research", desc: "Trending documentary ideas with virality, competition and difficulty scoring." },
  { icon: FileText, title: "Script Generator", desc: "Hooks, scene-by-scene narration, endings and CTAs tuned for 8–12 minute videos." },
  { icon: Film, title: "Scene Breakdown", desc: "Automatic scene list with visuals, transitions and per-scene timing." },
  { icon: ImageIcon, title: "Image Prompts", desc: "Cinematic prompts across realistic, documentary, war, history and nature styles." },
  { icon: Mic, title: "AI Voice", desc: "Multilingual narrators with pitch, speed and live preview control." },
  { icon: Video, title: "Video Pipeline", desc: "Visualized render queue with timeline and 1080p export cards." },
  { icon: BarChart3, title: "SEO & Analytics", desc: "Titles, tags, hashtags, SEO score, retention and watch-time insights." },
  { icon: Upload, title: "Upload & Schedule", desc: "YouTube & Facebook publishing with scheduling and progress history." },
];

const steps = [
  { n: "01", title: "Enter a topic", desc: "Type any subject. Talib researches the strongest angle for it." },
  { n: "02", title: "Generate the script", desc: "Hooks, narration, scenes and CTAs — all structured for retention." },
  { n: "03", title: "Produce assets", desc: "Image prompts, voice, thumbnails and a full video render pipeline." },
  { n: "04", title: "Publish & optimize", desc: "SEO, scheduling and analytics in one continuous flow." },
];

const faqs = [
  { q: "Is Talib AI Studio really free?", a: "Yes. Talib AI Studio is a completely free personal AI studio. There are no paid plans, no tiers, and no subscriptions. Bring your own Gemini API key and Pexels API key (both have generous free tiers) and you're ready to go." },
  { q: "Which AI powers the studio?", a: "The studio connects to Google Gemini for research, scripting, scene planning, thumbnails, SEO, rewriting, expanding and translation. Stock images and videos come from the Pexels API." },
  { q: "What video length is supported?", a: "Scripts are optimized for 8–12 minute documentaries, the sweet spot for YouTube retention." },
  { q: "Can I publish directly to YouTube?", a: "The publisher module supports YouTube uploads, thumbnail uploads, scheduling, progress tracking and upload history." },
  { q: "Where is my data stored?", a: "Every project — scripts, assets, images, voice, video, thumbnails, SEO and history — is stored in a project system so you can pick up where you left off anytime." },
];

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="min-h-screen">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b border-white/5 bg-[#070b16]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 shadow-lg shadow-primary-500/30">
              <Play className="h-4 w-4 fill-white text-white" />
            </div>
            <span className="font-display text-lg font-bold text-white">Talib AI Studio</span>
          </Link>
          <nav className="hidden items-center gap-8 text-sm text-slate-300 md:flex">
            <a href="#features" className="transition-colors hover:text-white">Features</a>
            <a href="#how" className="transition-colors hover:text-white">How it works</a>
            <a href="#faq" className="transition-colors hover:text-white">FAQ</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link to="/dashboard" className="btn-primary py-2.5 text-sm">Launch Studio</Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern bg-[size:60px_60px] opacity-40 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />
        <div className="absolute left-1/2 top-1/3 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-primary-500/20 blur-[120px]" />
        <div className="relative mx-auto max-w-7xl px-6 py-28 text-center md:py-36">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mx-auto mb-6 flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs text-slate-300">
            <Sparkles className="h-3.5 w-3.5 text-primary-300" /> AI-powered documentary automation pipeline
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="mx-auto max-w-4xl font-display text-5xl font-extrabold leading-[1.05] tracking-tight text-white text-balance md:text-7xl">
            Create <span className="gradient-text">Viral Documentary Videos</span> with AI
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }} className="mx-auto mt-6 max-w-2xl text-lg text-slate-400 text-balance">
            From a single topic to a finished, SEO-optimized documentary — research, script, scenes, voice, video, thumbnail and upload. Powered by Gemini and Pexels. Completely free, forever.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }} className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Link to="/dashboard" className="btn-primary text-base">
              Start Creating <ArrowRight className="h-4 w-4" />
            </Link>
            <a href="#how" className="btn-ghost text-base">
              <Play className="h-4 w-4" /> See how it works
            </a>
          </motion.div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500">
            <span className="flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-success-400" /> 100% Free — no plans, no limits</span>
            <span className="flex items-center gap-1.5"><Zap className="h-4 w-4 text-warning-400" /> Powered by Gemini &amp; Pexels</span>
            <span className="flex items-center gap-1.5"><Globe className="h-4 w-4 text-accent-300" /> 5 languages</span>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="section-pad mx-auto max-w-7xl">
        <div className="mb-14 text-center">
          <h2 className="font-display text-3xl font-bold text-white md:text-4xl">Everything the pipeline needs</h2>
          <p className="mt-3 text-slate-400">Eight connected modules covering the full documentary production flow.</p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="glass card-hover group p-6"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500/20 to-accent-500/20 text-primary-300 ring-1 ring-white/10 transition-transform group-hover:scale-110">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="font-display text-lg font-semibold text-white">{f.title}</h3>
              <p className="mt-2 text-sm text-slate-400">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="section-pad mx-auto max-w-7xl">
        <div className="mb-14 text-center">
          <h2 className="font-display text-3xl font-bold text-white md:text-4xl">From topic to upload</h2>
          <p className="mt-3 text-slate-400">A continuous pipeline — no tool switching, no copy-paste.</p>
        </div>
        <div className="grid gap-5 md:grid-cols-4">
          {steps.map((s, i) => (
            <motion.div
              key={s.n}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="glass relative overflow-hidden p-6"
            >
              <span className="absolute -right-2 -top-4 font-display text-7xl font-bold text-white/5">{s.n}</span>
              <div className="mb-3 h-1 w-10 rounded-full bg-gradient-to-r from-primary-500 to-accent-500" />
              <h3 className="font-display text-lg font-semibold text-white">{s.title}</h3>
              <p className="mt-2 text-sm text-slate-400">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="section-pad mx-auto max-w-3xl">
        <div className="mb-12 text-center">
          <h2 className="font-display text-3xl font-bold text-white md:text-4xl">Frequently asked questions</h2>
        </div>
        <div className="space-y-3">
          {faqs.map((f, i) => (
            <div key={f.q} className="glass overflow-hidden">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="flex w-full items-center justify-between px-5 py-4 text-left"
              >
                <span className="font-medium text-white">{f.q}</span>
                <ChevronDown className={`h-5 w-5 shrink-0 text-slate-400 transition-transform ${openFaq === i ? "rotate-180" : ""}`} />
              </button>
              <motion.div
                initial={false}
                animate={{ height: openFaq === i ? "auto" : 0, opacity: openFaq === i ? 1 : 0 }}
                className="overflow-hidden"
              >
                <p className="px-5 pb-4 text-sm text-slate-400">{f.a}</p>
              </motion.div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="glass-strong relative overflow-hidden p-12 text-center">
          <div className="absolute left-1/2 top-0 h-64 w-96 -translate-x-1/2 rounded-full bg-primary-500/30 blur-[100px]" />
          <div className="relative">
            <h2 className="font-display text-3xl font-bold text-white md:text-4xl">Your next documentary starts now</h2>
            <p className="mx-auto mt-3 max-w-xl text-slate-400">Enter a topic and let the studio handle research, scripting, voice, video, thumbnail and SEO.</p>
            <Link to="/dashboard" className="btn-primary mt-7 text-base">Launch the Studio <ArrowRight className="h-4 w-4" /></Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 md:flex-row">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary-500 to-accent-500">
              <Play className="h-3.5 w-3.5 fill-white text-white" />
            </div>
            <span className="font-display font-bold text-white">Talib AI Studio</span>
          </div>
          <p className="text-sm text-slate-500">© 2026 Talib AI Studio. Built for documentary creators.</p>
          <div className="flex gap-5 text-sm text-slate-400">
            <a href="#features" className="hover:text-white">Features</a>
            <a href="#faq" className="hover:text-white">FAQ</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
