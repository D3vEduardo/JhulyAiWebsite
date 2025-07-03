import { Message } from "ai";
import { Message as PrismaMessage } from "@prisma/client";

export function ConvertMessageOfDatabaseToAiModel(messages: PrismaMessage[]) {
  const formatedMessages = [];

  for (const message of messages) {
    const formatedMessage: Message = {
      role: message.role as "system" | "user" | "assistant" | "data",
      content: message.content,
      id: message.id,
      reasoning: message.reasoning || undefined,
    };

    formatedMessages.push(formatedMessage);
  }

  return formatedMessages;
}
