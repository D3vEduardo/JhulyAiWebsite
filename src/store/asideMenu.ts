import { create } from "zustand";

type AsideState = {
    asideIsOpen: boolean;
    toggleAside: () => void;
}

export const useAside = create<AsideState>(set => ({
    asideIsOpen: false,
    toggleAside: () => set((prev) => ({
        asideIsOpen: !prev.asideIsOpen
    }))
}))