"use client";

import Image from "next/image";
import Sprite1 from "@public/sprites/thiking/sprite-1.png";
import Sprite2 from "@public/sprites/thiking/sprite-2.png";
import Sprite3 from "@public/sprites/thiking/sprite-3.png";
import { useCallback, useEffect, useState } from "react";

const sprites = [Sprite1, Sprite2, Sprite3, Sprite2];

export default function LoadingSpritesAnimation({
  size = 100,
}: {
  size?: number;
}) {
  const [currentSprite, setCurrentSprite] = useState<number>(0);
  const [_imagesLoaded, setImagesLoaded] = useState<boolean[]>(
    new Array(sprites.length).fill(false)
  );

  const handleImageLoad = useCallback((index: number) => {
    setImagesLoaded((prev) => {
      const newState = [...prev];
      newState[index] = true;
      return newState;
    });
  }, []);

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
          priority={index === 0}
          loading="eager"
          quality={100}
          placeholder="empty"
          onLoad={handleImageLoad.bind(null, index)}
          sizes={`${size}px`}
          unoptimized={false}
        ></Image>
      ))}
    </span>
  );
}
