import { queryOptions } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";

export interface ViewerProfile {
  id: string;
  user_id: string;
  name: string;
  avatar_color: string;
  is_kids: boolean;
  created_at: string;
}

export interface WatchlistRow {
  id: string;
  profile_id: string;
  title_id: string;
  created_at: string;
}

export interface ProgressRow {
  id: string;
  profile_id: string;
  title_id: string;
  episode_id: string | null;
  position_seconds: number;
  duration_seconds: number | null;
  updated_at: string;
}

export interface SubscriptionRow {
  id: string;
  user_id: string;
  plan_id: string;
  status: string;
  current_period_end: string;
}

export const AVATAR_COLORS = [
  "#e50914",
  "#f5a524",
  "#22c55e",
  "#3b82f6",
  "#a855f7",
  "#14b8a6",
];

export const profilesQuery = (userId: string | undefined) =>
  queryOptions({
    queryKey: ["viewer-profiles", userId],
    enabled: Boolean(userId),
    queryFn: async (): Promise<ViewerProfile[]> => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at");
      if (error) throw error;
      return (data ?? []) as ViewerProfile[];
    },
  });

export const watchlistQuery = (profileId: string | null | undefined) =>
  queryOptions({
    queryKey: ["watchlist", profileId],
    enabled: Boolean(profileId),
    queryFn: async (): Promise<WatchlistRow[]> => {
      if (!profileId) return [];
      const { data, error } = await supabase
        .from("watchlist")
        .select("*")
        .eq("profile_id", profileId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as WatchlistRow[];
    },
  });

export const progressQuery = (profileId: string | null | undefined) =>
  queryOptions({
    queryKey: ["watch-progress", profileId],
    enabled: Boolean(profileId),
    queryFn: async (): Promise<ProgressRow[]> => {
      if (!profileId) return [];
      const { data, error } = await supabase
        .from("watch_progress")
        .select("*")
        .eq("profile_id", profileId)
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as ProgressRow[];
    },
  });

export const subscriptionQuery = (userId: string | undefined) =>
  queryOptions({
    queryKey: ["subscription", userId],
    enabled: Boolean(userId),
    queryFn: async (): Promise<SubscriptionRow | null> => {
      const { data, error } = await supabase
        .from("subscriptions")
        .select("*")
        .maybeSingle();
      if (error) throw error;
      return (data ?? null) as SubscriptionRow | null;
    },
  });

export async function createProfile(input: {
  userId: string;
  name: string;
  avatarColor: string;
  isKids: boolean;
}) {
  const { error } = await supabase.from("profiles").insert({
    user_id: input.userId,
    name: input.name,
    avatar_color: input.avatarColor,
    is_kids: input.isKids,
  });
  if (error) throw error;
}

export async function deleteProfile(id: string) {
  const { error } = await supabase.from("profiles").delete().eq("id", id);
  if (error) throw error;
}

export async function toggleWatchlist(input: {
  userId: string;
  profileId: string;
  titleId: string;
  isSaved: boolean;
}) {
  if (input.isSaved) {
    const { error } = await supabase
      .from("watchlist")
      .delete()
      .eq("profile_id", input.profileId)
      .eq("title_id", input.titleId);
    if (error) throw error;
    return;
  }
  const { error } = await supabase.from("watchlist").insert({
    user_id: input.userId,
    profile_id: input.profileId,
    title_id: input.titleId,
  });
  if (error) throw error;
}

export async function saveProgress(input: {
  userId: string;
  profileId: string;
  titleId: string;
  episodeId: string | null;
  positionSeconds: number;
  durationSeconds: number | null;
}) {
  const { error } = await supabase.from("watch_progress").upsert(
    {
      user_id: input.userId,
      profile_id: input.profileId,
      title_id: input.titleId,
      episode_id: input.episodeId,
      position_seconds: Math.floor(input.positionSeconds),
      duration_seconds: input.durationSeconds ? Math.floor(input.durationSeconds) : null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "profile_id,title_id" },
  );
  if (error) throw error;
}

export async function selectPlan(input: { userId: string; planId: string }) {
  const { error } = await supabase.from("subscriptions").upsert(
    {
      user_id: input.userId,
      plan_id: input.planId,
      status: "active",
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );
  if (error) throw error;
}
