"use client";

import AsideMenu from "@components/AsideMenu/AsideMenu";
import ChatContainer from "@components/ChatContainer/ChatContainer";
import { Suspense } from "react";

export default function ClientChat() {
  return (
    <main className="flex flex-col w-screen h-dvh relative !overflow-hidden">
      <AsideMenu />
      <Suspense fallback={<div>Loading...</div>}>
        <ChatContainer />
      </Suspense>
    </main>
  );
}
