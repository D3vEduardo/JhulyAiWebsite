import { create } from "zustand";
import { persist } from "zustand/middleware";

type AsideState = {
  asideIsOpen: boolean;
  isDesktop: boolean;
  toggleAside: () => void;
  setIsDesktop: (value: boolean) => void;
};

export const DESKTOP_BREAKPOINT = 768;

export const useAside = create<AsideState>()(
  persist(
    (set) => ({
      asideIsOpen:
        typeof window !== "undefined"
          ? window.innerWidth >= DESKTOP_BREAKPOINT
          : false,
      // Keep a shared `isDesktop` flag in the store so the whole app can
      // read the same breakpoint-derived value without reading window width
      // inconsistently in multiple components.
      isDesktop:
        typeof window !== "undefined"
          ? window.innerWidth >= DESKTOP_BREAKPOINT
          : false,
      toggleAside: () =>
        set((prev) => {
          console.debug(
            "[src/store/asideMenu.ts:useAside] toggleAside",
            "prev.asideIsOpen=",
            prev.asideIsOpen,
            "-> new=",
            !prev.asideIsOpen
          );
          // capture stack trace to understand who called toggleAside
          try {
            console.trace(
              "[src/store/asideMenu.ts:useAside] toggleAside trace"
            );
          } catch {
            // ignore
          }
          return { asideIsOpen: !prev.asideIsOpen };
        }),
      setIsDesktop: (value: boolean) => {
        // Avoid setting state if value hasn't changed to prevent unnecessary
        // re-renders that could cause transient UI flips.
        set((prev) => {
          if (prev.isDesktop === value) {
            console.debug(
              "[src/store/asideMenu.ts:useAside] setIsDesktop - no change",
              "current=",
              prev.isDesktop,
              "incoming=",
              value
            );
            return prev;
          }
          console.debug(
            "[src/store/asideMenu.ts:useAside] setIsDesktop - changed",
            "current=",
            prev.isDesktop,
            "incoming=",
            value
          );
          return { isDesktop: value };
        });
      },
    }),
    {
      name: "aside-menu-storage",
      partialize: (state) => ({
        asideIsOpen: state.asideIsOpen,
        isDesktop: state.isDesktop,
      }),
    }
  )
);
