import { Message } from "ai";
import { Message as PrismaMessage } from "@prisma/client";

export function ConvertMessageOfDatabaseToAiModel(messages: PrismaMessage[]) {
  const organizedMessages = messages.sort(
    (a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
  );
  const formatedMessages = [];

  for (const message of organizedMessages) {
    const formatedMessage: Message = {
      role: message.role as "system" | "user" | "assistant" | "data",
      content: message.content,
      id: message.id,
      reasoning: message.reasoning || undefined,
      createdAt: message.createdAt,
    };

    formatedMessages.push(formatedMessage);
  }

  return formatedMessages;
}
