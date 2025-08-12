import { useContext } from "react";
import { ChatContext } from "./Context";

export function useChatContext() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat deve ser usado dentro de um ChatProvider");
  }
  return context;
}
