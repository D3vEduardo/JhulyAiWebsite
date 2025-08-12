"use client";

import { useChatContext } from "@/contexts/ChatContext/Hooks";
import ChatBalloon, { MemoChatBalloon } from "../ChatBalloon/ChatBalloon";
import Accordion from "../Accordion/Accordion";
import { motion } from "motion/react";
import LoadingSpritesAnimation from "@components/Loading/LoadingSpritesAnimation";
import { useIsClient } from "@/hooks/useIsClient";

export default function ChatMessages() {
  const { status, messages, messagesIsLoading, error } = useChatContext();
  const isClient = useIsClient();

  if (!isClient) {
    return (
      <main
        className="w-full h-[calc(100%-7vh)] pt-2 overflow-y-auto overflow-x-hidden pb-[175px]"
        id="chatMessages"
      />
    );
  }

  console.log("Renderizei ChatMessages");
  console.log(`Received messagens on ChatMessages component:`, messages);
  return (
    <main
      className="w-full h-[calc(100%-7vh)] pt-2 overflow-y-auto overflow-x-hidden pb-[175px]"
      id="chatMessages"
    >
      {messages.length > 0 && !messagesIsLoading
        ? messages.map((message, messageIndex) => (
            <motion.div
              layout={
                status === "streaming" && messageIndex === messages.length - 1
                  ? false
                  : "position"
              }
              className="mb-2 h-auto w-full overflow-y-hidden"
              key={`${message.id}_${messageIndex}_${message.role}`}
            >
              {message.parts?.find((part) => part.type === "reasoning")
                ?.text && (
                <div className="mb-2 w-full ml-auto mr-auto">
                  <Accordion
                    title="Reasoning"
                    content={
                      message.parts.find((part) => part.type === "reasoning")
                        ?.text
                    }
                  />
                </div>
              )}

              {messageIndex === messages.length - 1 &&
              status === "streaming" ? (
                <ChatBalloon
                  message={{
                    content:
                      message.parts.find((part) => part.type === "text")
                        ?.text || "",
                    role: message.role,
                    id: message.id,
                  }}
                />
              ) : (
                <MemoChatBalloon
                  message={{
                    content:
                      message.parts.find((part) => part.type === "text")
                        ?.text || "",
                    role: message.role,
                    id: message.id,
                  }}
                />
              )}
            </motion.div>
          ))
        : !messagesIsLoading && (
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
