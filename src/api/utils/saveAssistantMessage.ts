import { StringCompressor } from "@/util/stringCompressor";
import { prisma } from "@lib/prisma/client";
import { LanguageModelUsage, StepResult, ToolSet } from "ai";
import { debug } from "debug";
const log = debug("app:api:chat:save-assistant-message");

export type EventResultType = StepResult<ToolSet> & {
  readonly steps: StepResult<ToolSet>[];
  readonly totalUsage: LanguageModelUsage;
};

export async function saveAssistantMessage({
  chatId,
  event,
}: {
  chatId: string;
  event: EventResultType;
}) {
  try {
    const [compressedMessage, compressedReasoning] = await Promise.all([
      StringCompressor.compress({
        text: event.text.trim(),
      }),
      StringCompressor.compress({
        text: event.reasoningText?.trim() || "",
      }),
    ]);

    await prisma.message.create({
      data: {
        content: compressedMessage,
        reasoning: compressedReasoning,
        role: "ASSISTANT",
        chatId,
      },
    });

    log("AI Response saved successfully for chat:", chatId);
  } catch (e) {
    log("Error saving AI Response:", e);
  }
}
