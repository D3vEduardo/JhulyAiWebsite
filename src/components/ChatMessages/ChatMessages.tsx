"use client";

import { useChatStateContext } from "@/contexts/ChatContext";
import ChatBalloon, { MemoChatBalloon } from "../ChatBalloon/ChatBalloon";
import Accordion from "../Accordion/Accordion";
import { motion } from "motion/react";
import LoadingSpritesAnimation from "@components/Loading/LoadingSpritesAnimation";

export default function ChatMessages() {
  const { isLoadingMessages, messages, error, status } = useChatStateContext();
  console.log("Renderizei ChatMessages");
  return (
    <main
      className="w-full h-[calc(100%-7vh)] pt-2 overflow-y-auto overflow-x-hidden pb-[160px]"
      id="chatMessages"
    >
      {messages.length > 0 && !isLoadingMessages
        ? messages.map((message, index) => (
            <motion.div
              layout={
                status === "streaming" && index === messages.length - 1
                  ? false
                  : "position"
              }
              className="mb-2 h-auto w-full overflow-y-hidden"
              key={`${message.id}_${index}_${message.role}`}
            >
              {message.parts?.find((part) => part.type === "reasoning")
                ?.reasoning && (
                <div className="mb-2 w-full ml-auto mr-auto">
                  <Accordion
                    title="Reasoning"
                    content={
                      message.parts.find((part) => part.type === "reasoning")
                        ?.reasoning
                    }
                  />
                </div>
              )}
              <MemoChatBalloon
                message={{
                  content: message.content,
                  role: message.role,
                  id: message.id,
                }}
              />
            </motion.div>
          ))
        : !isLoadingMessages && (
            <p className="text-center text-gray-500">
              No messages yet. Start a conversation!
            </p>
          )}
      {status === "submitted" && (
        <div className="flex items-center text-center justify-start w-full">
          <LoadingSpritesAnimation size={35} />
          <span>
            <p className="mt-2 text-xl shine-text">Estou pensando...</p>
          </span>
        </div>
      )}
      {error?.message && (
        <div className="mt-2">
          <ChatBalloon
            message={{ content: error?.message, role: "system", id: "error" }}
            error={true}
          />
        </div>
      )}
    </main>
  );
}
