import { createFileRoute, Link } from "@tanstack/react-router";

import { HeroBanner } from "@/components/catalog/HeroBanner";
import { TitleRow } from "@/components/catalog/TitleRow";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCatalog, useViewerContext } from "@/hooks/useCatalog";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Novaflix — Stream Originals, Films & Series" },
      {
        name: "description",
        content:
          "Watch Nova Originals, films, series and documentaries in HD. Multiple profiles, My List and resume where you left off.",
      },
      { property: "og:title", content: "Novaflix — Stream Originals, Films & Series" },
      {
        property: "og:description",
        content: "Nova Originals, films, series and documentaries streaming in HD.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const { rows, featured, savedIds, toggleSave, continueWatching, isLoading } = useCatalog();
  const { isAuthenticated } = useViewerContext();

  return (
    <div className="min-h-screen bg-background pb-20">
      <Navbar />
      {isLoading || !featured ? (
        <div className="space-y-4 px-4 pt-24 md:px-8">
          <Skeleton className="h-[50vh] w-full rounded-lg" />
          <Skeleton className="h-6 w-40" />
        </div>
      ) : (
        <>
          <HeroBanner title={featured} saved={savedIds.has(featured.id)} onToggleSave={toggleSave} />
          <div className="-mt-10 space-y-2">
            {continueWatching.length > 0 && (
              <TitleRow
                heading="Continue Watching"
                titles={continueWatching}
                savedIds={savedIds}
                onToggleSave={toggleSave}
              />
            )}
            {rows.map(({ category, titles }) => (
              <TitleRow
                key={category.id}
                heading={category.name}
                titles={titles}
                savedIds={savedIds}
                onToggleSave={toggleSave}
              />
            ))}
          </div>
        </>
      )}

      {!isAuthenticated && (
        <section className="mx-auto mt-12 max-w-3xl rounded-lg border border-border bg-card p-8 text-center">
          <h2 className="text-3xl">Create your account</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in to add multiple viewer profiles, keep a My List and resume playback on any device.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg">
              <Link to="/auth">Get started</Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link to="/plans">See plans</Link>
            </Button>
          </div>
        </section>
      )}
    </div>
  );
}
