import { memo, RefObject } from "react"; // import { FocusEvent } from "react";

interface iProps {
  formRef: RefObject<HTMLFormElement | null>;
  inputRef: RefObject<HTMLTextAreaElement | null>;
}

function PromptInput({ formRef, inputRef }: iProps) {
  console.debug(
    "[src/components/PromptForm/PromptInput.tsx:PromptInput]",
    "Renderizei PromptInput"
  );

  return (
    <textarea
      ref={inputRef}
      onFocus={() => {
        document.addEventListener("keypress", (e) => {
          if (e.key === "Enter" && !e.shiftKey && formRef.current) {
            formRef.current.requestSubmit();
            if (inputRef.current?.value) inputRef.current.value = "";
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
