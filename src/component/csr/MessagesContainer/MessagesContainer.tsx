"use client";

import { useAside } from "@/store/asideMenu";
import { motion } from "motion/react";
import ChatMessages from "../ChatMessages/ChatMessages";
import { useEffect, useState } from "react";
import PromptForm from "../PromptForm/PromptForm";
import { useChat } from "@ai-sdk/react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getChatMessages } from "./getChatMessages";
import { ConvertMessageOfDatabaseToAiModel } from "@utils/convertMessageOfDbToAiModel";

export default function MessageContainer() {
console.log("Renderizei MessagesContainer");
  const searchParams = useSearchParams();
  const selectedChatId = searchParams.get("chatId");
  console.log(selectedChatId);
  const chat = useChat();

  useEffect(() => {
    if (!selectedChatId) chat.setMessages([]);
  }, [selectedChatId, chat]);

  useQuery({
    queryKey: ["chat", `chat_${selectedChatId}`],
    queryFn: async () => {
      if (!selectedChatId) return [];
      const chatMessages = await getChatMessages(selectedChatId);
      chat.setMessages(ConvertMessageOfDatabaseToAiModel(chatMessages));
      return chatMessages;
    },
    enabled: !!selectedChatId,
  });

  const { asideIsOpen } = useAside();
  const [innerWidth, setInnerWidth] = useState<number>(0);

  useEffect(() => {
    setInnerWidth(window.innerWidth);
    window.addEventListener("resize", () => {
      setInnerWidth(window.innerWidth);
    });
  }, []);

  return (
    <motion.div
      animate={{
        marginLeft: asideIsOpen && innerWidth > 768 ? "17.5rem" : "0",
        width:
          asideIsOpen && innerWidth > 768 ? `${innerWidth - 280}px` : "100%",
      }}
      transition={{
        duration: 0.5,
        type: "spring",
      }}
      className="w-screen relative max-h-dvh overflow-hidden"
    >
      <ChatMessages messages={chat.messages} />
      <PromptForm
        handleSubmit={chat.handleSubmit}
        handleInputChange={chat.handleInputChange}
        input={chat.input}
      />
    </motion.div>
  );
}
