"use client"

import { ReactNode } from "react"
import { twMerge } from "tailwind-merge"
import { tv } from "tailwind-variants"
import { motion, HTMLMotionProps } from "motion/react";

type MotionButtonProps = HTMLMotionProps<"button">;

interface PropsType extends MotionButtonProps {
    children: ReactNode,
    variant?: {
        size?: "sm" | "md" | "lg",
        color?: "danger" | "primary" | "secondary" | "tertiary" | "quarternary",
        hoverAnimationSize?: number;
        tapAnimationSize?: number;
    }
}

export default function Button({ children, className, variant, ...props }: PropsType) {

    const button = tv({
        base: `font-medium flex items-center overflow-hidden
        justify-center text-center rounded-lg custom-cursor-hover`,
        variants: {
            size: {
                sm: "px-3 py-1 text-xl",
                md: "px-4 py-2 text-2xl",
                lg: "px-6 py-3 text-3xl"
            },
            color: {
                danger: "bg-red-400 text-background",
                primary: "bg-button-primary text-background",
                secondary: "bg-button-secondary text-text-primary",
                tertiary: "bg-button-tertiary text-text-primary",
                quarternary: "bg-button-quarternary text-text-primary",
            }
        }
    });

    const selectedVariant = {
        size: variant?.size || "md",
        color: variant?.color || "primary"
    }

    return (
        <motion.button
            className={twMerge(button(selectedVariant), className)}
            {...props}
            whileHover={{
                scale: variant?.hoverAnimationSize || 1.1,
                transition: { ease: "backInOut", duration: 0.1, type: "spring", bounce: 0.1, stiffness: 300 }
            }}
            whileTap={{
                scale: variant?.tapAnimationSize || 0.95,
                transition: { ease: "backInOut", duration: 0.5, type: "spring", bounce: 0.2, stiffness: 300 }
            }}
        >
            {children}
        </motion.button>
    )
}
