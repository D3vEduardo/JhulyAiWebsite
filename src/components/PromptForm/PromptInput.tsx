import { memo, RefObject } from "react";
import { useChatInputContext } from "@/contexts/ChatContext/Hooks";
// import { FocusEvent } from "react";

interface iProps {
  formRef: RefObject<HTMLFormElement | null>;
}

function PromptInput({ formRef }: iProps) {
  const { value: input, onChange: handleInputChange } = useChatInputContext();
  console.log("Renderizei PromptInput");

  return (
    <textarea
      onChange={handleInputChange}
      value={input}
      onFocus={() => {
        document.addEventListener("keypress", (e) => {
          if (e.key === "Enter" && !e.shiftKey && formRef.current) {
            formRef.current.requestSubmit();
            return;
          }
        });
      }}
      placeholder="Digite sua mensagem aqui..."
      className="w-full min-h-full p-2 focus:outline-none resize-none py-1 px-2"
    ></textarea>
  );
}

export default memo(PromptInput);
