"use client";

import ChatNavBar from "../ChatNavbar";
import { Message } from "@ai-sdk/react";

interface ChatMessagesProps {
  messages: Message[];
}

export default function ChatMessages({ messages }: ChatMessagesProps) {
console.log("Renderizei ChatMessages");
  return (
    <main className="w-full h-screen p-2">
      <ChatNavBar />
      <section>
        {messages.length > 0 ? (
          messages.map((message, index) => (
            <div key={index} className="my-2">
              {message.role === 'user' ? 'You: ' : 'Assistant: '}
              {message.content}
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500">No messages yet. Start a conversation!</p>
        )}
      </section>
    </main>
  );
}
