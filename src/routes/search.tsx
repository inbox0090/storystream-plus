import { createFileRoute } from "@tanstack/react-router";
import { Search as SearchIcon } from "lucide-react";
import { useMemo, useState } from "react";

import { TitleCard } from "@/components/catalog/TitleCard";
import { Navbar } from "@/components/layout/Navbar";
import { Input } from "@/components/ui/input";
import { useCatalog } from "@/hooks/useCatalog";
import { searchTitles } from "@/lib/catalog";

export const Route = createFileRoute("/search")({
  head: () => ({
    meta: [
      { title: "Search films, series and cast — Novaflix" },
      {
        name: "description",
        content: "Search the Novaflix catalog instantly by title, genre or cast member.",
      },
      { property: "og:title", content: "Search — Novaflix" },
      { property: "og:description", content: "Find films and series by title, genre or cast." },
    ],
  }),
  component: SearchPage,
});

function SearchPage() {
  const { titles, savedIds, toggleSave } = useCatalog();
  const [term, setTerm] = useState("");
  const results = useMemo(() => searchTitles(titles, term), [titles, term]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-[1600px] px-4 pt-28 pb-16 md:px-8">
        <h1 className="text-3xl md:text-4xl">Search</h1>
        <div className="relative mt-4 max-w-xl">
          <SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            autoFocus
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Titles, genres, people"
            className="pl-9"
            aria-label="Search the catalog"
          />
        </div>

        {term && (
          <p className="mt-4 text-sm text-muted-foreground">
            {results.length} result{results.length === 1 ? "" : "s"} for “{term}”
          </p>
        )}

        <div className="mt-6 flex flex-wrap gap-4">
          {(term ? results : titles).map((t) => (
            <TitleCard
              key={t.id}
              title={t}
              saved={savedIds.has(t.id)}
              onToggleSave={toggleSave}
            />
          ))}
        </div>
      </main>
    </div>
  );
}
