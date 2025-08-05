import { useState, useLayoutEffect } from "react";

export function useWindowSize(): number {
  const [innerWidth, setInnerWidth] = useState<number>(
    typeof window !== "undefined" ? window.innerWidth : 0,
  );

  useLayoutEffect(() => {
    const handleResize = () => setInnerWidth(window.innerWidth);
    setInnerWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return innerWidth;
}
