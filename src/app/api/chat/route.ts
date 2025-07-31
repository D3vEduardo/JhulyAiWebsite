import { NextRequest, NextResponse } from "next/server";
import { debug } from "debug";
import { headers } from "next/headers";
import z from "zod";
import { prisma } from "@lib/prisma/client";
import { validateApiKeyWithCache } from "./validateApiKeyWithCache";
import { createModelProvider, ModelsType } from "./createModelProvider";
import { Chat, Message } from "@prisma/client";
import { generateChatNameWithAi } from "@utils/generateChatNameWithAi";
import { ConvertMessageOfDatabaseToAiModel } from "@utils/convertMessageOfDbToAiModel";
import { convertToCoreMessages, streamText } from "ai";
import { getSystemPrompt } from "./system-prompt";
import { CompletionResult, saveAssistantMessage } from "./saveAssistantMessage";
import { StringCompressor } from "@utils/stringCompressor";
import { getCachedSession } from "@data/auth/getCachedSession";
const log = debug("app:api:chat");

const messageSchema = z.object({
  role: z.enum(["user", "assistant", "system", "tool"]),
  content: z.string(),
  tool_calls: z
    .array(
      z.object({
        id: z.string(),
        type: z.string(),
        function: z.object({
          name: z.string(),
          arguments: z.string(),
        }),
      }),
    )
    .optional(),
});

const bodySchema = z.object({
  messages: z.array(messageSchema),
  chatId: z.string({ error: "Chat ID is required!" }),
  reasoning: z.coerce
    .boolean({
      error: "Reasoning must be a boolean value.",
    })
    .default(false),
  model: z.enum(Object.values(ModelsType)).optional().default(ModelsType.BASIC),
});

export async function POST(req: NextRequest) {
  try {
    log("Initiating AI flow...");
    const [session, body] = await Promise.all([
      getCachedSession(await headers()),
      await req.json(),
    ]);

    const bodyParseResult = bodySchema.safeParse(body);

    log("Received body:", body);

    if (!bodyParseResult.success) {
      log("Invalid request body:", body);
      return NextResponse.json(
        {
          error: bodyParseResult.error.message,
        },
        { status: 400 },
      );
    }

    const {
      chatId,
      messages,
      reasoning: reasoningEnabled,
      model: selectedModel,
    } = bodyParseResult.data;

    const lastMessage = messages[messages.length - 1];
    if (lastMessage.role !== "user") {
      return NextResponse.json(
        {
          error: "Last message must be from user!",
        },
        { status: 400 },
      );
    }

    const prompt = lastMessage.content.trim();

    if (!session?.user.id) {
      log("User not authenticated! Session:", session);

      return NextResponse.json(
        {
          error: "Unauthorized! (User not authenticaded)",
        },
        { status: 401 },
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
      return NextResponse.json(
        {
          error: "User not found!",
        },
        { status: 404 },
      );
    }

    if (!databaseUser.apiKey?.key) {
      log("API Key not found! User:", databaseUser);
      return NextResponse.json(
        {
          error: "Unauthorized! (User API Key not found)",
        },
        { status: 401 },
      );
    }

    const isValidApiKey = await validateApiKeyWithCache({
      apiKey: databaseUser.apiKey.key,
    });

    if (!isValidApiKey) {
      log("API Key is not valid! API Key:", databaseUser.apiKey.key);
      return NextResponse.json(
        {
          error: "Unauthorized! (Invalid API Key)",
        },
        { status: 401 },
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
          databaseUser.id,
        );

        return NextResponse.json(
          {
            error: "Chat not found or access denied!",
          },
          { status: 404 },
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
    log(`Chat ${chatId} messages converted to AI model:`, aiMessages);
    const result = streamText({
      model,
      messages: convertToCoreMessages(aiMessages),
      system: getSystemPrompt("pt-BR"),
      onFinish: async (completion: CompletionResult) => {
        log("AI response received:", completion.text);

        setImmediate(() => {
          saveAssistantMessage({
            chatId: chat.id,
            completion,
          });
        });
      },
    });

    return result.toDataStreamResponse({
      sendReasoning: reasoningEnabled,
      headers: {
        "X-Chat-Id": chat.id,
        "X-Chat-Name": encodeURIComponent(chat.name),
      },
    });
  } catch (error) {
    log("Error in POST /api/chat:", error);
    log("Chat creation flow aborted");

    if (error instanceof Error) {
      const statusCode = error.message.toLowerCase().includes("not found")
        ? 404
        : 500;
      return NextResponse.json(
        { error: error.message },
        { status: statusCode },
      );
    }

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
