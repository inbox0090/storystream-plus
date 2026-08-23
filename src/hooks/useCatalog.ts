import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { toast } from "sonner";

import { useAuth } from "@/hooks/useAuth";
import {
  categoriesQuery,
  titleCategoriesQuery,
  titlesQuery,
  type Title,
} from "@/lib/catalog";
import {
  profilesQuery,
  progressQuery,
  toggleWatchlist,
  watchlistQuery,
} from "@/lib/user-data";
import { useActiveProfile } from "@/store/profile";

export function useViewerContext() {
  const { user, isAuthenticated, loading } = useAuth();
  const { activeProfileId, setActiveProfile } = useActiveProfile();
  const { data: profiles = [] } = useQuery(profilesQuery(user?.id));
  const activeProfile = profiles.find((p) => p.id === activeProfileId) ?? null;
  return {
    user,
    isAuthenticated,
    loading,
    profiles,
    activeProfile,
    activeProfileId: activeProfile?.id ?? null,
    setActiveProfile,
  };
}

export function useCatalog() {
  const { user, activeProfileId, activeProfile } = useViewerContext();
  const queryClient = useQueryClient();

  const titles = useQuery(titlesQuery(false));
  const categories = useQuery(categoriesQuery());
  const links = useQuery(titleCategoriesQuery());
  const watchlist = useQuery(watchlistQuery(activeProfileId));
  const progress = useQuery(progressQuery(activeProfileId));

  const kidsMode = activeProfile?.is_kids ?? false;

  const visibleTitles = useMemo(
    () => (titles.data ?? []).filter((t) => (kidsMode ? t.is_kids : true)),
    [titles.data, kidsMode],
  );

  const rows = useMemo(() => {
    const byCategory = new Map<string, Title[]>();
    for (const link of links.data ?? []) {
      const title = visibleTitles.find((t) => t.id === link.title_id);
      if (!title) continue;
      const list = byCategory.get(link.category_id) ?? [];
      list.push(title);
      byCategory.set(link.category_id, list);
    }
    return (categories.data ?? []).map((c) => ({
      category: c,
      titles: byCategory.get(c.id) ?? [],
    }));
  }, [links.data, categories.data, visibleTitles]);

  const savedIds = useMemo(
    () => new Set((watchlist.data ?? []).map((w) => w.title_id)),
    [watchlist.data],
  );

  const progressById = useMemo(() => {
    const map: Record<string, number> = {};
    for (const row of progress.data ?? []) {
      if (row.duration_seconds && row.duration_seconds > 0) {
        map[row.title_id] = (row.position_seconds / row.duration_seconds) * 100;
      }
    }
    return map;
  }, [progress.data]);

  const continueWatching = useMemo(() => {
    const order = (progress.data ?? []).map((p) => p.title_id);
    return order
      .map((id) => visibleTitles.find((t) => t.id === id))
      .filter((t): t is Title => Boolean(t));
  }, [progress.data, visibleTitles]);

  const saveMutation = useMutation({
    mutationFn: async (title: Title) => {
      if (!user || !activeProfileId) throw new Error("no-profile");
      await toggleWatchlist({
        userId: user.id,
        profileId: activeProfileId,
        titleId: title.id,
        isSaved: savedIds.has(title.id),
      });
      return savedIds.has(title.id);
    },
    onSuccess: (wasSaved) => {
      void queryClient.invalidateQueries({ queryKey: ["watchlist"] });
      toast.success(wasSaved ? "Removed from My List" : "Added to My List");
    },
    onError: (error) => {
      if (error instanceof Error && error.message === "no-profile") {
        toast.error("Sign in and pick a profile to use My List");
        return;
      }
      toast.error("Could not update My List");
    },
  });

  return {
    titles: visibleTitles,
    allTitles: titles.data ?? [],
    categories: categories.data ?? [],
    rows,
    savedIds,
    progressById,
    continueWatching,
    isLoading: titles.isLoading || categories.isLoading,
    featured:
      visibleTitles.find((t) => t.is_featured) ?? visibleTitles[0] ?? null,
    toggleSave: (title: Title) => saveMutation.mutate(title),
  };
}
