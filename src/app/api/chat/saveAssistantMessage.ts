import { StringCompressor } from "@utils/stringCompressor";
import { prisma } from "@lib/prisma/client";
import { FinishReason } from "ai";
import { debug } from "debug";
const log = debug("app:api:chat:save-assistant-message");

export interface CompletionResult {
  text: string;
  reasoning?: string;
  finishReason: FinishReason;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export async function saveAssistantMessage({
  chatId,
  completion,
}: {
  chatId: string;
  completion: CompletionResult;
}) {
  try {
    const [compressedMessage, compressedPrompt] = await Promise.all([
      StringCompressor.compress({
        text: completion.text.trim(),
      }),
      StringCompressor.compress({
        text: completion.reasoning?.trim() || "",
      }),
    ]);

    await prisma.message.create({
      data: {
        content: compressedMessage,
        reasoning: compressedPrompt,
        role: "ASSISTANT",
        chatId,
      },
    });

    log("AI Response saved successfully for chat:", chatId);
  } catch (e) {
    log("Error saving AI Response:", e);
  }
}
