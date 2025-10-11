import { useState, useLayoutEffect } from "react";

export function useWindowSize(): number {
  const [innerWidth, setInnerWidth] = useState<number>(
    typeof window !== "undefined" ? window.innerWidth : 0
  );

  useLayoutEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      // Only update state if the width actually changed to avoid an unnecessary re-render
      setInnerWidth((prev) => (prev === w ? prev : w));
    };

    // Ensure state matches the real window width on mount, but avoid an extra setState
    if (typeof window !== "undefined") {
      setInnerWidth((prev) =>
        prev === window.innerWidth ? prev : window.innerWidth
      );
      window.addEventListener("resize", handleResize);
    }

    return () => window.removeEventListener("resize", handleResize);
    // Intentionally empty deps: we don't want this effect to re-run.
  }, []);

  return innerWidth;
}
