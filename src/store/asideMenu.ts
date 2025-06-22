import { create } from "zustand";

type AsideState = {
    asideIsOpen: boolean;
    toggleAside: () => void;
}

export const useAside = create<AsideState>(set => ({
    asideIsOpen: typeof window !== 'undefined' ? window.innerWidth >= 768 : false,
    toggleAside: () => set((prev) => ({
        asideIsOpen: !prev.asideIsOpen
    }))
}))