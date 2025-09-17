import { Hono } from "hono";
import { authMiddleware } from "../../../middlewares/auth/auth.middleware";
import {
  createModelProvider,
  ModelsType,
} from "@api/utils/createModelProvider";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { getCachedSession } from "@data/auth/getCachedSession";
import { debug } from "debug";
import { createCustomUIMessageStream } from "@api/utils/createCustomUIMessageStream";
import { validateApiKeyWithCache } from "@api/utils/validateApiKeyWithCache";
import { prisma } from "@lib/prisma/client";
import { ConvertMessageOfDatabaseToAiModel } from "@/util/convertMessageOfDbToAiModel";
import { generateChatNameWithAi } from "@/util/generateChatNameWithAi";
import { StringCompressor } from "@/util/stringCompressor";
import { Chat, Message } from "@prisma/client";
import { TextUIPart, ToolUIPart, createUIMessageStreamResponse } from "ai";
const log = debug("app:api:ai:stream");

const bodySchema = z.object({
  messages: z.array(
    z.object({
      parts: z.any(),
      id: z.string(),
      role: z.enum(["user", "assistant", "system"]).nullable(),
    })
  ),
  id: z.string({ error: "Chat ID is required!" }),
  reasoning: z.coerce
    .boolean({
      error: "Reasoning must be a boolean value.",
    })
    .default(false),
  model: z.enum(Object.values(ModelsType)).optional().default(ModelsType.BASIC),
});

export const aiStreamRoute = new Hono()
  .use("/", authMiddleware)
  .post("/", zValidator("json", bodySchema), async (c) => {
    try {
      log("Initiating AI flow...");
      const session = {
        session: c.get("session"),
        user: c.get("user"),
      };
      const {
        id: chatId,
        messages,
        reasoning: reasoningEnabled,
        model: selectedModel,
      } = c.req.valid("json");

      log("Modelo de IA selecionado: ", selectedModel);

      const userMessages = messages.filter((msg) => msg.role === "user");
      const lastUserMessage = userMessages[userMessages.length - 1];

      if (!lastUserMessage) {
        log("❌ No user message found in messages array:", messages);
        return c.json(
          {
            error: "No user message found in request!",
          },
          { status: 400 }
        );
      }

      const promptParts = lastUserMessage.parts as (TextUIPart | ToolUIPart)[];

      const prompt =
        promptParts.find((part) => part.type === "text")?.text || "";

      log("📤 Current prompt extracted from last user message:", {
        messageId: lastUserMessage.id,
        prompt: prompt,
        totalUserMessages: userMessages.length,
        totalMessages: messages.length,
      });

      if (!prompt || prompt.trim() === "") {
        log("Prompt is empty or invalid:", prompt);
        return c.json(
          {
            error: "Prompt cannot be empty!",
          },
          { status: 400 }
        );
      }
      if (!session?.user.id) {
        log("User not authenticated! Session:", session);

        return c.json(
          {
            error: "Unauthorized! (User not authenticaded)",
          },
          { status: 401 }
        );
      }

      const databaseUser = await prisma.user.findUnique({
        where: {
          id: session.user.id,
          email: session.user.email,
        },
        select: {
          id: true,
          apiKey: {
            select: {
              key: true,
            },
          },
        },
      });

      if (!databaseUser) {
        log(`User not found! Session:`, session);
        return c.json(
          {
            error: "User not found!",
          },
          { status: 404 }
        );
      }

      if (!databaseUser.apiKey?.key) {
        log("API Key not found! User:", databaseUser);
        return c.json(
          {
            error: "Unauthorized! (User API Key not found)",
          },
          { status: 401 }
        );
      }

      const isValidApiKey = await validateApiKeyWithCache({
        apiKey: databaseUser.apiKey.key,
      });

      if (!isValidApiKey) {
        log("API Key is not valid! API Key:", databaseUser.apiKey.key);
        return c.json(
          {
            error: "Unauthorized! (Invalid API Key)",
          },
          { status: 401 }
        );
      }

      const model = createModelProvider({
        apiKey: databaseUser.apiKey.key,
        modelType: selectedModel,
        reasoning: reasoningEnabled,
      });

      let chat: Chat & { messages: Message[] };
      const isExistingChat =
        chatId !== "new" && chatId !== "null" && chatId !== "undefined";

      const compressedPrompt = await StringCompressor.compress({
        text: prompt.trim(),
      });

      if (isExistingChat) {
        log("Processing existing chat with ID:", chatId);

        const chatExists = await prisma.chat.findFirst({
          where: {
            id: chatId,
            ownerId: databaseUser.id,
          },
          include: {
            messages: {
              orderBy: { createdAt: "asc" },
              take: 50,
            },
          },
        });

        if (!chatExists) {
          log(
            "Chat not found or access denied! Chat ID:",
            chatId,
            "Owner Id:",
            databaseUser.id
          );

          return c.json(
            {
              error: "Chat not found or access denied!",
            },
            { status: 404 }
          );
        }

        const newMessage = await prisma.message.create({
          data: {
            content: compressedPrompt,
            role: "USER",
            chatId,
            senderId: databaseUser.id,
          },
        });

        chat = chatExists;
        chat.messages.push(newMessage);
      } else {
        log(`Creating new chat (chatId:"${chatId}")`);

        const chatNameModel = createModelProvider({
          apiKey: databaseUser.apiKey.key,
          modelType: ModelsType.LITE,
        });

        const newChatName = await generateChatNameWithAi({
          userPrompt: prompt,
          model: chatNameModel,
        }).catch((e) => {
          log("Error on generate chat name with AI! Error:", e);
          return "Chat sem nome.";
        });

        chat = await prisma.chat.create({
          data: {
            name: newChatName,
            ownerId: databaseUser.id,
            messages: {
              create: {
                content: compressedPrompt,
                role: "USER",
                senderId: databaseUser.id,
              },
            },
          },
          include: {
            messages: {
              orderBy: {
                createdAt: "asc",
              },
            },
          },
        });

        log("New chat created with ID:", chat.id);
      }

      const aiMessages = await ConvertMessageOfDatabaseToAiModel(chat.messages);
      log(
        `Chat ${chatId} messages converted to AI model:`,
        JSON.stringify(aiMessages, null, 2)
      );
      const stream = createCustomUIMessageStream({
        chatId: chat.id,
        messages: aiMessages,
        model,
        redirect: !isExistingChat,
      });

      return createUIMessageStreamResponse({
        stream,
        headers: {
          "X-Chat-Id": chat.id,
          "X-Chat-Name": encodeURIComponent(chat.name),
          "X-Redirect": isExistingChat ? "false" : "true",
        },
      });
    } catch (error) {
      log("Error in POST /api/chat:", error);
      log("Chat creation flow aborted");

      if (error instanceof Error) {
        const statusCode = error.message.toLowerCase().includes("not found")
          ? 404
          : 500;
        return c.json({ error: error.message }, { status: statusCode });
      }

      return c.json({ error: "Internal Server Error" }, { status: 500 });
    }
  });
