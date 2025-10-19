import { UseChatHelpers } from "@ai-sdk/react";
import {
  ChatRequestOptions,
  ChatStatus,
  UIDataTypes,
  UIMessage,
  UITools,
} from "ai";

type ChatType = UseChatHelpers<UIMessage<unknown, UIDataTypes, UITools>>;

type SendMessageType = ChatType["sendMessage"];

export interface ChatContextType {
  // Estado
  messages: UIMessage[];
  messagesIsLoading: boolean;
  isLoading: boolean;
  status: ChatStatus;
  error: Error | undefined;

  // Ações
  sendMessage: SendMessageType;
  stop: () => void;
  setMessages: (messages: UIMessage[]) => void;

  // Info do chat
  chatId: string | null;
  isNewChat: boolean;
}
