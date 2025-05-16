import { ComponentProps, useEffect, useState } from "react";
import { motion } from "motion/react";
import { twMerge } from "tailwind-merge";

type PropsType = ComponentProps<"span"> & {
    texts: string[];
    speed?: number;
}

export default function ZoopText({ texts, speed = 2000, className }: PropsType) {

    const [currentTextIndex, setCurrentTextIndex] = useState<number>(0);

    // console.log("Index atual:", currentTextIndex);
    // console.log("Palavra atual:", texts[currentTextIndex]);
    // console.log("Tamanho do array:", texts.length);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTextIndex(prev => (prev + 1) % texts.length)
        }, speed)

        return () => clearInterval(interval);

    }, [speed, texts.length])

    return (
        <motion.span
            layout
            className={twMerge("relative overflow-hidden", className)}
            transition={{
                ease: "backOut",
                type: "tween"
            }}
        >
            {
                texts.map((text, index) => (
                    <motion.p
                        key={`${index}-${text}`}
                        animate={{
                            opacity: index == currentTextIndex ? 1 : 0,
                            y: index == currentTextIndex ? 0 : 50,
                            // scale: index == currentTextIndex ? 1 : 0.5,
                        }}
                        transition={{
                            ease: "backOut",
                            type: "spring",
                            bounce: 0.2,
                            stiffness: 200,
                        }}
                        className="absolute top-1/2 left-0 -translate-y-1/2 w-full h-full
                        flex items-center justify-center text-center overflow-hidden
                        m-0 pb-1 md:pb-2.5 leading-5 opacity-0"
                    >
                        {text}
                    </motion.p>
                ))
            }
            <p
                className="opacity-0"
            >
                {texts[currentTextIndex]}
            </p>
        </motion.span>
    )
}