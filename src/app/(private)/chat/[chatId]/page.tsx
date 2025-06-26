"use client";

import AsideMenu from "@component/csr/AsideMenu/AsideMenu";
import MessagesContainer from "@/component/csr/MessagesContainer/MessagesContainer";
import { Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      refetchOnMount: false,
      retry: 1,
      staleTime: 1000 * 60 * 5,
    },
    mutations: {
      retry: 1,
      retryDelay: 1000,
    },
  },
});

export default function Chat() {
  return (
    <QueryClientProvider client={queryClient}>
      <main className="flex flex-col w-screen h-dvh relative overflow-hidden">
        <AsideMenu />
        <Suspense fallback={<div>Loading...</div>}>
          <MessagesContainer />
        </Suspense>
      </main>
    </QueryClientProvider>
  );
}
