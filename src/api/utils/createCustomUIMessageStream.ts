import {
  convertToModelMessages,
  createUIMessageStream,
  LanguageModel,
  streamText,
  UIMessage,
} from "ai";
import "server-only";
import { saveAssistantMessage } from "@api/utils/saveAssistantMessage";
import { debug } from "debug";
import { getSystemPrompt } from "@api/utils/system-prompt";
const log = debug("app:api:chat:createCustomUIMessageStream");

type ParamsType = {
  chatId: string;
  redirect: boolean;
  model: LanguageModel;
  messages: UIMessage[];
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
        data: { chatId, redirect, messages },
      });

      const llmStream = streamText({
        model,
        messages: convertToModelMessages(messages),
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
