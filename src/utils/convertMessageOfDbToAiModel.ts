import { UIMessage } from "ai";
import { Message, MessageRole, User } from "@prisma/client";
import { StringCompressor } from "@utils/stringCompressor";

type MessageWithSender = Message & { sender?: User | null };

function convertRoleToUIFormat(
  role: MessageRole,
): "user" | "assistant" | "system" {
  switch (role) {
    case MessageRole.USER:
      return "user";
    case MessageRole.ASSISTANT:
      return "assistant";
    case MessageRole.SYSTEM:
      return "system";
    case MessageRole.TOOL:
      return "assistant";
    default:
      return "user";
  }
}

export async function ConvertMessageOfDatabaseToAiModel(
  messages: MessageWithSender[],
): Promise<UIMessage[]> {
  const sorted = [...messages].sort(
    (a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
  );
  const uiMessages: UIMessage[] = [];

  for (const msg of sorted) {
    const [contentText, reasoningText] = await Promise.all([
      StringCompressor.decompress({
        compressedText: msg.content,
      }),
      StringCompressor.decompress({
        compressedText: msg.reasoning || "",
      }),
    ]);

    const parts: UIMessage["parts"] = [{ type: "text", text: contentText }];

    if (msg.reasoning) {
      parts.push({
        type: "reasoning",
        reasoning: reasoningText,
        details: [{ type: "text", text: msg.reasoning }],
      });
    }

    uiMessages.push({
      id: msg.id,
      role: convertRoleToUIFormat(msg.role),
      content: contentText,
      parts,
      createdAt: msg.createdAt,
    });
  }

  return uiMessages;
}
