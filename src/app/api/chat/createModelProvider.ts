import "server-only";

import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { debug } from "debug";
const log = debug("app:api:chat:create-model-provider");

export enum ModelsType {
  HIGH = "HIGH",
  BASIC = "BASIC",
  LITE = "LITE",
}

export function createModelProvider({
  apiKey,
  modelType,
  reasoning,
}: {
  apiKey: string;
  modelType?: ModelsType;
  reasoning?: boolean;
}) {
  const provider = createOpenRouter({
    apiKey: apiKey,
  });

  const modelName =
    modelType === ModelsType.HIGH
      ? "deepseek/deepseek-r1-0528:free"
      : modelType === ModelsType.LITE
        ? "qwen/qwen3-coder:free"
        : "deepseek/deepseek-chat-v3-0324:free";

  log("AI model name:", modelName);
  log("Reasoning is activated?", reasoning && modelType !== ModelsType.LITE);
  return provider(modelName, {
    reasoning:
      reasoning && modelType !== ModelsType.LITE
        ? {
            effort: "high",
          }
        : undefined,
  });
}
