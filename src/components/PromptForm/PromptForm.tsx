"use client";

import PromptInput from "./PromptInput";
import { motion } from "motion/react";
import { useRef, useState } from "react";
import PromptSubmitButton from "./PromptSubmitButton";
import ReasoningButton from "./ReasoningButton";
import { useChatContext } from "@/contexts/ChatContext/Hooks";
import { useDropdown } from "@store/dropdown";
import { CustomTooltip } from "../CustomTooltip";

export default function PromptForm() {
  const { sendMessage, isLoading, chatId } = useChatContext();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [reasoning, setReasoning] = useState<boolean>(false);
  const dropdown = useDropdown((state) => state.dropdowns["modelDropdown"]);
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <motion.form
      ref={formRef}
      onSubmit={async (e) => {
        e.preventDefault();
        const prompt = inputRef?.current?.value.trim();
        console.debug(
          "[src/components/PromptForm/PromptForm.tsx:PromptForm]",
          "Enviando mensagem do formulário de prompt. Prompt:",
          prompt
        );

        if (isLoading || !prompt || !inputRef.current) return;

        sendMessage(
          {
            text: prompt,
          },
          {
            body: {
              prompt,
              reasoning: reasoning,
              id: chatId,
              model: dropdown.selectedValue?.value || "BASIC",
            },
          }
        );

        inputRef.current.value = "";
      }}
      layout={true}
      transition={{ type: "spring", stiffness: 80 }}
      className={`absolute bg-peach left-1/2 bottom-[4vh] -translate-x-1/2 w-95/100 overflow-hidden
                py-2 px-2 rounded-2xl border-2 border-almond z-10 flex justify-between gap-x-2
                max-w-[900px]`}
    >
      <PromptInput formRef={formRef} inputRef={inputRef} />
      <section className="flex flex-col md:flex-initial justify-end gap-2 py-1 px-2">
        <ReasoningButton reasoning={reasoning} setReasoning={setReasoning} />
        <PromptSubmitButton />
        <CustomTooltip anchorSelect=".prompt-form-button" delayShow={500} />
      </section>
    </motion.form>
  );
}
