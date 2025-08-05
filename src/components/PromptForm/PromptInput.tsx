import { memo } from "react";
import { useChatInputContext } from "@/contexts/ChatContext/Hooks";

function PromptInput() {
  const { value: input, onChange: handleInputChange } = useChatInputContext();
  // const { value:  } = useChatInputContext();
  console.log("Renderizei PromptInput");
  return (
    <textarea
      onChange={handleInputChange}
      value={input}
      placeholder="Digite sua mensagem aqui..."
      className="w-full min-h-full p-2 focus:outline-none resize-none py-1 px-2"
    ></textarea>
  );
}

export default memo(PromptInput);
