import { create } from "zustand";
import { persist } from "zustand/middleware";

type AsideState = {
  asideIsOpen: boolean;
  toggleAside: () => void;
};

export const DESKTOP_BREAKPOINT = 768;

export const useAside = create<AsideState>()(
  persist(
    (set) => ({
      asideIsOpen:
        typeof window !== "undefined"
          ? window.innerWidth >= DESKTOP_BREAKPOINT
          : false,
      toggleAside: () =>
        set((prev) => ({
          asideIsOpen: !prev.asideIsOpen,
        })),
    }),
    {
      name: "aside-menu-storage",
      partialize: (state) => ({ asideIsOpen: state.asideIsOpen }),
    }
  )
);
