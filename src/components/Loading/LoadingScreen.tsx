"use client";

import LoadingSpritesAnimation from "./LoadingSpritesAnimation";
import { useChatMessages } from "@/hooks/useChatMessages";

export default function LoadingScreen() {
  const { isLoading: messagesIsLoading } = useChatMessages();

  if (!messagesIsLoading) return null;

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
