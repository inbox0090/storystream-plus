import { Link } from "@tanstack/react-router";
import { Play, Plus, Check } from "lucide-react";

import type { Title } from "@/lib/catalog";
import { cn } from "@/lib/utils";

interface Props {
  title: Title;
  saved?: boolean;
  onToggleSave?: (title: Title) => void;
  progressPercent?: number;
  className?: string;
}

export function TitleCard({ title, saved, onToggleSave, progressPercent, className }: Props) {
  return (
    <div className={cn("group relative w-[150px] shrink-0 md:w-[200px]", className)}>
      <Link
        to="/title/$slug"
        params={{ slug: title.slug }}
        className="block overflow-hidden rounded-md ring-offset-2 ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
      >
        <div className="relative aspect-[2/3] overflow-hidden rounded-md bg-muted">
          <img
            src={title.poster_url}
            alt={`${title.name} poster`}
            loading="lazy"
            className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent opacity-0 transition-opacity group-hover:opacity-100" />
          {typeof progressPercent === "number" && progressPercent > 0 && (
            <div className="absolute inset-x-2 bottom-2 h-1 rounded bg-white/25">
              <div
                className="h-full rounded bg-primary"
                style={{ width: `${Math.min(100, progressPercent)}%` }}
              />
            </div>
          )}
        </div>
      </Link>
      <div className="absolute inset-x-2 top-2 flex justify-between opacity-0 transition-opacity group-hover:opacity-100">
        <Link
          to="/watch/$slug"
          params={{ slug: title.slug }}
          aria-label={`Play ${title.name}`}
          className="grid size-8 place-items-center rounded-full bg-foreground text-background"
        >
          <Play className="size-4 fill-current" />
        </Link>
        {onToggleSave && (
          <button
            type="button"
            aria-label={saved ? `Remove ${title.name} from My List` : `Add ${title.name} to My List`}
            onClick={() => onToggleSave(title)}
            className="grid size-8 place-items-center rounded-full border border-border bg-background/80"
          >
            {saved ? <Check className="size-4" /> : <Plus className="size-4" />}
          </button>
        )}
      </div>
      <p className="mt-2 truncate text-sm text-muted-foreground">{title.name}</p>
    </div>
  );
}
