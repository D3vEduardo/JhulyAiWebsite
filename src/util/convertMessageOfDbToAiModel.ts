import type { Message } from "@prisma/client";
import type { UIMessage, UIMessagePart, UIDataTypes, UITools } from "ai";

// Função para converter mensagens do banco para o modelo da UI
export function convertMessageOfDbToAiModel(
  dbMessages: Message[]
): UIMessage<unknown, UIDataTypes, UITools>[] {
  return dbMessages.map((m) => ({
    id: m.id,
    role: m.role.toLowerCase() as UIMessage["role"],
    createdAt: m.createdAt,
    updatedAt: m.updatedAt,
    parts: m.parts as unknown as UIMessagePart<UIDataTypes, UITools>[],
  }));
}
