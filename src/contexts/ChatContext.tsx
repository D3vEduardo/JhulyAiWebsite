"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useChat } from "@ai-sdk/react";
import { usePathname, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useChatMessages } from "@/hooks/useChatMessages";

interface ChatContextProps extends ReturnType<typeof useChat> {
  chatId: string | null;
  isNewChat: boolean;
  isLoadingMessages: boolean;
}

const ChatContext = createContext<ChatContextProps | undefined>(undefined);

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
    api: "/api/chat",
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
        queryClient.invalidateQueries({
          queryKey: ["chat", `chat_${finalChatId}`],
        });
      }
    },
  });

  useEffect(() => {
    if (isNewChat && newChatId) {
      router.push(`/chat/${newChatId}`, { scroll: false });
    }
  }, [isNewChat, newChatId, router]);

  useEffect(() => {
    if (isNewChat) {
      chat.setMessages([]);
      return;
    }

    if (chatMessagesQuery.data) {
      chat.setMessages(chatMessagesQuery.data);
    }
  }, [isNewChat, chatId, chatMessagesQuery.data, chat]);

  const value = {
    ...chat,
    chatId,
    isNewChat,
    isLoadingMessages: chatMessagesQuery.isLoading,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChatContext() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChatContext must be used within a ChatProvider");
  }
  return context;
}
