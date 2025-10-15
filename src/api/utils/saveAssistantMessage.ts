import { prisma } from "@lib/prisma/client";
import {
  LanguageModelUsage,
  StepResult,
  ToolSet,
  UIDataTypes,
  UIMessagePart,
  UITools,
} from "ai";
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
    const parts: UIMessagePart<UIDataTypes, UITools>[] = [];

    if (event.text) {
      parts.push({ type: "text", text: event.text, state: "done" });
    }

    log("Reasoning parts:", JSON.stringify(event.reasoning));

    if (event.reasoning) parts.push(...event.reasoning);

    if (event.steps?.some((step) => step.toolCalls)) {
      event.steps.forEach((step) => {
        if (step.toolCalls) {
          step.toolCalls.forEach((toolCall) => {
            // log("Estrutura de toolCall:", JSON.stringify(toolCall, null, 2));

            // Transformar o toolCall para o formato esperado por UIMessagePart
            const transformedToolCall = {
              type: toolCall.type as `tool-${string}`,
              toolCallId: toolCall.toolCallId,
              toolName: toolCall.toolName,
              state: "input-streaming" as const,
              input: toolCall.input,
            } as unknown as UIMessagePart<UIDataTypes, UITools>;

            parts.push(transformedToolCall);
          });
        }
      });
    }

    await Promise.all([
      prisma.message.create({
        data: {
          parts: parts as [],
          role: "ASSISTANT",
          chatId,
        },
      }),
      prisma.chat.update({
        where: { id: chatId },
        data: {
          updatedAt: new Date(),
        },
      }),
    ]);

    log("Resposta da IA salva com sucesso para o chat:", chatId);
  } catch (e) {
    log("Erro ao salvar resposta da IA:", e);
  }
}
