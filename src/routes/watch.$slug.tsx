import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useRef } from "react";
import { z } from "zod";

import { VideoPlayer } from "@/components/player/VideoPlayer";
import { useViewerContext } from "@/hooks/useCatalog";
import { episodesQuery, titleBySlugQuery } from "@/lib/catalog";
import { progressQuery, saveProgress } from "@/lib/user-data";

const searchSchema = z.object({ ep: z.coerce.number().int().positive().optional() });

export const Route = createFileRoute("/watch/$slug")({
  validateSearch: searchSchema,
  head: ({ params }) => {
    const readable = params.slug
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
    return {
      meta: [
        { title: `Playing ${readable} — Novaflix` },
        { name: "description", content: `Stream ${readable} now on Novaflix.` },
        { property: "og:title", content: `Playing ${readable} — Novaflix` },
        { property: "og:description", content: `Stream ${readable} now on Novaflix.` },
        { name: "robots", content: "noindex" },
      ],
    };
  },
  component: WatchPage,
});

function WatchPage() {
  const { slug } = Route.useParams();
  const { ep } = Route.useSearch();
  const navigate = useNavigate();
  const { user, activeProfileId } = useViewerContext();

  const { data: title } = useQuery(titleBySlugQuery(slug));
  const { data: episodes = [] } = useQuery(episodesQuery(title?.id));
  const { data: progressRows = [] } = useQuery(progressQuery(activeProfileId));

  const lastSaved = useRef(0);
  const currentEpisode =
    episodes.find((e) => e.episode_number === ep) ?? (episodes[0] ?? null);
  const nextEpisode = currentEpisode
    ? episodes.find((e) => e.episode_number === currentEpisode.episode_number + 1)
    : undefined;

  const resumeRow = progressRows.find((p) => p.title_id === title?.id);

  const handleProgress = useCallback(
    (position: number, duration: number) => {
      if (!user || !activeProfileId || !title) return;
      const now = Date.now();
      if (now - lastSaved.current < 5000) return;
      lastSaved.current = now;
      void saveProgress({
        userId: user.id,
        profileId: activeProfileId,
        titleId: title.id,
        episodeId: currentEpisode?.id ?? null,
        positionSeconds: position,
        durationSeconds: duration,
      }).catch(() => undefined);
    },
    [user, activeProfileId, title, currentEpisode],
  );

  if (!title) {
    return (
      <div className="grid min-h-screen place-items-center bg-black">
        <p className="text-sm text-muted-foreground">Loading…</p>
      </div>
    );
  }

  const src = currentEpisode?.stream_url ?? title.stream_url;

  return (
    <div className="min-h-screen bg-black">
      <VideoPlayer
        src={src}
        poster={title.backdrop_url ?? title.poster_url}
        heading={title.name}
        subheading={
          currentEpisode
            ? `S${currentEpisode.season}:E${currentEpisode.episode_number} · ${currentEpisode.name}`
            : undefined
        }
        startAt={resumeRow?.position_seconds ?? undefined}
        onBack={() => navigate({ to: "/title/$slug", params: { slug } })}
        onProgress={handleProgress}
        {...(nextEpisode
          ? {
              onNextEpisode: () =>
                navigate({
                  to: "/watch/$slug",
                  params: { slug },
                  search: { ep: nextEpisode.episode_number },
                }),
            }
          : {})}
      />
    </div>
  );
}
