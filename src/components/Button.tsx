"use client";

import { ReactNode } from "react";
import { twMerge } from "tailwind-merge";
import { tv } from "tailwind-variants";
import { motion, HTMLMotionProps } from "motion/react";

type MotionButtonProps = HTMLMotionProps<"button">;

interface PropsType extends MotionButtonProps {
  children: ReactNode;
  variant?: {
    size?: "sm" | "md" | "lg";
    color?:
      | "danger"
      | "primary"
      | "secondary"
      | "tertiary"
      | "quarternary"
      | "quinary";
    hoverAnimationSize?: number;
    tapAnimationSize?: number;
  };
}

export default function Button({
  children,
  className,
  variant,
  ...props
}: PropsType) {
  console.debug("[src/components/Button.tsx:Button]", "Renderizei Button");

  const button = tv({
    base: `font-medium flex items-center overflow-hidden
        justify-center text-center rounded-2xl custom-cursor-hover`,
    variants: {
      size: {
        sm: "p-2 text-xl",
        md: "p-4 text-2xl",
        lg: "p-6 text-3xl",
      },
      color: {
        danger: "bg-red-400 text-vanilla",
        primary: "bg-papaya text-vanilla",
        secondary: "bg-strawberry text-cocoa",
        tertiary: "bg-watermelon text-cocoa",
        quarternary: "bg-apricot text-cocoa",
        quinary: "border-3 border-cinnamon/30 rounded-xl shadow-md bg-vanilla",
      },
    },
  });

  const selectedVariant = {
    size: variant?.size || "md",
    color: variant?.color || "primary",
  };

  return (
    <motion.button
      className={twMerge(button(selectedVariant), className)}
      {...props}
      whileHover={{
        scale: variant?.hoverAnimationSize || 1.1,
        transition: {
          ease: "backInOut",
          duration: 0.1,
          type: "spring",
          bounce: 0.1,
          stiffness: 300,
        },
      }}
      whileTap={{
        scale: variant?.tapAnimationSize || 0.95,
        transition: {
          ease: "backInOut",
          duration: 0.5,
          type: "spring",
          bounce: 0.2,
          stiffness: 300,
        },
      }}
    >
      {children}
    </motion.button>
  );
}
