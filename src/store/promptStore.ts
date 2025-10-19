import { create } from "zustand";

interface PromptState {
  pendingPrompt: string | null;
  setPendingPrompt: (prompt: string | null) => void;
}

export const usePromptStore = create<PromptState>((set) => ({
  pendingPrompt: null,
  setPendingPrompt: (prompt) => set({ pendingPrompt: prompt }),
}));
