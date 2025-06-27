"use client";

import { Icon } from "@iconify-icon/react";
import Button from "../Button";
import PromptInput from "./PromptInput";
import { motion } from "motion/react";
import { useState } from "react";
import { UseChatHelpers } from "@ai-sdk/react";
import { useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import PromptSubmitButton from "./PromptSubmitButton";
import ReasoningButton from "./ReasoningButton";

// interface SubmitBody {
//   prompt: string;
//   chatId: string | null;
// }

interface PromptFormProps {
  chat: UseChatHelpers & {
    addToolResult: ({
      toolCallId,
      result,
    }: {
      toolCallId: string;
      result: unknown;
    }) => void;
  };
}

export default function PromptForm({ chat }: PromptFormProps) {
  console.log("Renderizei PromptForm");
  const { chatId } = useParams();
  const chatIsReady = chat.status === "ready" || chat.status === "error";
  const [reasoning, setReasoning] = useState<boolean>(false);
  const queryClient = useQueryClient();

  return (
    <motion.form
      onSubmit={async (e) => {
        chat.handleSubmit(e, {
          body: {
            prompt: chat.input,
            reasoning: reasoning,
            chatId,
          },
        });
      }}
      className={`absolute bg-peach left-1/2 bottom-6 -translate-x-1/2 w-95/100 overflow-hidden
                py-4 px-2 rounded-lg border-2 border-almond z-10 flex flex-col gap-2 items-center
                max-w-[900px]`}
    >
      <PromptInput
        handleInputChange={chat.handleInputChange}
        inputValue={chat.input}
      />
      <section className="flex w-full justify-end gap-x-2 py-1 px-2">
        <ReasoningButton
          reasoning={reasoning}
          setReasoning={setReasoning}
          chatIsReady={chatIsReady}
        />
        <PromptSubmitButton chat={chat} chatIsReady={chatIsReady} />
      </section>
    </motion.form>
  );
}
