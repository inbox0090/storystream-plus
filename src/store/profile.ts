import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ActiveProfileState {
  activeProfileId: string | null;
  setActiveProfile: (id: string | null) => void;
}

export const useActiveProfile = create<ActiveProfileState>()(
  persist(
    (set) => ({
      activeProfileId: null,
      setActiveProfile: (id) => set({ activeProfileId: id }),
    }),
    { name: "nova-active-profile" },
  ),
);
