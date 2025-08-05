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
  useChatInputContext,
} from "@/contexts/ChatContext/Hooks";
import { useDropdown } from "@store/dropdown";
import { CustomTooltip } from "../CustomTooltip";

export default function PromptForm() {
  const { value: input } = useChatInputContext();
  const { status, messages } = useChatStateContext();
  const { handleSubmit, stop } = useChatActionsContext();
  const { chatId } = useParams();
  const chatIsReady = status === "ready" || status === "error";
  const [reasoning, setReasoning] = useState<boolean>(false);
  const dropdown = useDropdown((state) => state.dropdowns["modelDropdown"]);

  return (
    <motion.form
      onSubmit={async (e) => {
        e.preventDefault();
        handleSubmit(e, {
          body: {
            prompt: input,
            reasoning: reasoning,
            chatId,
            model: dropdown.selectedValue?.value || "BASIC",
          },
        });
      }}
      layout={true}
      transition={{ type: "spring", stiffness: 80 }}
      className={`absolute bg-peach left-1/2 bottom-[4vh] -translate-x-1/2 w-95/100 overflow-hidden
                py-2 px-2 rounded-2xl border-2 border-almond z-10 flex justify-between gap-x-2
                max-w-[900px]`}
    >
      <PromptInput />
      <section className="flex flex-col md:flex-initial justify-end gap-2 py-1 px-2">
        <ReasoningButton
          reasoningText={reasoning}
          setReasoning={setReasoning}
          chatIsReady={chatIsReady}
        />
        <PromptSubmitButton
          chatIsReady={chatIsReady}
          stop={stop}
          messagesLength={messages.length}
        />
        <CustomTooltip anchorSelect=".prompt-form-button" delayShow={500} />
      </section>
    </motion.form>
  );
}
