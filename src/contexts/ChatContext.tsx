"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useMemo,
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
  input: string;
  messages: Message[];
  status: "idle" | "loading" | "streaming" | "error" | "ready";
  error: Error | undefined;
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
  handleInputChange: (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLTextAreaElement>,
  ) => void;
  stop: () => void;
  addToolResult: ({
    toolCallId,
    result,
  }: {
    toolCallId: string;
    result: unknown;
  }) => void;
}

const ChatStateContext = createContext<ChatState | undefined>(undefined);
const ChatActionsContext = createContext<ChatActions | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();

  const chatId = pathname.includes("/chat/")
    ? (pathname.split("/").pop() ?? null)
    : null;
  const isNewChat = chatId === "new";

  const [newChatId, setNewChatId] = useState<string | null>(null);

  const chatMessagesQuery = useChatMessages(isNewChat ? null : chatId);

  const chat = useChat({
    onResponse(response) {
      const newChatIdFromHeader = response.headers.get("X-Chat-Id");
      if (isNewChat && newChatIdFromHeader) {
        setNewChatId(newChatIdFromHeader);
        queryClient.invalidateQueries({ queryKey: ["chats"] });
      }
    },
    onFinish() {
      const finalChatId = newChatId || chatId;
      if (finalChatId && finalChatId !== "new") {
        // setTimeout(() => {
        queryClient.invalidateQueries({
          queryKey: ["chat", `chat_${finalChatId}`],
        });
        // }, 200);
      }
    },
    body: {
      chatId,
    },
  });

  useEffect(() => {
    if (isNewChat && !newChatId) {
      router.push("/chat/new", { scroll: false });
    }
  }, [isNewChat, newChatId, router]);

  useEffect(() => {
    if (chatMessagesQuery.data && chat.status !== "streaming") {
      console.log("Setando as mensagens com os dados da query...");
      chat.setMessages(chatMessagesQuery.data);
    }
  }, [chatMessagesQuery.data, chat]);

  useEffect(() => {
    if (isNewChat && newChatId) {
      router.push(`/chat/${newChatId}`, { scroll: false });
    }
  }, [isNewChat, newChatId, router]);

  const chatState = useMemo(
    () => ({
      chatId,
      isNewChat,
      isLoadingMessages: chatMessagesQuery.isLoading,
      input: chat.input,
      messages: chat.messages,
      status: chat.status as ChatState["status"],
      error: chat.error,
    }),
    [
      chatId,
      isNewChat,
      chatMessagesQuery.isLoading,
      chat.input,
      chat.messages,
      chat.status,
      chat.error,
    ],
  );

  const chatActions = useMemo(
    () => ({
      handleSubmit: chat.handleSubmit,
      handleInputChange: chat.handleInputChange,
      stop: chat.stop,
      addToolResult: chat.addToolResult,
    }),
    [chat.handleSubmit, chat.handleInputChange, chat.stop, chat.addToolResult],
  );

  return (
    <ChatStateContext.Provider value={chatState}>
      <ChatActionsContext.Provider value={chatActions}>
        {children}
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
