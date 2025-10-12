"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";
import { useAside } from "@store/asideMenu";
import { DESKTOP_BREAKPOINT } from "@store/asideMenu";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      staleTime: 5 * 60 * 1000,
    },
  },
});

export default function Providers({ children }: { children: React.ReactNode }) {
  const setIsDesktop = useAside((s) => s.setIsDesktop);

  useEffect(() => {
    // Sync the store's isDesktop on mount and whenever the window resizes.
    let timer: ReturnType<typeof setTimeout> | null = null;
    const update = () => {
      const val = window.innerWidth >= DESKTOP_BREAKPOINT;
      console.debug(
        "[src/components/Providers.tsx:Providers] resize update (debounced)",
        "innerWidth=",
        window.innerWidth,
        "isDesktop=",
        val
      );
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        setIsDesktop(val);
        timer = null;
      }, 100);
    };

    // initial sync
    update();
    window.addEventListener("resize", update);
    return () => {
      if (timer) clearTimeout(timer);
      window.removeEventListener("resize", update);
    };
    // intentionally no deps besides setter
  }, [setIsDesktop]);

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
