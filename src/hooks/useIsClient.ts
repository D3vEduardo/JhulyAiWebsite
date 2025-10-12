"use client";

import { useLayoutEffect, useState } from "react";

export function useIsClient() {
  const [isClient, setIsClient] = useState(false);

  // Use useLayoutEffect so the flag flips before the browser paints. This
  // prevents an initial client render with `isClient === false` which could
  // cause transient layout differences (e.g. width 100% -> calc(100% - 280px)).
  useLayoutEffect(() => {
    setIsClient(true);
  }, []);

  return isClient;
}
