"use client";

import { useAside } from "@store/asideMenu";
import { motion } from "motion/react";
import ChatMessages from "../ChatMessages/ChatMessages";
import { useEffect, useRef } from "react";
import PromptForm from "../PromptForm/PromptForm";
import { useChat } from "@ai-sdk/react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import ChatNavBar from "../ChatNavbar";
import { useWindowResize } from "@hooks/useWindowSize";
import { useChatState } from "@hooks/useChatState";
import { useChatMessages } from "@hooks/useChatMessages";

export default function MessageContainer() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { asideIsOpen } = useAside();

  const { chatId, isNewChat } = useChatState();
  const chatMessagesQuery = useChatMessages(chatId);
  const innerWidth = useWindowResize();

  const newChatIdFromChatHeader = useRef<string>("new");

  const chat = useChat({
    api: "/api/chat",
    initialMessages: chatMessagesQuery.data || [],
    onResponse(response) {
      const newChatId = response.headers.get("X-Chat-Id");
      if (isNewChat && newChatId) {
        newChatIdFromChatHeader.current = newChatId;
        queryClient.invalidateQueries({
          queryKey: ["chats"],
        });
      }
    },
    onFinish() {
      if (newChatIdFromChatHeader.current != "new" && chatId === "new") {
        queryClient.invalidateQueries({
          queryKey: ["chat", `chat_${chatId}`],
        });
      } else if (chatId != "new") {
        queryClient.invalidateQueries({
          queryKey: ["chat", `chat_${chatId}`],
        });
      }
    },
  });

  useEffect(() => {
    if (
      isNewChat &&
      newChatIdFromChatHeader.current &&
      newChatIdFromChatHeader.current !== "new"
    ) {
      router.push(`/chat/${newChatIdFromChatHeader.current}`, {
        scroll: false,
      });
    }
  }, [isNewChat, chat.status, router]);

  useEffect(() => {
    if (isNewChat && chat.status !== "streaming") {
      chat.setMessages([]);
    }
  }, [isNewChat, chat]);

  // Calcular layout responsivo
  const shouldShowSidebar = asideIsOpen && innerWidth > 768;
  const containerStyle = {
    marginLeft: shouldShowSidebar ? "17.5rem" : "0",
    width: shouldShowSidebar ? `${innerWidth - 280}px` : "100%",
  };

  return (
    <motion.div
      animate={containerStyle}
      transition={{
        duration: 0.5,
        type: "spring",
      }}
      className="w-screen h-screen relative max-h-dvh overflow-hidden px-[2%] pt-2"
    >
      <ChatNavBar />
      <ChatMessages
        chat={chat}
        getMessagesIsPending={chatMessagesQuery.isLoading}
      />
      <PromptForm chat={chat} />
    </motion.div>
  );
}
