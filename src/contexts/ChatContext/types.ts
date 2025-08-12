import {
  ChatRequestOptions,
  ChatStatus,
  FileUIPart,
  UIDataTypes,
  UIMessage,
  UITools,
} from "ai";

type SendMessageType = (
  message?:
    | (Omit<UIMessage<unknown, UIDataTypes, UITools>, "id" | "role"> & {
        id?: string | undefined;
        role?: "system" | "user" | "assistant" | undefined;
      } & {
        text?: never;
        files?: never;
        messageId?: string;
      })
    | {
        text: string;
        files?: FileList | FileUIPart[];
        metadata?: unknown;
        parts?: never;
        messageId?: string;
      }
    | {
        files: FileList | FileUIPart[];
        metadata?: unknown;
        parts?: never;
        messageId?: string;
      }
    | undefined,
  options?: ChatRequestOptions,
) => Promise<void>;

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
