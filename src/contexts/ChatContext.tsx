"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  ReactNode,
} from "react";
import { Message, useChat } from "@ai-sdk/react";
import { usePathname, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useChatMessages } from "@/hooks/useChatMessages";
import { ChatRequestOptions } from "ai";

interface ChatState {
  chatId: string | null;
  isNewChat: boolean;
  isLoadingMessages: boolean;
  messages: Message[];
  status: "idle" | "loading" | "streaming" | "error" | "ready";
  error: Error | undefined;
}

interface ChatInput {
  value: string;
  onChange: (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLTextAreaElement>,
  ) => void;
}

interface ChatActions {
  handleSubmit: (
    event?:
      | {
          preventDefault?: (() => void) | undefined;
        }
      | undefined,
    chatRequestOptions?: ChatRequestOptions | undefined,
  ) => void;
  stop: () => void;
  addToolResult: ({
    toolCallId,
    result,
  }: {
    toolCallId: string;
    result: unknown;
  }) => void;
  setMessages: (
    messages: Message[] | ((messages: Message[]) => Message[]),
  ) => void;
}

const ChatStateContext = createContext<ChatState | undefined>(undefined);
const ChatActionsContext = createContext<ChatActions | undefined>(undefined);
const ChatInputContext = createContext<ChatInput | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();

  const chatId = pathname.includes("/chat/")
    ? (pathname.split("/").pop() ?? null)
    : null;
  const isNewChat = chatId === "new";
  const newChatIdRef = useRef<string | null>(null);
  const [navigateToChatId, setNavigateToChatId] = useState<string | null>(null);

  const chatMessagesQuery = useChatMessages(isNewChat ? null : chatId);

  const onResponse = useCallback(
    async (response: Response) => {
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Ocorreu um erro desconhecido.");
      }

      const newChatIdFromHeader = response.headers.get("X-Chat-Id");
      if (isNewChat && newChatIdFromHeader) {
        newChatIdRef.current = newChatIdFromHeader;
        await queryClient.invalidateQueries({ queryKey: ["chats"] });
      }
    },
    [isNewChat, queryClient],
  );

  const onFinish = useCallback(
    (message: Message) => {
      const finalChatId = isNewChat ? newChatIdRef.current : chatId;
      console.log("Final chatId onFinish:", finalChatId);
      if (!finalChatId) {
        alert("Final chat não existe!");
        return;
      }

      queryClient.setQueryData(
        ["chat", `chat_${finalChatId}`],
        (oldData: Message[] | undefined) => {
          if (oldData) {
            const messageIndex = oldData.findIndex((m) => m.id === message.id);
            if (messageIndex !== -1) {
              const newData = [...oldData];
              newData[messageIndex] = message;
              return newData;
            }
            return [...oldData, message];
          }
          return [message];
        },
      );

      setNavigateToChatId(finalChatId);
    },
    [isNewChat, chatId, queryClient],
  );

  const chat = useChat({
    onResponse,
    onFinish,
    body: {
      chatId,
    },
  });

  useEffect(() => {
    if (navigateToChatId) {
      router.push(`/chat/${navigateToChatId}`, { scroll: false });
      setNavigateToChatId(null);
    }
  }, [navigateToChatId, router]);

  useEffect(() => {
    if (isNewChat && !newChatIdRef.current && pathname !== "/chat/new") {
      router.push("/chat/new", { scroll: false });
    }
  }, [isNewChat, router, pathname]);

  useEffect(() => {
    if (chatMessagesQuery.data && chat.status !== "streaming") {
      chat.setMessages(chatMessagesQuery.data);
    }
  }, [chatMessagesQuery.data, chat]);

  useEffect(() => {
    if (pathname === "/chat/new" && chat.status !== "streaming") {
      newChatIdRef.current = null;
      chat.setMessages([]);
    }
  }, [isNewChat, chat, pathname]);

  const chatState = useMemo(
    () => ({
      chatId,
      isNewChat,
      isLoadingMessages: chatMessagesQuery.isLoading,
      messages: chat.messages,
      status: chat.status as ChatState["status"],
      error: chat.error,
    }),
    [
      chatId,
      isNewChat,
      chatMessagesQuery.isLoading,
      chat.messages,
      chat.status,
      chat.error,
    ],
  );

  const chatActions = useMemo(
    () => ({
      handleSubmit: chat.handleSubmit,
      stop: chat.stop,
      addToolResult: chat.addToolResult,
      setMessages: chat.setMessages,
    }),
    [chat.handleSubmit, chat.stop, chat.addToolResult, chat.setMessages],
  );

  const chatInput = {
    value: chat.input,
    onChange: chat.handleInputChange,
  };

  return (
    <ChatStateContext.Provider value={chatState}>
      <ChatActionsContext.Provider value={chatActions}>
        <ChatInputContext.Provider value={chatInput}>
          {children}
        </ChatInputContext.Provider>
      </ChatActionsContext.Provider>
    </ChatStateContext.Provider>
  );
}

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
