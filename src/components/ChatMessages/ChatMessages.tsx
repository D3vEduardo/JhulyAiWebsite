"use client";
import { useChatContext } from "@/contexts/ChatContext/Hooks";
import ChatBalloon, { MemoChatBalloon } from "../ChatBalloon/ChatBalloon";
import Accordion from "../Accordion/Accordion";
import { motion } from "motion/react";
import LoadingSpritesAnimation from "@components/Loading/LoadingSpritesAnimation";
import { useIsClient } from "@/hooks/useIsClient";
import PromptSuggestions from "./PromptSuggestions";

export default function ChatMessages() {
  const { status, messages, messagesIsLoading, error, isNewChat } =
    useChatContext();
  const isClient = useIsClient();

  if (!isClient) {
    return (
      <motion.main
        className="w-full flex-1 min-h-0 overflow-y-auto overflow-x-hidden pb-[175px] pt-2"
        id="chatMessages"
      />
    );
  }

  console.debug(
    "[src/components/ChatMessages/ChatMessages.tsx:ChatMessages]",
    "Renderizei ChatMessages"
  );
  console.debug(
    "[src/components/ChatMessages/ChatMessages.tsx:ChatMessages]",
    `Received messagens on ChatMessages component:`,
    messages
  );

  return (
    <motion.main
      className="flex w-full flex-1 flex-col min-h-0 overflow-x-hidden overflow-y-auto pb-[175px] pt-2"
      id="chatMessages"
    >
      {messages.length > 0 && !messagesIsLoading
        ? messages.map((message, messageIndex) => (
            <div
              className="mb-2 w-full flex-shrink-0"
              key={`${message.id}_${messageIndex}_${message.role}`}
            >
              {message.parts?.find((part) => part.type === "reasoning")
                ?.text && (
                <div className="mb-2 w-full">
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
            </div>
          ))
        : !messagesIsLoading && isNewChat && <PromptSuggestions />}

      {status === "submitted" && (
        <div className="flex items-center text-center justify-start w-full gap-2">
          <LoadingSpritesAnimation size={35} />
          <span>
            <p className="mt-2 text-xl shine-text">Estou pensando...</p>
          </span>
        </div>
      )}

      {error?.message && (
        <div className="mt-2 w-full flex-shrink-0">
          <ChatBalloon
            message={{ content: error?.message, role: "system", id: "error" }}
            error={true}
          />
        </div>
      )}
    </motion.main>
  );
}
