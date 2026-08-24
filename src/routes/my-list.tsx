import { createFileRoute, Link } from "@tanstack/react-router";

import { TitleCard } from "@/components/catalog/TitleCard";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { useCatalog, useViewerContext } from "@/hooks/useCatalog";

export const Route = createFileRoute("/my-list")({
  head: () => ({
    meta: [
      { title: "My List — Novaflix" },
      { name: "description", content: "Every film and series you saved on this Novaflix profile." },
      { property: "og:title", content: "My List — Novaflix" },
      { property: "og:description", content: "Your saved films and series on Novaflix." },
    ],
  }),
  component: MyListPage,
});

function MyListPage() {
  const { titles, savedIds, toggleSave } = useCatalog();
  const { isAuthenticated, activeProfile, loading } = useViewerContext();
  const saved = titles.filter((t) => savedIds.has(t.id));

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-[1600px] px-4 pt-28 pb-16 md:px-8">
        <h1 className="text-3xl md:text-4xl">My List</h1>

        {!loading && !isAuthenticated && (
          <div className="mt-6 rounded-lg border border-border bg-card p-6">
            <p className="text-sm text-muted-foreground">Sign in to save titles for later.</p>
            <Button asChild className="mt-4">
              <Link to="/auth">Sign in</Link>
            </Button>
          </div>
        )}

        {isAuthenticated && !activeProfile && (
          <div className="mt-6 rounded-lg border border-border bg-card p-6">
            <p className="text-sm text-muted-foreground">Pick a viewer profile to see its list.</p>
            <Button asChild className="mt-4">
              <Link to="/profiles">Choose profile</Link>
            </Button>
          </div>
        )}

        {activeProfile && saved.length === 0 && (
          <p className="mt-6 text-sm text-muted-foreground">
            Nothing saved yet — tap the plus icon on any title.
          </p>
        )}

        <div className="mt-6 flex flex-wrap gap-4">
          {saved.map((t) => (
            <TitleCard key={t.id} title={t} saved onToggleSave={toggleSave} />
          ))}
        </div>
      </main>
    </div>
  );
}
