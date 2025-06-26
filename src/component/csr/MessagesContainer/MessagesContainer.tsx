"use client";

import { useAside } from "@/store/asideMenu";
import { motion } from "motion/react";
import ChatMessages from "../ChatMessages/ChatMessages";
import { useEffect, useState } from "react";
import PromptForm from "../PromptForm/PromptForm";
import { useChat } from "@ai-sdk/react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getChatMessages } from "./getChatMessages";
import { ConvertMessageOfDatabaseToAiModel } from "@utils/convertMessageOfDbToAiModel";
import ChatNavBar from "../ChatNavbar";

export default function MessageContainer() {
  console.log("Renderizei MessagesContainer");
  const { chatId: selectedChatId } = useParams();
  const router = useRouter();
  console.log("DEBUG - Current chatId:", selectedChatId);
  const queryClient = useQueryClient();

  const chatMessagesQuery = useQuery({
    queryKey: ["chat", `chat_${selectedChatId}`],
    queryFn: async () => {
      if (!selectedChatId || typeof selectedChatId !== "string") return [];
      const messages = await getChatMessages(selectedChatId);
      return ConvertMessageOfDatabaseToAiModel(messages);
    },
    enabled: selectedChatId != "new",
    staleTime: Infinity, // Evita refetches que podem atrapalhar o streaming
  });

  const chat = useChat({
    initialMessages: chatMessagesQuery.data,
    body: {
      chatId: selectedChatId,
    },
    onResponse(res) {
      const chatIdFromHeader = res.headers.get("X-Chat-Id");
      if (!selectedChatId && selectedChatId == "new" && chatIdFromHeader) {
        router.replace(`/chat/${chatIdFromHeader}`, { scroll: false });
      }
    },
    onFinish() {
      if (selectedChatId != "new") {
        queryClient.invalidateQueries({ queryKey: ["chat", selectedChatId] });
      } else queryClient.invalidateQueries({ queryKey: ["chats"] });
    },
  });

  useEffect(() => {
    if (!selectedChatId || selectedChatId != "new") {
      chat.setMessages([]);
    }
  }, [selectedChatId, chat.setMessages, chat]);

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
