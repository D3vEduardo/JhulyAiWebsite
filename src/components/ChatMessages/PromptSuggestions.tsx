"use client";
import { useChatContext } from "@/contexts/ChatContext/Hooks";
import { motion, useAnimate } from "motion/react";
import { useEffect } from "react";

const suggestions = [
  "Como posso me concentrar melhor nos estudos?",
  "Crie um plano de estudos para a prova de biologia",
  "Me explique o que é a Teoria da Relatividade em termos simples",
  "Quais são as melhores técnicas de memorização?",
];

export default function PromptSuggestions() {
  const [scope, animate] = useAnimate();
  const { status } = useChatContext();

  useEffect(() => {
    animate(
      ".suggestion-card",
      { opacity: 1, y: 0 },
      {
        delay: (i) => 0.2 + i * 0.1,
        type: "spring",
        stiffness: 150,
        damping: 10,
      }
    );
  }, [animate]);

  const handleSuggestionClick = ({ suggestion }: { suggestion: string }) => {
    if (status === "ready") {
      window.dispatchEvent(
        new CustomEvent<{ prompt: string }>("prompt-suggestion-selected", {
          detail: {
            prompt: suggestion,
          },
        })
      );
    }
  };

  return (
    <div className="flex flex-col items-center justify-center !h-full !w-full">
      <motion.p
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 150, damping: 10, delay: 0.1 }}
        className="text-4xl font-bold mb-4 pb-1 overflow-hidden text-cocoa"
      >
        Como posso te ajudar hoje?
      </motion.p>
      <div
        ref={scope}
        className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-3xl p-4 overflow-hidden"
      >
        {suggestions.map((prompt, index) => (
          <motion.div
            key={prompt.slice(0, 8) + "_" + index}
            initial={{ opacity: 0, y: 20 }}
            onClick={() => handleSuggestionClick({ suggestion: prompt })}
            className="suggestion-card bg-peach border-2 border-almond rounded-2xl p-4 hover:bg-strawberry/40 transition-colors cursor-pointer"
            transition={{
              type: "spring",
              stiffness: 150,
              damping: 10,
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <p className="text-cocoa">{prompt}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
