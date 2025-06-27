"use client";

import { UseChatHelpers } from "@ai-sdk/react";
import ChatBalloon from "../ChatBalloon/ChatBalloon";
import { Virtuoso } from "react-virtuoso";

interface ChatMessagesProps {
  chat: UseChatHelpers & {
    addToolResult: ({
      toolCallId,
      result,
    }: {
      toolCallId: string;
      result: unknown;
    }) => void;
  };
  getMessagesIsPending: boolean;
}

export default function ChatMessages({
  chat,
  getMessagesIsPending,
}: ChatMessagesProps) {
  console.log("Renderizei ChatMessages");
  return (
    <main
      className="w-full pt-2 overflow-y-auto"
      id="chatMessages"
      style={{
        height: "calc(100% - 7vh)",
      }}
    >
      {getMessagesIsPending && (
        <span className="w-full h-full justify-center items-center">
          <p className="text-3xl text-center">Loading...</p>
        </span>
      )}

      {chat.messages.length > 0 ? (
        <Virtuoso
          data={chat.messages}
          itemContent={(index, message) => (
            <div className="mb-2">
              <ChatBalloon
                key={`${message.id}_${index}_${message.role}`}
                message={{ content: message.content, role: message.role }}
              />
            </div>
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
      {chat.error?.message && (
        <div className="mt-2">
          <ChatBalloon
            message={{ content: chat.error?.message, role: "system" }}
            error={true}
          />
        </div>
      )}
    </main>
  );
}
