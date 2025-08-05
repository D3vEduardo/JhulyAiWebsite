import { useChatMessages } from "@/hooks/useChatMessages";
import { useChat, Message } from "@ai-sdk/react"; // Importar Message do ai-sdk/react, não do react-hook-form
import { useQueryClient } from "@tanstack/react-query";
import { usePathname, useRouter } from "next/navigation"; // Usar ambos do next/navigation
import {
  ReactNode,
  useRef,
  useState,
  useCallback,
  useEffect,
  useMemo,
} from "react";
import {
  ChatStateContext,
  ChatActionsContext,
  ChatInputContext,
} from "./Context";
import { getMoreRecentMessages } from "./getMoreRecentMessages";

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

  const chatMessagesQuery = useChatMessages();

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
    [isNewChat, queryClient]
  );

  // Corrigir a assinatura do onFinish para AI SDK v4
  const onFinish = useCallback(
    (
      message: Message,
      options?: {
        usage?: any;
        finishReason?: string;
      }
    ) => {
      const finalChatId = isNewChat ? newChatIdRef.current : chatId;
      console.log("Final chatId onFinish:", finalChatId);
      if (!finalChatId) {
        alert("Final chat não existe!");
        return;
      }

      queryClient.setQueryData(["chat", `chat_${chatId}`], () => [
        ...(chatMessagesQuery.data ?? []),
        message,
      ]);

      setNavigateToChatId(finalChatId);
    },
    [isNewChat, chatId, queryClient, chatMessagesQuery.data]
  );

  const chat = useChat({
    onFinish,
    onResponse,
    onError(error) {
      console.error("Chat error:", error);
    },
    initialMessages: isNewChat ? [] : (chatMessagesQuery.data ?? []),
    body: {
      chatId,
    },
  });

  useEffect(() => {
    const chatMessagesContainer = document.getElementById("chatMessages");

    if (chatMessagesContainer) {
      const { scrollTop, scrollHeight, clientHeight } = chatMessagesContainer;

      const isNearBottom = scrollTop + clientHeight >= scrollHeight - 100;

      console.log("Scroll info:", {
        scrollTop,
        scrollHeight,
        clientHeight,
        isNearBottom,
        distanceFromBottom: scrollHeight - (scrollTop + clientHeight),
      });

      // Só faz scroll se estiver próximo do final
      if (isNearBottom) {
        chatMessagesContainer.scrollTo({
          top: scrollHeight,
          behavior: "smooth",
        });
      }
    }
  }, [chatId, chat.status, chat.messages, chatMessagesQuery]);

  useEffect(() => {
    if (navigateToChatId) {
      // Remover a opção scroll que não existe no Next.js 13+
      router.push(`/chat/${navigateToChatId}`);
      setNavigateToChatId(null);
    }
  }, [navigateToChatId, router]);

  const chatIsReady =
    chat.status !== "streaming" && chat.status !== "submitted";

  useEffect(() => {
    if (!isNewChat && chatIsReady && chatMessagesQuery.data && chatId) {
      const cachedMessages = queryClient.getQueryData<Message[]>([
        "chat",
        `chat_${chatId}`,
      ]);

      if (cachedMessages && cachedMessages.length > 0) {
        // Verificar se as mensagens têm a propriedade 'id' antes de tentar acessá-la
        const currentMessagesIds = chat.messages
          .filter(
            (m) =>
              m &&
              typeof m === "object" &&
              "id" in m &&
              typeof m.id === "string"
          )
          .map((m) => (m as any).id)
          .sort();

        const cachedMessagesIds = cachedMessages
          .filter(
            (m) =>
              m &&
              typeof m === "object" &&
              "id" in m &&
              typeof m.id === "string"
          )
          .map((m) => (m as any).id)
          .sort();

        const messagesDifferent =
          JSON.stringify(currentMessagesIds) !==
          JSON.stringify(cachedMessagesIds);

        if (messagesDifferent) {
          console.log(
            "Detectadas diferenças nas mensagens para chatId:",
            chatId
          );

          // Usar a função para determinar qual conjunto é mais atual
          const moreRecentMessages = getMoreRecentMessages({
            messages1: chat.messages,
            messages2: cachedMessages,
          });

          // Verificar se as mensagens em cache são mais atuais usando referência de array
          if (
            JSON.stringify(moreRecentMessages) ===
            JSON.stringify(cachedMessages)
          ) {
            console.log(
              "Sincronizando mensagens do cache para chatId:",
              chatId
            );
            chat.setMessages(cachedMessages);
          } else {
            console.log(
              "Mensagens do chat atual são mais recentes, mantendo estado atual"
            );
            // Opcional: atualizar o cache com as mensagens mais recentes
            queryClient.setQueryData(["chat", `chat_${chatId}`], chat.messages);
          }
        }
      }
    }
  }, [
    chat,
    chatId,
    isNewChat,
    chatIsReady,
    chatMessagesQuery.data,
    chat.messages.length,
    queryClient,
  ]);

  useEffect(() => {
    if (isNewChat && chat.messages.length > 0) {
      console.log("Limpando mensagens para novo chat");
      chat.setMessages([]);
    }
  }, [isNewChat, chat.setMessages, chat]);

  const chatState = useMemo(
    () => ({
      chatId,
      isNewChat,
      isLoadingMessages: chatMessagesQuery.isLoading,
      messages: chat.messages,
      status: chat.status,
      error: chat.error,
    }),
    [
      chatId,
      isNewChat,
      chatMessagesQuery.isLoading,
      chat.messages,
      chat.status,
      chat.error,
    ]
  );

  const chatActions = useMemo(
    () => ({
      handleSubmit: chat.handleSubmit,
      stop: chat.stop,
      addToolResult: chat.addToolResult,
      setMessages: chat.setMessages,
    }),
    [chat.handleSubmit, chat.stop, chat.addToolResult, chat.setMessages]
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
