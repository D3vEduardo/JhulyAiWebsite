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
            (oldData: UIMessage[] = []) => [...oldData, message]
          );

          window.dispatchEvent(
            new CustomEvent("chat-created", {
              detail: { chatId: finalChatId },
            })
          );
        }
        return;
      }

      queryClient.setQueryData(
        ["chat", `chat_${chatId}`],
        (oldData: UIMessage[] = []) => [...oldData, message]
      );
    },
    [chatId, isNewChat, queryClient]
  );

  const onData = useCallback(
    async (message: { type: `data-${string}`; data: unknown }) => {
      if (message.type === "data-chat-created") {
        const data = message.data as { chatId?: string; redirect?: boolean };

        if (data.chatId) {
          newChatIdRef.current = data.chatId;
          console.log("Novo chatId salvo:", data.chatId);
        }
      }
    },
    []
  );

  const chat = useChat({
    id: chatId || "new",
    messages: isNewChat ? [] : chatMessagesQuery.data || [],
    onFinish,
    onData,
    onError: (error) => {
      console.error("Chat error:", error);
    },
    transport: new DefaultChatTransport({
      api: "/api/chat",
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

  const contextValue: ChatContextType = {
    messages: chat.messages,
    messagesIsLoading: chatMessagesQuery.isLoading,
    isLoading: chat.status === "streaming" || chat.status === "submitted",
    error: chat.error,

    sendMessage: function (param) {
      if (newChatIdRef.current && isNewChat) {
        queryClient.setQueryData(
          ["chat", `chat_${newChatIdRef.current}`],
          (oldData: UIMessage[] = []) => [...oldData, param]
        );
      }
      return chat.sendMessage(param);
    },
    //chat.sendMessage,
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
