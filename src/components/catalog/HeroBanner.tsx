import { Link } from "@tanstack/react-router";
import { Play, Plus, Check, Info, Volume2, VolumeX } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import type { Title } from "@/lib/catalog";

interface Props {
  title: Title;
  saved: boolean;
  onToggleSave: (title: Title) => void;
}

export function HeroBanner({ title, saved, onToggleSave }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [trailerOn, setTrailerOn] = useState(false);
  const [muted, setMuted] = useState(true);

  // Auto-start the muted trailer shortly after the poster art has settled.
  useEffect(() => {
    if (!title.trailer_url) return;
    const timer = setTimeout(() => setTrailerOn(true), 2000);
    return () => clearTimeout(timer);
  }, [title.trailer_url]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !trailerOn || !title.trailer_url) return;
    let destroy: (() => void) | undefined;
    let cancelled = false;
    video.muted = true;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = title.trailer_url;
      void video.play().catch(() => undefined);
    } else {
      void import("hls.js").then(({ default: Hls }) => {
        if (cancelled) return;
        if (Hls.isSupported()) {
          const hls = new Hls();
          hls.loadSource(title.trailer_url!);
          hls.attachMedia(video);
          hls.on(Hls.Events.MANIFEST_PARSED, () => void video.play().catch(() => undefined));
          destroy = () => hls.destroy();
        }
      });
    }
    return () => {
      cancelled = true;
      destroy?.();
    };
  }, [trailerOn, title.trailer_url]);

  useEffect(() => {
    if (videoRef.current) videoRef.current.muted = muted;
  }, [muted]);

  return (
    <section className="relative min-h-[70vh] w-full overflow-hidden md:min-h-[85vh]">
      <img
        src={title.backdrop_url ?? title.poster_url}
        alt={`${title.name} backdrop`}
        className="absolute inset-0 size-full object-cover"
      />
      {trailerOn && title.trailer_url && (
        <video
          ref={videoRef}
          playsInline
          loop
          className="absolute inset-0 size-full object-cover"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/70 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background to-transparent" />

      <div className="relative flex min-h-[70vh] max-w-2xl flex-col justify-end gap-4 px-4 pb-16 md:min-h-[85vh] md:px-8 md:pb-24">
        <p className="text-xs uppercase tracking-[0.3em] text-primary">
          {title.kind === "series" ? "Nova Original Series" : "Nova Original Film"}
        </p>
        <h1 className="text-5xl leading-none md:text-7xl">{title.name}</h1>
        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <span className="rounded border border-border px-2 py-0.5">{title.maturity_rating}</span>
          {title.release_year && <span>{title.release_year}</span>}
          <span>{title.genres.join(" • ")}</span>
        </div>
        <p className="max-w-xl text-sm text-foreground/85 md:text-base">{title.description}</p>
        <div className="flex flex-wrap items-center gap-3">
          <Button asChild size="lg" className="gap-2">
            <Link to="/watch/$slug" params={{ slug: title.slug }}>
              <Play className="size-5 fill-current" /> Play
            </Link>
          </Button>
          <Button size="lg" variant="secondary" className="gap-2" onClick={() => onToggleSave(title)}>
            {saved ? <Check className="size-5" /> : <Plus className="size-5" />} My List
          </Button>
          <Button asChild size="lg" variant="ghost" className="gap-2">
            <Link to="/title/$slug" params={{ slug: title.slug }}>
              <Info className="size-5" /> More info
            </Link>
          </Button>
          {trailerOn && (
            <Button
              size="icon"
              variant="ghost"
              aria-label={muted ? "Unmute trailer" : "Mute trailer"}
              onClick={() => setMuted((m) => !m)}
            >
              {muted ? <VolumeX className="size-5" /> : <Volume2 className="size-5" />}
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}
