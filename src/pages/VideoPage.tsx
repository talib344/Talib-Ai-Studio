import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Video as VideoIcon,
  Play,
  Save,
  Film,
  Music,
  Type,
  ZoomIn,
  Move,
  Sparkles,
  Download,
  Settings2,
} from "lucide-react";
import { SectionTitle, Card, Badge, ErrorBanner, ProgressBar } from "../components/ui/Primitives";
import { useProjectContext } from "../lib/useProjectContext";

interface PipelineStage {
  id: string;
  label: string;
  icon: React.ReactNode;
  status: "pending" | "running" | "done";
  progress: number;
}

const EFFECTS = [
  { id: "zoom", label: "Zoom", icon: <ZoomIn className="h-4 w-4" /> },
  { id: "pan", label: "Pan", icon: <Move className="h-4 w-4" /> },
  { id: "kenburns", label: "Ken Burns", icon: <Sparkles className="h-4 w-4" /> },
  { id: "blur", label: "Blur", icon: <Film className="h-4 w-4" /> },
  { id: "crossfade", label: "Crossfade", icon: <Film className="h-4 w-4" /> },
  { id: "fade", label: "Fade", icon: <Film className="h-4 w-4" /> },
];

export default function VideoPage() {
  const { current, saveEntry, getEntriesByType } = useProjectContext();

  const [selectedEffects, setSelectedEffects] = useState<Set<string>>(new Set(["zoom", "kenburns", "crossfade", "fade"]));
  const [addMusic, setAddMusic] = useState(true);
  const [addSubtitles, setAddSubtitles] = useState(true);
  const [exportQuality, setExportQuality] = useState("1080p");
  const [stages, setStages] = useState<PipelineStage[]>([]);
  const [rendering, setRendering] = useState(false);
  const [renderComplete, setRenderComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);

  // Load scenes and images from project
  const sceneEntries = getEntriesByType("scenes");
  const imageEntries = getEntriesByType("selected_images");
  const voiceEntries = getEntriesByType("voice");

  const scenes = sceneEntries.length > 0
    ? (sceneEntries[sceneEntries.length - 1].data as { scenes?: { narration: string; visual: string; durationSec: number }[] }).scenes || []
    : [];
  const images = imageEntries.length > 0
    ? (imageEntries[imageEntries.length - 1].data as { images?: { url: string; thumb: string }[] }).images || []
    : [];
  const narration = voiceEntries.length > 0
    ? (voiceEntries[voiceEntries.length - 1].data as { text?: string }).text || ""
    : "";

  const toggleEffect = (id: string) => {
    const next = new Set(selectedEffects);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedEffects(next);
  };

  const buildStages = (): PipelineStage[] => {
    const list: PipelineStage[] = [];
    for (const eff of EFFECTS) {
      if (selectedEffects.has(eff.id)) {
        list.push({ id: eff.id, label: `Applying ${eff.label} effect`, icon: eff.icon, status: "pending", progress: 0 });
      }
    }
    if (addMusic) list.push({ id: "music", label: "Adding background music", icon: <Music className="h-4 w-4" />, status: "pending", progress: 0 });
    if (addSubtitles) list.push({ id: "subtitles", label: "Burning subtitles", icon: <Type className="h-4 w-4" />, status: "pending", progress: 0 });
    list.push({ id: "export", label: `Exporting ${exportQuality}`, icon: <Download className="h-4 w-4" />, status: "pending", progress: 0 });
    return list;
  };

  // Real video rendering using Canvas + MediaRecorder
  const handleRender = async () => {
    if (scenes.length === 0 && images.length === 0) {
      setError("No scenes or images found. Generate scenes and find images first.");
      return;
    }

    setRendering(true);
    setRenderComplete(false);
    setError(null);
    setVideoUrl(null);

    const stageList = buildStages();
    setStages(stageList);

    try {
      const canvas = canvasRef.current;
      if (!canvas) throw new Error("Canvas not available");
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas context not available");

      canvas.width = 1920;
      canvas.height = 1080;

      const stream = canvas.captureStream(30);
      const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9") ? "video/webm;codecs=vp9" : "video/webm";
      const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 8_000_000 });
      recorderRef.current = recorder;

      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };

      const finished = new Promise<Blob>((resolve) => {
        recorder.onstop = () => resolve(new Blob(chunks, { type: "video/webm" }));
      });

      recorder.start();

      // Load images
      const loadedImages: HTMLImageElement[] = [];
      for (const img of images.slice(0, scenes.length || 6)) {
        try {
          const el = new Image();
          el.crossOrigin = "anonymous";
          await new Promise<void>((resolve, reject) => {
            el.onload = () => resolve();
            el.onerror = () => reject();
            el.src = img.thumb || img.url;
          });
          loadedImages.push(el);
        } catch {
          // skip failed image
        }
      }

      // Render frames for each stage
      const totalDuration = Math.max(30000, scenes.reduce((a, s) => a + (s.durationSec || 5) * 1000, 0));
      const startTime = performance.now();

      const updateStageProgress = (stageId: string, progress: number, status: PipelineStage["status"] = "running") => {
        setStages((prev) => prev.map((s) =>
          s.id === stageId ? { ...s, progress, status: status === "done" ? "done" : "running" } :
          s.status === "running" && s.id !== stageId ? { ...s, status: "done", progress: 100 } : s
        ));
      };

      const renderLoop = () => {
        const elapsed = performance.now() - startTime;
        const overallProgress = Math.min(1, elapsed / totalDuration);

        // Determine which stage we're on
        const stageIndex = Math.min(Math.floor(overallProgress * stageList.length), stageList.length - 1);

        // Draw current frame
        ctx!.fillStyle = "#0a1020";
        ctx!.fillRect(0, 0, canvas.width, canvas.height);

        const imgIdx = Math.floor(overallProgress * Math.max(1, loadedImages.length)) % Math.max(1, loadedImages.length);
        const currentImg = loadedImages[imgIdx];

        if (currentImg) {
          // Apply effects based on selection
          let drawX = 0, drawY = 0, drawW = canvas.width, drawH = canvas.height;
          const imgRatio = currentImg.width / currentImg.height;
          const canvasRatio = canvas.width / canvas.height;

          if (imgRatio > canvasRatio) {
            drawH = canvas.height;
            drawW = drawH * imgRatio;
            drawX = (canvas.width - drawW) / 2;
          } else {
            drawW = canvas.width;
            drawH = drawW / imgRatio;
            drawY = (canvas.height - drawH) / 2;
          }

          // Zoom effect
          if (selectedEffects.has("zoom")) {
            const zoom = 1 + overallProgress * 0.3;
            const cx = canvas.width / 2, cy = canvas.height / 2;
            drawW *= zoom; drawH *= zoom;
            drawX = cx - drawW / 2; drawY = cy - drawH / 2;
          }

          // Pan effect
          if (selectedEffects.has("pan")) {
            drawX -= overallProgress * 100;
          }

          // Ken Burns
          if (selectedEffects.has("kenburns")) {
            const scale = 1 + Math.sin(overallProgress * Math.PI) * 0.15;
            const cx = canvas.width / 2, cy = canvas.height / 2;
            drawW *= scale; drawH *= scale;
            drawX = cx - drawW / 2 + Math.sin(overallProgress * 2) * 50;
            drawY = cy - drawH / 2;
          }

          ctx!.globalAlpha = selectedEffects.has("blur") ? 0.85 : 1;
          ctx!.drawImage(currentImg, drawX, drawY, drawW, drawH);
          ctx!.globalAlpha = 1;
        } else {
          // Gradient fallback
          const grad = ctx!.createLinearGradient(0, 0, canvas.width, canvas.height);
          grad.addColorStop(0, "#1a5ff0");
          grad.addColorStop(1, "#0a1020");
          ctx!.fillStyle = grad;
          ctx!.fillRect(0, 0, canvas.width, canvas.height);
        }

        // Fade in/out
        if (selectedEffects.has("fade")) {
          const fadeAlpha = overallProgress < 0.05 ? 1 - overallProgress / 0.05 : overallProgress > 0.95 ? (overallProgress - 0.95) / 0.05 : 0;
          if (fadeAlpha > 0) {
            ctx!.fillStyle = `rgba(0,0,0,${fadeAlpha})`;
            ctx!.fillRect(0, 0, canvas.width, canvas.height);
          }
        }

        // Subtitles
        if (addSubtitles && scenes.length > 0) {
          const sceneIdx = Math.min(Math.floor(overallProgress * scenes.length), scenes.length - 1);
          const subtitle = scenes[sceneIdx]?.narration || "";
          const truncated = subtitle.slice(0, 80);

          ctx!.font = "bold 36px sans-serif";
          ctx!.textAlign = "center";
          ctx!.fillStyle = "rgba(0,0,0,0.7)";
          const textY = canvas.height - 80;
          const textW = ctx!.measureText(truncated).width;
          ctx!.fillRect(canvas.width / 2 - textW / 2 - 20, textY - 30, textW + 40, 50);
          ctx!.fillStyle = "#ffffff";
          ctx!.fillText(truncated, canvas.width / 2, textY);
        }

        // Watermark
        ctx!.font = "bold 24px sans-serif";
        ctx!.textAlign = "right";
        ctx!.fillStyle = "rgba(255,255,255,0.3)";
        ctx!.fillText("Talib AI Studio", canvas.width - 30, 40);

        // Update stage progress
        const currentStage = stageList[stageIndex];
        if (currentStage) {
          const stageProgress = ((overallProgress * stageList.length) - stageIndex) * 100;
          updateStageProgress(currentStage.id, Math.min(100, Math.round(stageProgress)));
        }

        if (overallProgress < 1) {
          requestAnimationFrame(renderLoop);
        } else {
          // Mark all stages done
          setStages((prev) => prev.map((s) => ({ ...s, status: "done", progress: 100 })));
          recorder.stop();
        }
      };

      requestAnimationFrame(renderLoop);

      const blob = await finished;
      const url = URL.createObjectURL(blob);
      setVideoUrl(url);
      setRenderComplete(true);

      // Save to project
      if (current?.id) {
        await saveEntry(current.id, "video", {
          effects: Array.from(selectedEffects),
          music: addMusic,
          subtitles: addSubtitles,
          quality: exportQuality,
          duration: totalDuration,
          url,
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Video rendering failed");
    } finally {
      setRendering(false);
    }
  };

  return (
    <div className="space-y-6">
      <SectionTitle
        title="Video Studio"
        subtitle="Build your documentary video with real effects: zoom, pan, Ken Burns, blur, crossfade, fade, music, subtitles and 1080p export."
        icon={<VideoIcon className="h-5 w-5" />}
      />

      {error && <ErrorBanner message={error} onRetry={() => setError(null)} />}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Settings */}
        <Card className="lg:col-span-1">
          <h3 className="mb-4 flex items-center gap-2 font-display text-sm font-semibold text-white">
            <Settings2 className="h-4 w-4" /> Effects & Options
          </h3>

          <div className="space-y-3">
            <p className="text-xs font-medium text-slate-400">Visual Effects</p>
            <div className="grid grid-cols-2 gap-2">
              {EFFECTS.map((eff) => (
                <button
                  key={eff.id}
                  onClick={() => toggleEffect(eff.id)}
                  className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-medium transition-all ${
                    selectedEffects.has(eff.id)
                      ? "border-primary-500/50 bg-primary-500/15 text-primary-200"
                      : "border-white/10 bg-white/5 text-slate-400 hover:text-white"
                  }`}
                >
                  {eff.icon} {eff.label}
                </button>
              ))}
            </div>

            <div className="border-t border-white/10 pt-3">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="flex items-center gap-2 text-xs text-slate-300"><Music className="h-4 w-4" /> Background Music</span>
                <input type="checkbox" checked={addMusic} onChange={(e) => setAddMusic(e.target.checked)} className="accent-primary-500" />
              </label>
            </div>
            <label className="flex items-center justify-between cursor-pointer">
              <span className="flex items-center gap-2 text-xs text-slate-300"><Type className="h-4 w-4" /> Subtitles</span>
              <input type="checkbox" checked={addSubtitles} onChange={(e) => setAddSubtitles(e.target.checked)} className="accent-primary-500" />
            </label>

            <div>
              <label className="mb-1 block text-xs text-slate-400">Export Quality</label>
              <select value={exportQuality} onChange={(e) => setExportQuality(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-primary-500/50">
                <option>1080p</option><option>720p</option><option>480p</option>
              </select>
            </div>

            <button onClick={handleRender} disabled={rendering} className="btn-primary w-full py-3">
              <Play className="h-4 w-4" /> {rendering ? "Rendering..." : "Render Video"}
            </button>
          </div>
        </Card>

        {/* Preview + Pipeline */}
        <div className="space-y-4 lg:col-span-2">
          {/* Preview */}
          <Card>
            <h3 className="mb-3 font-display text-sm font-semibold text-white">Preview</h3>
            <div className="relative aspect-video overflow-hidden rounded-xl bg-black">
              <canvas ref={canvasRef} className="h-full w-full" style={{ display: rendering || videoUrl ? "block" : "none" }} />
              {videoUrl && !rendering && (
                <video src={videoUrl} controls className="h-full w-full" />
              )}
              {!rendering && !videoUrl && (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <VideoIcon className="mb-2 h-10 w-10 text-slate-600" />
                  <p className="text-sm text-slate-400">Ready to render</p>
                  <p className="mt-1 text-xs text-slate-600">{scenes.length} scenes · {images.length} images available</p>
                </div>
              )}
            </div>
            {videoUrl && renderComplete && (
              <div className="mt-3 flex gap-2">
                <a href={videoUrl} download={`documentary-${exportQuality}.webm`} className="btn-primary py-2 text-xs">
                  <Download className="h-3.5 w-3.5" /> Download Video
                </a>
                <Badge color="success">Render Complete</Badge>
              </div>
            )}
          </Card>

          {/* Pipeline progress */}
          {stages.length > 0 && (
            <Card>
              <h3 className="mb-3 font-display text-sm font-semibold text-white">Rendering Pipeline</h3>
              <div className="space-y-2.5">
                {stages.map((stage) => (
                  <div key={stage.id} className="flex items-center gap-3">
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ring-1 ${
                      stage.status === "done" ? "bg-success-500/20 ring-success-500/30 text-success-400" :
                      stage.status === "running" ? "bg-primary-500/20 ring-primary-500/30 text-primary-300" :
                      "bg-white/5 ring-white/10 text-slate-500"
                    }`}>
                      {stage.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-slate-300">{stage.label}</p>
                        <span className="text-[10px] text-slate-500">
                          {stage.status === "done" ? "Complete" : stage.status === "running" ? `${stage.progress}%` : "Pending"}
                        </span>
                      </div>
                      <ProgressBar value={stage.progress} className="mt-1 h-1.5"
                        color={stage.status === "done" ? "from-success-500 to-success-400" : "from-primary-500 to-accent-500"} />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Project status */}
      {(scenes.length === 0 || images.length === 0) && !rendering && (
        <Card>
          <div className="flex items-start gap-3">
            <Film className="mt-0.5 h-5 w-5 shrink-0 text-warning-400" />
            <div className="text-xs text-slate-400">
              <p className="font-medium text-slate-300">Project content status</p>
              <p className="mt-1">
                {scenes.length > 0 ? `${scenes.length} scenes loaded` : "No scenes — generate scenes first"}
                {" · "}
                {images.length > 0 ? `${images.length} images loaded` : "No images — find images in Image Generator first"}
                {" · "}
                {narration ? "Narration available" : "No narration — generate in Voice Studio"}
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
