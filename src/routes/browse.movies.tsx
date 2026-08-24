import { createFileRoute } from "@tanstack/react-router";

import { TitleCard } from "@/components/catalog/TitleCard";
import { Navbar } from "@/components/layout/Navbar";
import { useCatalog } from "@/hooks/useCatalog";

export const Route = createFileRoute("/browse/movies")({
  head: () => ({
    meta: [
      { title: "Films — Novaflix" },
      { name: "description", content: "Browse every Novaflix film: action, sci-fi, romance and documentaries." },
      { property: "og:title", content: "Films — Novaflix" },
      { property: "og:description", content: "Browse every film streaming on Novaflix." },
    ],
  }),
  component: MoviesPage,
});

function MoviesPage() {
  const { titles, savedIds, toggleSave } = useCatalog();
  const movies = titles.filter((t) => t.kind === "movie");

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-[1600px] px-4 pt-28 pb-16 md:px-8">
        <h1 className="text-3xl md:text-4xl">Films</h1>
        <div className="mt-6 flex flex-wrap gap-4">
          {movies.map((t) => (
            <TitleCard key={t.id} title={t} saved={savedIds.has(t.id)} onToggleSave={toggleSave} />
          ))}
        </div>
      </main>
    </div>
  );
}
