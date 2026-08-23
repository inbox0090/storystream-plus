import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";

import { TitleCard } from "@/components/catalog/TitleCard";
import type { Title } from "@/lib/catalog";

interface Props {
  heading: string;
  titles: Title[];
  savedIds?: Set<string>;
  onToggleSave?: (title: Title) => void;
  progressById?: Record<string, number>;
}

export function TitleRow({ heading, titles, savedIds, onToggleSave, progressById }: Props) {
  const scroller = useRef<HTMLDivElement>(null);

  const scrollBy = (dir: 1 | -1) => {
    scroller.current?.scrollBy({ left: dir * (scroller.current.clientWidth * 0.8), behavior: "smooth" });
  };

  if (!titles.length) return null;

  return (
    <section className="group/row relative py-4">
      <h2 className="mb-3 px-4 text-xl tracking-wide md:px-8 md:text-2xl">{heading}</h2>
      <button
        type="button"
        aria-label={`Scroll ${heading} left`}
        onClick={() => scrollBy(-1)}
        className="absolute left-0 top-1/2 z-10 hidden h-28 w-10 -translate-y-1/2 place-items-center bg-black/50 opacity-0 transition-opacity group-hover/row:opacity-100 md:grid"
      >
        <ChevronLeft className="size-6" />
      </button>
      <div
        ref={scroller}
        className="no-scrollbar flex snap-x gap-3 overflow-x-auto px-4 pb-2 md:px-8"
      >
        {titles.map((t) => (
          <TitleCard
            key={t.id}
            title={t}
            saved={savedIds?.has(t.id)}
            onToggleSave={onToggleSave}
            progressPercent={progressById?.[t.id]}
            className="snap-start"
          />
        ))}
      </div>
      <button
        type="button"
        aria-label={`Scroll ${heading} right`}
        onClick={() => scrollBy(1)}
        className="absolute right-0 top-1/2 z-10 hidden h-28 w-10 -translate-y-1/2 place-items-center bg-black/50 opacity-0 transition-opacity group-hover/row:opacity-100 md:grid"
      >
        <ChevronRight className="size-6" />
      </button>
    </section>
  );
}
