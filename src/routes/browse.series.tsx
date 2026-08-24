import { createFileRoute } from "@tanstack/react-router";

import { TitleCard } from "@/components/catalog/TitleCard";
import { Navbar } from "@/components/layout/Navbar";
import { useCatalog } from "@/hooks/useCatalog";

export const Route = createFileRoute("/browse/series")({
  head: () => ({
    meta: [
      { title: "Series — Novaflix" },
      { name: "description", content: "Browse every Novaflix series, from originals to drama and sci-fi." },
      { property: "og:title", content: "Series — Novaflix" },
      { property: "og:description", content: "Browse every series streaming on Novaflix." },
    ],
  }),
  component: SeriesPage,
});

function SeriesPage() {
  const { titles, savedIds, toggleSave } = useCatalog();
  const series = titles.filter((t) => t.kind === "series");

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-[1600px] px-4 pt-28 pb-16 md:px-8">
        <h1 className="text-3xl md:text-4xl">Series</h1>
        <div className="mt-6 flex flex-wrap gap-4">
          {series.map((t) => (
            <TitleCard key={t.id} title={t} saved={savedIds.has(t.id)} onToggleSave={toggleSave} />
          ))}
        </div>
      </main>
    </div>
  );
}
