import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Mic, Play, Pause, Square, Save, Download, Volume2 } from "lucide-react";
import { SectionTitle, Card, Badge, ErrorBanner } from "../components/ui/Primitives";
import { Generating } from "../components/ui/Generating";
import { getAvailableVoices, speak, stopSpeaking, type TTSConfig } from "../lib/api";
import { useProjectContext } from "../lib/useProjectContext";

export default function VoicePage() {
  const { current, saveEntry, getEntriesByType } = useProjectContext();

  const [text, setText] = useState("");
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [rate, setRate] = useState(1);
  const [pitch, setPitch] = useState(1);
  const [volume, setVolume] = useState(1);
  const [speaking, setSpeaking] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const utterRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    const loadVoices = () => {
      const v = getAvailableVoices();
      setVoices(v);
      if (v.length > 0 && !selectedVoice) setSelectedVoice(v[0]);
    };
    loadVoices();
    if (typeof speechSynthesis !== "undefined") {
      speechSynthesis.onvoiceschanged = loadVoices;
    }
    return () => {
      stopSpeaking();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const config: TTSConfig = { voice: selectedVoice, rate, pitch, volume };

  const handleSpeak = () => {
    if (!text.trim()) { setError("Enter narration text first."); return; }
    setError(null);
    setSpeaking(true);
    setGenerating(true);
    speak(text, config, () => {
      setSpeaking(false);
      setGenerating(false);
    });
  };

  const handleStop = () => {
    stopSpeaking();
    setSpeaking(false);
    setGenerating(false);
  };

  const handleSave = async () => {
    if (!text.trim()) return;
    try {
      const projectId = current?.id;
      if (!projectId) { setError("Create or select a project first."); return; }
      const voiceName = selectedVoice?.name || "Default";
      await saveEntry(projectId, "voice", { text, voice: voiceName, rate, pitch, volume });
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save narration");
    }
  };

  const handleDownload = () => {
    if (!text.trim()) return;
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "narration.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  // Load script from project if available
  const handleLoadScript = () => {
    const scriptEntries = getEntriesByType("script");
    if (scriptEntries.length > 0) {
      const data = scriptEntries[scriptEntries.length - 1].data as { scenes?: { section: string; content: string }[] };
      const scriptText = data.scenes?.map((s) => s.content).join("\n\n") || "";
      setText(scriptText);
    } else {
      setError("No script found in current project. Generate one in the Script Generator first.");
    }
  };

  return (
    <div className="space-y-6">
      <SectionTitle
        title="Voice Studio"
        subtitle="Generate narration with local text-to-speech. Pick a voice, adjust speed and pitch, then save to your project."
        icon={<Mic className="h-5 w-5" />}
      />

      {error && <ErrorBanner message={error} onRetry={() => setError(null)} />}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Controls */}
        <Card className="lg:col-span-1">
          <h3 className="mb-4 font-display text-sm font-semibold text-white">Voice Settings</h3>

          {voices.length === 0 ? (
            <p className="text-xs text-slate-500">Loading available voices...</p>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-xs text-slate-400">Voice ({voices.length} available)</label>
                <select
                  value={selectedVoice?.name || ""}
                  onChange={(e) => {
                    const v = voices.find((v) => v.name === e.target.value);
                    setSelectedVoice(v || null);
                  }}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white focus:border-primary-500/50 focus:outline-none"
                >
                  {voices.map((v) => (
                    <option key={v.name} value={v.name}>{v.name} ({v.lang})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 flex items-center justify-between text-xs text-slate-400">
                  <span>Speed</span><span className="text-slate-300">{rate}x</span>
                </label>
                <input type="range" min={0.5} max={2} step={0.1} value={rate}
                  onChange={(e) => setRate(Number(e.target.value))}
                  className="w-full accent-primary-500" />
              </div>

              <div>
                <label className="mb-1 flex items-center justify-between text-xs text-slate-400">
                  <span>Pitch</span><span className="text-slate-300">{pitch}</span>
                </label>
                <input type="range" min={0.5} max={2} step={0.1} value={pitch}
                  onChange={(e) => setPitch(Number(e.target.value))}
                  className="w-full accent-primary-500" />
              </div>

              <div>
                <label className="mb-1 flex items-center justify-between text-xs text-slate-400">
                  <span><Volume2 className="inline h-3 w-3" /> Volume</span><span className="text-slate-300">{Math.round(volume * 100)}%</span>
                </label>
                <input type="range" min={0} max={1} step={0.1} value={volume}
                  onChange={(e) => setVolume(Number(e.target.value))}
                  className="w-full accent-primary-500" />
              </div>

              <div className="flex gap-2 pt-2">
                {!speaking ? (
                  <button onClick={handleSpeak} className="btn-primary flex-1 py-2.5 text-sm">
                    <Play className="h-4 w-4" /> Speak
                  </button>
                ) : (
                  <button onClick={handleStop} className="btn-ghost flex-1 py-2.5 text-sm border-error-500/30 text-error-400">
                    <Square className="h-4 w-4" /> Stop
                  </button>
                )}
              </div>
            </div>
          )}
        </Card>

        {/* Text area */}
        <Card className="lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-display text-sm font-semibold text-white">Narration Text</h3>
            <div className="flex gap-2">
              <button onClick={handleLoadScript} className="btn-ghost py-1.5 text-xs">Load Script</button>
            </div>
          </div>

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste your script here, or click Load Script to pull from your project..."
            rows={12}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm leading-relaxed text-white placeholder:text-slate-500 focus:border-primary-500/50 focus:outline-none"
          />

          <div className="mt-3 flex items-center gap-2">
            <button onClick={handleSave} className="btn-ghost py-2 text-xs">
              <Save className="h-3.5 w-3.5" /> Save to Project
            </button>
            <button onClick={handleDownload} className="btn-ghost py-2 text-xs">
              <Download className="h-3.5 w-3.5" /> Download Text
            </button>
            {saved && <Badge color="success"><Save className="mr-1 h-3 w-3" /> Saved</Badge>}
            {speaking && <Badge color="primary"><Volume2 className="mr-1 h-3 w-3 animate-pulse" /> Speaking...</Badge>}
          </div>
        </Card>
      </div>

      {generating && (
        <Generating message="Generating narration with local TTS..." />
      )}

      <Card>
        <div className="flex items-start gap-3">
          <Mic className="mt-0.5 h-5 w-5 shrink-0 text-primary-300" />
          <div className="text-xs text-slate-400">
            <p className="font-medium text-slate-300">About Voice Studio</p>
            <p className="mt-1">Uses your browser's built-in text-to-speech engine. Available voices depend on your operating system. The narration will be merged with your video in the Video Studio automatically.</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
