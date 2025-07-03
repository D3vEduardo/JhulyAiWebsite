import { streamText } from "ai";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@lib/prisma/client";
import { auth } from "@lib/nextAuth/auth";
import { generateChatNameWithAi } from "@utils/generateChatNameWithAi";
import { ConvertMessageOfDatabaseToAiModel } from "@/utils/convertMessageOfDbToAiModel";
import { openrouter } from "@/lib/openrouter/client";
import { GetSystemPrompt } from "./system-prompt";
import { z } from "zod";

const bodySchema = z.object({
  prompt: z.string({ message: "Prompt is required!" }),
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
    const body = await req.json();
    // const { prompt, chatId, reasoning } = body;

    const parseResult = bodySchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: parseResult.error.message,
        },
        {
          status: 400,
        }
      );
    }

    const { chatId, prompt, reasoning } = parseResult.data;

    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized! (User not authenticated)" },
        { status: 401 }
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
      console.log("Processing existing chat with ID:", chatId);

      const existingChat = await prisma.chat.findFirst({
        where: {
          id: chatId,
          ownerId: databaseUserId,
        },
        include: {
          messages: {
            orderBy: { id: "asc" },
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
            orderBy: { id: "asc" },
          },
        },
      });

      if (!chat) {
        throw new Error("Chat not found after update");
      }
    } else {
      console.log(`Creating new chat (chatId:"${chatId}")`);

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
            orderBy: { id: "asc" },
          },
        },
      });

      console.log("New chat created with ID:", chat.id);
    }

    const aiMessages = ConvertMessageOfDatabaseToAiModel(chat.messages);

    const result = streamText({
      // model: openrouter("deepseek/deepseek-chat-v3-0324:free"),
      // model: openrouter("deepseek/deepseek-r1-0528:free"),
      // model: openrouter("openrouter/cypher-alpha:free")
      model: openrouter("openrouter/cypher-alpha:free", {
        reasoning: {
          effort: "high",
        },
      }),
      messages: aiMessages,
      system: GetSystemPrompt("pt-BR"),
      onFinish: async (completion) => {
        try {
          await prisma.message.create({
            data: {
              content: completion.text,
              reasoning: completion.reasoning,
              role: "assistant",
              chatId: chat.id,
            },
          });
          console.log("AI response saved successfully for chat:", chat.id);
        } catch (error) {
          console.error("Error saving AI response:", error);
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
    console.error("Error in POST handler:", error);
    console.log("DEBUG - Chat creation flow aborted");

    // Retornar erro mais específico
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        {
          status: error.message.toLowerCase().includes("not found") ? 404 : 500,
        }
      );
    }

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
