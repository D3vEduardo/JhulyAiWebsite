import { useState, useLayoutEffect } from "react";

export function useWindowResize() {
  const [innerWidth, setInnerWidth] = useState<number>(0);

  useLayoutEffect(() => {
    const handleResize = () => setInnerWidth(window.innerWidth);

    // Inicializar o valor
    setInnerWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return innerWidth;
}
