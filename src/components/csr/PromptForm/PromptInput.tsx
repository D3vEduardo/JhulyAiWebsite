import { memo } from "react";
import {
  useChatStateContext,
  useChatActionsContext,
} from "@/contexts/ChatContext";

function PromptInput() {
  const { input } = useChatStateContext();
  const { handleInputChange } = useChatActionsContext();
  console.log("Renderizei PromptInput");
  return (
    <textarea
      onChange={handleInputChange}
      value={input}
      placeholder="Digite sua mensagem aqui..."
      className="w-full h-10 p-2 focus:outline-none resize-none"
    ></textarea>
  );
}

export default memo(PromptInput);
