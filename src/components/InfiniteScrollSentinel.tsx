"use client";

import { useEffect, useRef } from "react";

interface InfiniteScrollSentinelProps {
  onSentinelEnter: () => void;
  className?: string;
}

export default function InfiniteScrollSentinel({ 
  onSentinelEnter, 
  className = "" 
}: InfiniteScrollSentinelProps) {
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          onSentinelEnter();
        }
      },
      { threshold: 1.0 } // When 100% of the sentinel is visible
    );

    observer.observe(sentinel);

    return () => {
      if (sentinel) {
        observer.unobserve(sentinel);
      }
    };
  }, [onSentinelEnter]);

  return <div ref={sentinelRef} className={className} />;
}