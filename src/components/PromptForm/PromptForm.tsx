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
  const { sendMessage, isLoading } = useChatContext();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [reasoning, setReasoning] = useState<boolean>(false);
  const dropdown = useDropdown((state) => state.dropdowns["modelDropdown"]);
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <motion.form
      ref={formRef}
      onSubmit={async (e) => {
        e.preventDefault();
        console.log(
          "Enviando mensagem do formulário de prompt. Prompt:",
          inputRef?.current?.value,
        );

        if (isLoading || !inputRef?.current?.value.trim()) return;

        sendMessage(
          {
            text: inputRef.current.value,
          },
          {
            body: {
              prompt: inputRef.current.value,
              reasoning: reasoning,
              // chatId,
              model: dropdown.selectedValue?.value || "BASIC",
            },
          },
        );
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
