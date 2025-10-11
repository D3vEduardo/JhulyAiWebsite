import { useChatMessages } from "@/hooks/useChatMessages";
import { useChat } from "@ai-sdk/react";
import { useQueryClient } from "@tanstack/react-query";
import { UIMessage, DefaultChatTransport } from "ai";
import { ReactNode, useCallback, useEffect, useRef } from "react";
import { ChatContext } from "./Context";
import { ChatContextType } from "./types";

interface ChatProviderProps {
  chatId: string | null;
  children: ReactNode;
}

export function ChatProvider({ chatId, children }: ChatProviderProps) {
  const queryClient = useQueryClient();
  const isNewChat = chatId === "new" || !chatId;
  const newChatIdRef = useRef<string | null>(null);

  const chatMessagesQuery = useChatMessages();

  const onFinish = useCallback(
    ({ message }: { message: UIMessage }) => {
      if (!chatId || isNewChat) {
        const finalChatId = newChatIdRef.current;
        if (finalChatId) {
          queryClient.setQueryData(
            ["chat", `chat_${finalChatId}`],
            (oldData) => {
              const prev = (oldData as UIMessage[]) ?? [];
              return [...prev, message];
            }
          );
          window.dispatchEvent(
            new CustomEvent("chat-created", {
              detail: { chatId: finalChatId },
            })
          );
        }
        return;
      }

      queryClient.setQueryData(["chat", `chat_${chatId}`], (oldData) => {
        const prev = (oldData as UIMessage[]) ?? [];
        return [...prev, message];
      });
    },
    [chatId, isNewChat, queryClient]
  );

  const onData = useCallback(
    async (message: { type: `data-${string}`; data: unknown }) => {
      if (message.type === "data-chat-created") {
        const data = message.data as {
          chatId?: string;
          redirect?: boolean;
          messages: UIMessage[];
        };

        if (data.chatId) {
          queryClient.setQueryData(
            ["chat", `chat_${data.chatId}`],
            data.messages
          );
          newChatIdRef.current = data.chatId;
          console.debug(
            "[src/contexts/ChatContext/Provider.tsx:ChatProvider]",
            "Novo chatId salvo:",
            data.chatId
          );
        }
      }
    },
    [queryClient]
  );

  const chat = useChat({
    id: chatId || "new",
    messages: [],
    onFinish,
    onData,
    onError: (error) => {
      console.debug(
        "[src/contexts/ChatContext/Provider.tsx:ChatProvider]",
        "Chat error:",
        error
      );
    },
    transport: new DefaultChatTransport({
      api: "/api/ai/stream",
      body: { chatId },
    }),
  });

  useEffect(() => {
    const chatContainer = document.getElementById("chatMessages");
    if (
      chatContainer &&
      chat.status !== "streaming" &&
      chat.messages.length > 0
    ) {
      chatContainer.scrollTo({
        top: chatContainer.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [chat.messages, chat.status]);

  useEffect(() => {
    const handleNewChatRequested = () => {
      if (isNewChat) {
        chat.setMessages([]);
        newChatIdRef.current = null;
      }
    };

    window.addEventListener("new-chat-requested", handleNewChatRequested);

    return () => {
      window.removeEventListener("new-chat-requested", handleNewChatRequested);
    };
  }, [isNewChat, chat.setMessages, chat]);

  useEffect(() => {
    if (
      chatId &&
      !isNewChat &&
      chat.status === "ready" &&
      !chatMessagesQuery.isLoading
    ) {
      const acctualChatMessagesJson = JSON.stringify(chat.messages);
      const cachedChatMessagesJson = JSON.stringify(
        chatMessagesQuery.data || []
      );

      if (acctualChatMessagesJson !== cachedChatMessagesJson) {
        console.debug(
          `[src/contexts/ChatContext/Provider.tsx:ChatProvider] Sincronizando mensagens do chat ${chatId} com cache`
        );

        chat.setMessages(chatMessagesQuery.data as UIMessage[]);
      }
    }
  }, [
    chat,
    chatMessagesQuery.data,
    chatMessagesQuery.isLoading,
    chatId,
    isNewChat,
    chat.status,
  ]);

  const contextValue: ChatContextType = {
    messages: chat.messages,
    messagesIsLoading: chatMessagesQuery.isLoading,
    isLoading: chat.status === "streaming" || chat.status === "submitted",
    error: chat.error,

    sendMessage: chat.sendMessage,
    stop: chat.stop,
    setMessages: chat.setMessages,
    status: chat.status,

    chatId,
    isNewChat,
  };

  return (
    <ChatContext.Provider value={contextValue}>{children}</ChatContext.Provider>
  );
}
