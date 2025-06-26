"use client";

import { Icon } from "@iconify-icon/react";
import Button from "../Button";
import PromptInput from "./PromptInput";
import { motion } from "motion/react";
import { useState } from "react";
import { UseChatHelpers } from "@ai-sdk/react";
import { useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";

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
  const searchParams = useSearchParams();
  const chatIsReady = chat.status === "ready" || chat.status === "error";
  const [reasoning, setReasoning] = useState<boolean>(false);
  const queryClient = useQueryClient();

  return (
    <motion.form
      onSubmit={async (e) => {
        const response = chat.handleSubmit(e, {
          body: {
            prompt: chat.input,
            chatId: searchParams.get("chatId"),
            reasoning: reasoning,
          },
        });

        // DEBUG: Log do response para verificar headers
        console.log("DEBUG - Response from API:", response);

        // Invalida cache de chats para forçar atualização do AsideMenu
        queryClient.invalidateQueries({ queryKey: ["chats"] });
      }}
      // initial={{
      //   bottom: "2%",
      // }}
      // animate={{
      //   bottom: visible ? "2%" : "-20%",
      // }}
      // transition={{
      //   type: "spring",
      //   bounce: 0.15,
      //   stiffness: 125,
      //   ease: "backInOut",
      // }}
      className={`absolute bg-peach left-1/2 bottom-6 -translate-x-1/2 w-95/100 overflow-hidden
                py-4 px-2 rounded-lg border-2 border-almond z-10 flex flex-col gap-2 items-center
                max-w-[900px]`}
    >
      <PromptInput
        handleInputChange={chat.handleInputChange}
        inputValue={chat.input}
      />
      <section className="flex w-full justify-end gap-x-2 py-1 px-2">
        <Button
          type="button"
          variant={{ color: reasoning ? "primary" : "quarternary" }}
          className="w-12 h-12 p-2"
          onClick={() => setReasoning((prev) => !prev)}
        >
          <Icon icon="streamline:brain-remix" width="24" height="24" />
        </Button>
        <Button
          type={chatIsReady ? "submit" : "button"}
          className="aspect-square "
          variant={{
            color: chatIsReady ? "secondary" : "danger",
            size: "sm",
          }}
          onClick={() => {
            if (!chatIsReady) chat.stop();
          }}
        >
          {chatIsReady ? (
            <Icon
              icon="iconamoon:send-bold"
              width="24"
              height="24"
              className="-rotate-45"
            />
          ) : (
            <Icon
              icon="material-symbols:stop-circle-outline-rounded"
              width="24"
              height="24"
            />
          )}
        </Button>
      </section>
    </motion.form>
  );
}
