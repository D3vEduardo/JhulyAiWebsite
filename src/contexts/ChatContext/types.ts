import {
  ChatRequestOptions,
  ChatStatus,
  FileUIPart,
  UIDataTypes,
  UIMessage,
  UITools,
} from "ai";

type SendMessageType = (
  message:
    | string
    | (Omit<UIMessage, "id" | "role"> & {
        role?: "user" | "assistant" | "system" | "function" | "data" | "tool";
      }),
  options?: ChatRequestOptions
) => Promise<string | void>;

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
