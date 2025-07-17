"use client";

import Image from "next/image";
import Sprite1 from "@public/sprites/thiking/sprite-1.png";
import Sprite2 from "@public/sprites/thiking/sprite-2.png";
import Sprite3 from "@public/sprites/thiking/sprite-3.png";
import { useEffect, useState } from "react";

const sprites = [Sprite1, Sprite2, Sprite3, Sprite2];

export default function LoadingSpritesAnimation({
  size = 100,
}: {
  size?: number;
}) {
  const [currentSprite, setCurrentSprite] = useState<number>(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSprite((prevSprite) => (prevSprite + 1) % sprites.length);
    }, 250);

    return () => clearInterval(interval);
  }, []);

  return (
    <span
      className="relative aspect-square"
      style={{
        width: size,
        height: size,
      }}
    >
      {sprites.map((sprite, index) => (
        <Image
          src={sprite}
          alt={`Sprite ${index + 1}`}
          key={`sprite-loading-${index + 1}`}
          width={size}
          height={size}
          className="absolute left-0 top-0"
          style={{
            visibility: currentSprite === index ? "visible" : "hidden",
          }}
        ></Image>
      ))}
    </span>
  );
}
