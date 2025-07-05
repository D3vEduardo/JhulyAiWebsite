import { streamText } from "ai";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@lib/prisma/client";
import { auth } from "@lib/nextAuth/auth";
import { generateChatNameWithAi } from "@utils/generateChatNameWithAi";
import { ConvertMessageOfDatabaseToAiModel } from "@/utils/convertMessageOfDbToAiModel";
// import { openrouter } from "@/lib/openrouter/client";
import { GetSystemPrompt } from "./system-prompt";
import { debug } from "debug";
import { z } from "zod";
import { google } from "@lib/google/client";

const log = debug("api:chat");

const messageSchema = z.object({
  role: z.enum(["user", "assistant", "system", "tool"]),
  content: z.string(),
  tool_calls: z.array(z.any()).optional(),
});

const bodySchema = z.object({
  messages: z.array(messageSchema),
  chatId: z.string({ message: "Chat ID is required!" }),
  reasoning: z
    .boolean({
      coerce: true,
      message: "Reasoning must be a boolean value.",
    })
    .default(false),
});

export async function POST(req: NextRequest) {
  try {
    log("Initiating ai flow...");
    const body = await req.json();
    const parseResult = bodySchema.safeParse(body);

    if (!parseResult.success) {
      log("Invalid request body:", body);
      return NextResponse.json(
        {
          error: parseResult.error.message,
        },
        {
          status: 400,
        },
      );
    }

    const { chatId, messages } = parseResult.data;
    const lastMessage = messages[messages.length - 1];
    if (lastMessage.role !== "user") {
      return NextResponse.json(
        { error: "Last message must be from user" },
        { status: 400 },
      );
    }
    const prompt = lastMessage.content;

    const session = await auth();
    if (!session?.user?.id) {
      log("User not authenticated");
      return NextResponse.json(
        { error: "Unauthorized! (User not authenticated)" },
        { status: 401 },
      );
    }

    const { id: databaseUserId } = await prisma.user.upsert({
      where: { id: session.user.id },
      update: {},
      create: {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
      },
    });

    let chat;

    const isExistingChat =
      chatId !== "new" && chatId !== "null" && chatId !== "undefined";

    if (isExistingChat) {
      log("Processing existing chat with ID:", chatId);

      const existingChat = await prisma.chat.findFirst({
        where: {
          id: chatId,
          ownerId: databaseUserId,
        },
        include: {
          messages: {
            orderBy: { createdAt: "asc" },
          },
        },
      });

      if (!existingChat) throw new Error("Chat not found or access denied!");

      await prisma.message.create({
        data: {
          content: prompt.trim(),
          role: "user",
          chatId: existingChat.id,
          senderId: databaseUserId,
        },
      });

      chat = await prisma.chat.findUnique({
        where: { id: existingChat.id },
        include: {
          messages: {
            orderBy: { createdAt: "asc" },
          },
        },
      });

      if (!chat) {
        throw new Error("Chat not found after update");
      }
    } else {
      log(`Creating new chat (chatId:"${chatId}")`);

      // Criar novo chat
      chat = await prisma.chat.create({
        data: {
          name: await generateChatNameWithAi(prompt),
          ownerId: databaseUserId,
          messages: {
            create: {
              content: prompt.trim(),
              role: "user",
              senderId: databaseUserId,
            },
          },
        },
        include: {
          messages: {
            orderBy: { createdAt: "asc" },
          },
        },
      });

      log("New chat created with ID:", chat.id);
    }

    const aiMessages = ConvertMessageOfDatabaseToAiModel(chat.messages);
    log(`Chat ${chatId} messages converted to AI model:`, aiMessages);
    const result = streamText({
      // model: openrouter("deepseek/deepseek-chat-v3-0324:free"),
      // model: openrouter("deepseek/deepseek-r1-0528:free"),
      // model: openrouter("openrouter/cypher-alpha:free"),
      model: google("gemini-2.0-flash"),
      messages: aiMessages,
      system: GetSystemPrompt("pt-BR"),
      onFinish: async (completion) => {
        log("AI response received:", completion.text);
        try {
          await prisma.message.create({
            data: {
              content: completion.text,
              reasoning: JSON.stringify(completion.reasoning),
              role: "assistant",
              chatId: chat.id,
            },
          });
          log("AI response saved successfully for chat:", chat.id);
        } catch (error) {
          log("Error saving AI response:", error);
        }
      },
    });

    return result.toDataStreamResponse({
      sendReasoning: true,
      headers: {
        "X-Chat-Id": chat.id,
        "X-Chat-Name": encodeURIComponent(chat.name),
      },
    });
  } catch (error) {
    log("Error in POST /api/chat:", error);
    log("Chat creation flow aborted");

    // Retornar erro mais específico
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        {
          status: error.message.toLowerCase().includes("not found") ? 404 : 500,
        },
      );
    }

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
