"use client";

import AsideMenu from "@components/csr/AsideMenu/AsideMenu";
import MessagesContainer from "@components/csr/MessagesContainer/MessagesContainer";
import { Suspense } from "react";

export default function ClientChat() {
  return (
    <main className="flex flex-col w-screen h-dvh relative overflow-hidden">
      <AsideMenu />
      <Suspense fallback={<div>Loading...</div>}>
        <MessagesContainer />
      </Suspense>
    </main>
  );
}
