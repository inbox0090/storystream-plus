import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Play, Plus, Check, ArrowLeft } from "lucide-react";

import { TitleRow } from "@/components/catalog/TitleRow";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCatalog } from "@/hooks/useCatalog";
import { episodesQuery, formatRuntime, titleBySlugQuery } from "@/lib/catalog";

export const Route = createFileRoute("/title/$slug")({
  head: ({ params }) => {
    const readable = params.slug
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
    return {
      meta: [
        { title: `${readable} — Watch on Novaflix` },
        {
          name: "description",
          content: `Watch ${readable} on Novaflix: episodes, cast, genres and streaming in HD.`,
        },
        { property: "og:title", content: `${readable} — Watch on Novaflix` },
        { property: "og:description", content: `Stream ${readable} on Novaflix in HD.` },
      ],
    };
  },
  component: TitleDetail,
  errorComponent: () => (
    <div className="grid min-h-screen place-items-center bg-background">
      <p className="text-sm text-muted-foreground">This title could not be loaded.</p>
    </div>
  ),
});

function TitleDetail() {
  const { slug } = Route.useParams();
  const { data: title, isLoading } = useQuery(titleBySlugQuery(slug));
  const { data: episodes = [] } = useQuery(episodesQuery(title?.id));
  const { titles, savedIds, toggleSave } = useCatalog();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="px-4 pt-28 md:px-8">
          <Skeleton className="h-[45vh] w-full rounded-lg" />
        </div>
      </div>
    );
  }

  if (!title) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="grid min-h-screen place-items-center px-4 text-center">
          <div>
            <h1 className="text-3xl">Title not found</h1>
            <Button asChild className="mt-6">
              <Link to="/">Back to home</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const saved = savedIds.has(title.id);
  const related = titles.filter(
    (t) => t.id !== title.id && t.genres.some((g) => title.genres.includes(g)),
  );

  return (
    <div className="min-h-screen bg-background pb-16">
      <Navbar />
      <section className="relative min-h-[60vh] w-full overflow-hidden">
        <img
          src={title.backdrop_url ?? title.poster_url}
          alt={`${title.name} artwork`}
          className="absolute inset-0 size-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/30" />
        <div className="relative flex min-h-[60vh] flex-col justify-end gap-4 px-4 pb-10 pt-28 md:px-8">
          <Link to="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="size-4" /> Home
          </Link>
          <h1 className="max-w-3xl text-4xl md:text-6xl">{title.name}</h1>
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span className="rounded border border-border px-2 py-0.5">{title.maturity_rating}</span>
            {title.release_year && <span>{title.release_year}</span>}
            <span>{formatRuntime(title, episodes.length)}</span>
            <span>{title.genres.join(" • ")}</span>
          </div>
          <p className="max-w-2xl text-sm md:text-base">{title.description}</p>
          {title.cast_members.length > 0 && (
            <p className="text-sm text-muted-foreground">Cast: {title.cast_members.join(", ")}</p>
          )}
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg" className="gap-2">
              <Link to="/watch/$slug" params={{ slug: title.slug }}>
                <Play className="size-5 fill-current" /> Play
              </Link>
            </Button>
            <Button size="lg" variant="secondary" className="gap-2" onClick={() => toggleSave(title)}>
              {saved ? <Check className="size-5" /> : <Plus className="size-5" />} My List
            </Button>
          </div>
        </div>
      </section>

      {episodes.length > 0 && (
        <section className="px-4 py-8 md:px-8">
          <h2 className="text-2xl">Episodes</h2>
          <ul className="mt-4 divide-y divide-border rounded-lg border border-border">
            {episodes.map((ep) => (
              <li key={ep.id} className="flex flex-col gap-3 p-4 md:flex-row md:items-center">
                <span className="w-8 text-lg text-muted-foreground">{ep.episode_number}</span>
                {ep.still_url && (
                  <img
                    src={ep.still_url}
                    alt={`${ep.name} still`}
                    loading="lazy"
                    className="h-20 w-36 rounded object-cover"
                  />
                )}
                <div className="flex-1">
                  <p className="font-medium">{ep.name}</p>
                  <p className="text-sm text-muted-foreground">{ep.description}</p>
                </div>
                <span className="text-sm text-muted-foreground">{ep.duration_minutes}m</span>
                <Button asChild size="sm" variant="secondary">
                  <Link
                    to="/watch/$slug"
                    params={{ slug: title.slug }}
                    search={{ ep: ep.episode_number }}
                  >
                    Play
                  </Link>
                </Button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <TitleRow heading="More like this" titles={related} savedIds={savedIds} onToggleSave={toggleSave} />
    </div>
  );
}
