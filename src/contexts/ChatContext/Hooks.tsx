import { useContext } from "react";
import {
  ChatStateContext,
  ChatActionsContext,
  ChatInputContext,
} from "./Context";

export function useChatStateContext() {
  const context = useContext(ChatStateContext);
  if (context === undefined) {
    throw new Error("useChatStateContext must be used within a ChatProvider");
  }
  return context;
}

export function useChatActionsContext() {
  const context = useContext(ChatActionsContext);
  if (context === undefined) {
    throw new Error("useChatActionsContext must be used within a ChatProvider");
  }
  return context;
}

export function useChatInputContext() {
  const context = useContext(ChatInputContext);
  if (context === undefined) {
    throw new Error("useChatInputContext must be used within a ChatProvider");
  }
  return context;
}
