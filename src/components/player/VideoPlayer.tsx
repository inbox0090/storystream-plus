import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  SkipForward,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

interface Props {
  src: string;
  poster?: string | undefined;
  heading: string;
  subheading?: string | undefined;
  startAt?: number | undefined;
  onBack?: (() => void) | undefined;
  onNextEpisode?: (() => void) | undefined;
  onProgress?: ((position: number, duration: number) => void) | undefined;
}

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds)) return "0:00";
  const s = Math.floor(seconds % 60);
  const m = Math.floor((seconds / 60) % 60);
  const h = Math.floor(seconds / 3600);
  const mm = h ? String(m).padStart(2, "0") : String(m);
  return `${h ? `${h}:` : ""}${mm}:${String(s).padStart(2, "0")}`;
}

export function VideoPlayer({
  src,
  poster,
  heading,
  subheading,
  startAt,
  onBack,
  onNextEpisode,
  onProgress,
}: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const shellRef = useRef<HTMLDivElement>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);

  // Attach the HLS stream (native on Safari, hls.js elsewhere).
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    let destroy: (() => void) | undefined;
    let cancelled = false;

    const isHls = src.includes(".m3u8");
    if (isHls && video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src;
    } else if (isHls) {
      void import("hls.js").then(({ default: Hls }) => {
        if (cancelled) return;
        if (Hls.isSupported()) {
          const hls = new Hls({ enableWorker: true });
          hls.loadSource(src);
          hls.attachMedia(video);
          destroy = () => hls.destroy();
        } else {
          video.src = src;
        }
      });
    } else {
      video.src = src;
    }

    return () => {
      cancelled = true;
      destroy?.();
    };
  }, [src]);

  const armHide = useCallback(() => {
    setShowControls(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setShowControls(false), 3200);
  }, []);

  useEffect(() => {
    armHide();
    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, [armHide]);

  useEffect(() => {
    const onChange = () => setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) void video.play();
    else video.pause();
  }, []);

  const seekBy = useCallback((delta: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.max(0, Math.min(video.duration || 0, video.currentTime + delta));
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === " " || e.key === "k") {
        e.preventDefault();
        togglePlay();
      }
      if (e.key === "ArrowRight") seekBy(10);
      if (e.key === "ArrowLeft") seekBy(-10);
      if (e.key === "m") setMuted((m) => !m);
      armHide();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [togglePlay, seekBy, armHide]);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.muted = muted;
      video.volume = volume;
    }
  }, [muted, volume]);

  const toggleFullscreen = async () => {
    if (document.fullscreenElement) await document.exitFullscreen();
    else await shellRef.current?.requestFullscreen();
  };

  const lastReport = useRef(0);

  return (
    <div
      ref={shellRef}
      onMouseMove={armHide}
      onTouchStart={armHide}
      className="relative aspect-video w-full overflow-hidden bg-black"
    >
      <video
        ref={videoRef}
        {...(poster ? { poster } : {})}
        playsInline
        className="size-full"
        onClick={togglePlay}
        onLoadedMetadata={(e) => {
          const video = e.currentTarget;
          setDuration(video.duration || 0);
          if (startAt && startAt > 5 && startAt < (video.duration || 0) - 10) {
            video.currentTime = startAt;
          }
          setReady(true);
        }}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onTimeUpdate={(e) => {
          const video = e.currentTarget;
          setCurrent(video.currentTime);
          if (onProgress && video.currentTime - lastReport.current > 5) {
            lastReport.current = video.currentTime;
            onProgress(video.currentTime, video.duration || 0);
          }
        }}
        onEnded={() => onNextEpisode?.()}
      />

      {!ready && (
        <div className="absolute inset-0 grid place-items-center bg-black">
          <Loader2 className="size-8 animate-spin text-primary" />
        </div>
      )}

      <div
        className={cn(
          "absolute inset-0 flex flex-col justify-between bg-gradient-to-t from-black/85 via-transparent to-black/60 transition-opacity duration-300",
          showControls ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      >
        <div className="flex items-start gap-3 p-4">
          {onBack && (
            <button
              type="button"
              aria-label="Back"
              onClick={onBack}
              className="grid size-10 place-items-center rounded-full bg-black/50 hover:bg-black/70"
            >
              <ArrowLeft className="size-5" />
            </button>
          )}
          <div>
            <p className="font-display text-xl md:text-2xl">{heading}</p>
            {subheading && <p className="text-sm text-muted-foreground">{subheading}</p>}
          </div>
        </div>

        <div className="space-y-2 p-4">
          <Slider
            aria-label="Seek"
            value={[current]}
            max={duration || 100}
            step={1}
            onValueChange={([v]) => {
              if (videoRef.current && typeof v === "number") videoRef.current.currentTime = v;
            }}
          />
          <div className="flex items-center gap-3 text-sm">
            <button type="button" aria-label={playing ? "Pause" : "Play"} onClick={togglePlay}>
              {playing ? <Pause className="size-6" /> : <Play className="size-6 fill-current" />}
            </button>
            <div className="flex items-center gap-2">
              <button type="button" aria-label={muted ? "Unmute" : "Mute"} onClick={() => setMuted((m) => !m)}>
                {muted || volume === 0 ? <VolumeX className="size-5" /> : <Volume2 className="size-5" />}
              </button>
              <div className="w-20">
                <Slider
                  aria-label="Volume"
                  value={[muted ? 0 : volume * 100]}
                  max={100}
                  step={1}
                  onValueChange={([v]) => {
                    if (typeof v !== "number") return;
                    setMuted(v === 0);
                    setVolume(v / 100);
                  }}
                />
              </div>
            </div>
            <span className="tabular-nums text-muted-foreground">
              {formatTime(current)} / {formatTime(duration)}
            </span>
            <div className="ml-auto flex items-center gap-3">
              {onNextEpisode && (
                <button
                  type="button"
                  onClick={onNextEpisode}
                  className="flex items-center gap-1 rounded border border-border px-2 py-1 text-xs hover:bg-accent"
                >
                  <SkipForward className="size-4" /> Next episode
                </button>
              )}
              <button type="button" aria-label="Fullscreen" onClick={() => void toggleFullscreen()}>
                {fullscreen ? <Minimize className="size-5" /> : <Maximize className="size-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
