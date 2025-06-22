"use client";

import { Icon } from "@iconify-icon/react";
import Button from "../Button";
import PromptInput from "./PromptInput";
import { useSearchParams } from "next/navigation";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

interface SubmitBody {
  prompt: string;
  chatId: string | null;
}

interface PromptFormProps {
  handleSubmit: (
    e: React.FormEvent<HTMLFormElement>,
    options?: { body: SubmitBody }
  ) => void;
  handleInputChange: (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLTextAreaElement>
  ) => void;
  input: string;
}

export default function PromptForm({
  handleSubmit,
  handleInputChange,
  input,
}: PromptFormProps) {
console.log("Renderizei PromptForm");
  const searchParams = useSearchParams();
  const lastScrollY = useRef<number>(0);
  const [visible, setVisible] = useState<boolean>(true);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY.current) {
        setVisible(false);
      } else {
        setVisible(true);
      }
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.form
      onSubmit={(e) =>
        handleSubmit(e, {
          body: {
            prompt: input,
            chatId: searchParams.get("chatId"),
          },
        })
      }
      initial={{
        y: "16px"
      }}
      animate={{
        marginBottom: visible ? "16px" : 0
      }}
      className={`absolute bg-peach left-1/2 bottom-4 -translate-x-1/2 w-95/100 overflow-hidden
                py-4 px-2 rounded-lg border-2 border-almond z-10 flex gap-2 items-center`}
    >
      <PromptInput handleInputChange={handleInputChange} inputValue={input} />
      <Button
        type="submit"
        className="aspect-square mr-1"
        variant={{
          color: "secondary",
          size: "sm",
        }}
      >
        <Icon
          icon="iconamoon:send-bold"
          width="24"
          height="24"
          className="-rotate-45"
        />
      </Button>
    </motion.form>
  );
}
