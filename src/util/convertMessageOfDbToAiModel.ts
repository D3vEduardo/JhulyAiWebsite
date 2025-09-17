import { UIMessage } from "ai";
import { Message, MessageRole, User } from "@prisma/client";
import { StringCompressor } from "@/util/stringCompressor";

type MessageWithSender = Message & { sender?: User | null };

const roleMap: Record<MessageRole, UIMessage["role"]> = {
  [MessageRole.USER]: "user",
  [MessageRole.ASSISTANT]: "assistant",
  [MessageRole.SYSTEM]: "system",
  [MessageRole.TOOL]: "assistant",
};

export async function ConvertMessageOfDatabaseToAiModel(
  messages: MessageWithSender[]
): Promise<UIMessage[]> {
  const sorted = [...messages].sort(
    (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
  );

  return Promise.all(
    sorted.map(async (msg) => {
      const [text, reasoningText] = await Promise.all([
        StringCompressor.decompress({ compressedText: msg.content }),
        StringCompressor.decompress({ compressedText: msg.reasoning || "" }),
      ]);

      const parts: UIMessage["parts"] = [{ type: "text", text }];

      if (msg.reasoning) {
        parts.push({ type: "reasoning", text: reasoningText });
      }

      return {
        id: String(msg.id),
        role: roleMap[msg.role],
        parts,
      };
    })
  );
}
