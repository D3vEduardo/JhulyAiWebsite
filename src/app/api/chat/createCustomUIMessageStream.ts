import {
  createUIMessageStream,
  LanguageModel,
  ModelMessage,
  streamText,
} from "ai";
import "server-only";
import { saveAssistantMessage } from "./saveAssistantMessage";
import { debug } from "debug";
import { getSystemPrompt } from "./system-prompt";
const log = debug("app:api:chat:createCustomUIMessageStream");

type ParamsType = {
  chatId: string;
  redirect: boolean;
  model: LanguageModel;
  messages: ModelMessage[];
};

export function createCustomUIMessageStream({
  chatId,
  redirect,
  model,
  messages,
}: ParamsType) {
  const stream = createUIMessageStream.bind(null, {
    execute: async ({ writer }) => {
      writer.write({
        type: "data-chat-created",
        data: { chatId, redirect },
      });

      const llmStream = streamText({
        model,
        messages,
        system: getSystemPrompt("pt-BR"),
        async onFinish(event) {
          log("AI response received:", event.text);
          setImmediate(() => {
            saveAssistantMessage({
              chatId,
              event,
            });
          });
        },
      });

      writer.merge(llmStream.toUIMessageStream());
    },
  });

  return stream();
}
