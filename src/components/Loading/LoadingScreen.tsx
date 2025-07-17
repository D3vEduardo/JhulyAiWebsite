"use client";

import { useChatStateContext } from "@/contexts/ChatContext";
import LoadingSpritesAnimation from "./LoadingSpritesAnimation";

export default function LoadingScreen() {
  const { isLoadingMessages } = useChatStateContext();

  if (!isLoadingMessages) return null;

  return (
    <div
      className="flex h-svh w-screen items-center justify-center absolute left-0 top-0
        bg-vanilla/50 backdrop-blur-md z-[100]"
    >
      <LoadingSpritesAnimation />
      <p className="text-4xl text-center shine-text overflow-hidden">
        Loading...
      </p>
    </div>
  );
}
