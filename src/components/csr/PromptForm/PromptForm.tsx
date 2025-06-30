"use client";

import PromptInput from "./PromptInput";
import { motion } from "motion/react";
import { useState } from "react";
import { useParams } from "next/navigation";
import PromptSubmitButton from "./PromptSubmitButton";
import ReasoningButton from "./ReasoningButton";
import {
  useChatStateContext,
  useChatActionsContext,
} from "@/contexts/ChatContext";

export default function PromptForm() {
  console.log("Renderizei PromptForm");
  const { input, status, messages } = useChatStateContext();
  const { handleSubmit, stop } = useChatActionsContext();
  const { chatId } = useParams();
  const chatIsReady = status === "ready" || status === "error";
  const [reasoning, setReasoning] = useState<boolean>(false);

  return (
    <motion.form
      onSubmit={async (e) => {
        handleSubmit(e, {
          body: {
            prompt: input,
            reasoning: reasoning,
            chatId,
          },
        });
      }}
      className={`absolute bg-peach left-1/2 bottom-6 -translate-x-1/2 w-95/100 overflow-hidden
                py-4 px-2 rounded-lg border-2 border-almond z-10 flex flex-col gap-2 items-center
                max-w-[900px]`}
    >
      <PromptInput />
      <section className="flex w-full justify-end gap-x-2 py-1 px-2">
        <ReasoningButton
          reasoning={reasoning}
          setReasoning={setReasoning}
          chatIsReady={chatIsReady}
        />
        <PromptSubmitButton
          chatIsReady={chatIsReady}
          stop={stop}
          messagesLength={messages.length}
        />
      </section>
    </motion.form>
  );
}
