"use client";

import { useChatStateContext } from "@/contexts/ChatContext";
import ChatBalloon from "../ChatBalloon/ChatBalloon";
import { Virtuoso } from "react-virtuoso";
import Accordion from "../Accordion/Accordion";
import { motion } from "motion/react";

export default function ChatMessages() {
  const { isLoadingMessages, messages, error } = useChatStateContext();
  console.log("Renderizei ChatMessages");
  return (
    <main
      className="w-full pt-2 overflow-y-auto overflow-x-hidden"
      id="chatMessages"
      style={{
        height: "calc(100% - 7vh)",
      }}
    >
      {isLoadingMessages && (
        <span className="w-full h-full justify-center items-center">
          <p className="text-3xl text-center">Loading...</p>
        </span>
      )}

      {messages.length > 0 ? (
        <Virtuoso
          data={messages}
          itemContent={(index, message) => (
            <motion.div layout className="mb-2">
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
              <ChatBalloon
                key={`${message.id}_${index}_${message.role}`}
                message={{ content: message.content, role: message.role }}
              />
            </motion.div>
          )}
          components={{
            Footer: () => <div className="h-[160px]" />,
          }}
          style={{ height: "100%" }}
        />
      ) : (
        <p className="text-center text-gray-500">
          No messages yet. Start a conversation!
        </p>
      )}

      {/* Mover a mensagem de erro para dentro da lista virtualizada */}
      {error?.message && (
        <div className="mt-2">
          <ChatBalloon
            message={{ content: error?.message, role: "system" }}
            error={true}
          />
        </div>
      )}
    </main>
  );
}
