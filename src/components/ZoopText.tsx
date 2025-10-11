import { ComponentProps, useEffect, useState } from "react";
import { motion } from "motion/react";
import { twMerge } from "tailwind-merge";

type PropsType = ComponentProps<"span"> & {
  texts: string[];
  speed?: number;
};

export default function ZoopText({
  texts,
  speed = 2000,
  className,
}: PropsType) {
  console.debug("[src/components/ZoopText.tsx:ZoopText]", "Renderizei ZoopText");
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % texts.length);
    }, speed * 2);
    return () => clearInterval(interval);
  }, [texts.length, speed]);

  return (
    <motion.span
      className={twMerge(
        "inline-grid place-items-center text-center overflow-hidden h-[1em]",
        className,
      )}
      style={{
        gridTemplateAreas: "1 / 1",
      }}
      layout
      transition={{
        ease: "backOut",
        type: "tween",
      }}
    >
      <motion.p
        key={currentIndex}
        style={{ gridArea: "1 / 1" }}
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        transition={{
          duration: speed / 2000,
          ease: "backOut",
          type: "spring",
          bounce: 0.2,
          stiffness: 200,
        }}
        className="overflow-hidden whitespace-nowrap"
      >
        {texts[currentIndex]}
      </motion.p>
    </motion.span>
  );
}
