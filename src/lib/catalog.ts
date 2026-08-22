import { queryOptions } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";

export type TitleKind = "movie" | "series";

export interface Title {
  id: string;
  slug: string;
  name: string;
  description: string;
  kind: string;
  release_year: number | null;
  maturity_rating: string;
  duration_minutes: number | null;
  genres: string[];
  cast_members: string[];
  poster_url: string;
  backdrop_url: string | null;
  stream_url: string;
  trailer_url: string | null;
  is_featured: boolean;
  is_kids: boolean;
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  sort_order: number;
}

export interface Episode {
  id: string;
  title_id: string;
  season: number;
  episode_number: number;
  name: string;
  description: string;
  duration_minutes: number | null;
  still_url: string | null;
  stream_url: string;
}

export interface Plan {
  id: string;
  slug: string;
  name: string;
  price_cents: number;
  currency: string;
  max_quality: string;
  max_screens: number;
  features: string[];
  sort_order: number;
}

const TITLE_COLUMNS = "*";

export const titlesQuery = (kidsOnly = false) =>
  queryOptions({
    queryKey: ["titles", kidsOnly],
    queryFn: async (): Promise<Title[]> => {
      let query = supabase.from("titles").select(TITLE_COLUMNS).order("name");
      if (kidsOnly) query = query.eq("is_kids", true);
      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as Title[];
    },
  });

export const categoriesQuery = () =>
  queryOptions({
    queryKey: ["categories"],
    queryFn: async (): Promise<Category[]> => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("sort_order");
      if (error) throw error;
      return (data ?? []) as Category[];
    },
  });

export const titleCategoriesQuery = () =>
  queryOptions({
    queryKey: ["title_categories"],
    queryFn: async (): Promise<{ title_id: string; category_id: string }[]> => {
      const { data, error } = await supabase.from("title_categories").select("*");
      if (error) throw error;
      return data ?? [];
    },
  });

export const titleBySlugQuery = (slug: string) =>
  queryOptions({
    queryKey: ["title", slug],
    queryFn: async (): Promise<Title | null> => {
      const { data, error } = await supabase
        .from("titles")
        .select(TITLE_COLUMNS)
        .eq("slug", slug)
        .maybeSingle();
      if (error) throw error;
      return (data ?? null) as Title | null;
    },
  });

export const episodesQuery = (titleId: string | undefined) =>
  queryOptions({
    queryKey: ["episodes", titleId],
    enabled: Boolean(titleId),
    queryFn: async (): Promise<Episode[]> => {
      if (!titleId) return [];
      const { data, error } = await supabase
        .from("episodes")
        .select("*")
        .eq("title_id", titleId)
        .order("season")
        .order("episode_number");
      if (error) throw error;
      return (data ?? []) as Episode[];
    },
  });

export const plansQuery = () =>
  queryOptions({
    queryKey: ["plans"],
    queryFn: async (): Promise<Plan[]> => {
      const { data, error } = await supabase
        .from("subscription_plans")
        .select("*")
        .order("sort_order");
      if (error) throw error;
      return (data ?? []) as Plan[];
    },
  });

export function searchTitles(titles: Title[], term: string): Title[] {
  const q = term.trim().toLowerCase();
  if (!q) return [];
  return titles.filter((t) => {
    const haystack = [t.name, ...t.genres, ...t.cast_members, t.description]
      .join(" ")
      .toLowerCase();
    return haystack.includes(q);
  });
}

export function formatPrice(cents: number, currency = "EUR") {
  return new Intl.NumberFormat("en-IE", { style: "currency", currency }).format(cents / 100);
}

export function formatRuntime(title: Title, episodeCount = 0) {
  if (title.kind === "series") {
    return `${episodeCount || 1} episode${episodeCount === 1 ? "" : "s"}`;
  }
  if (!title.duration_minutes) return "";
  const h = Math.floor(title.duration_minutes / 60);
  const m = title.duration_minutes % 60;
  return h ? `${h}h ${m}m` : `${m}m`;
}
