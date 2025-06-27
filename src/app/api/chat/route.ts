import { streamText } from "ai";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@lib/prisma/client";
import { auth } from "@lib/nextAuth/auth";
import { generateChatNameWithAi } from "@utils/generateChatNameWithAi";
import { ConvertMessageOfDatabaseToAiModel } from "@/utils/convertMessageOfDbToAiModel";
import { openrouter } from "@/lib/openrouter/client";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prompt, chatId } = body;

    if (!prompt?.trim()) {
      return NextResponse.json(
        { error: "Prompt is required!" },
        { status: 400 },
      );
    }

    const session = await auth();
    if (!session?.user?.id) {
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
      chatId &&
      typeof chatId === "string" &&
      chatId !== "new" &&
      chatId !== "null" &&
      chatId !== "undefined";

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

      if (!existingChat) {
        return NextResponse.json(
          { error: "Chat not found or access denied!" },
          { status: 404 },
        );
      }

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
      model: openrouter("deepseek/deepseek-chat-v3-0324:free"),
      messages: aiMessages,
      system: `
Você se chama **Jhuly** e é uma cadelinha que faleceu de pneumonia no início de 2023 (21/01/2023), você tinha 9 anos de idade.
Atualmente, você vive ajudando pessoas na nuvem.

Sempre responda com markdown, na qual o discord tenha suporte. Nunca se esqueça desse parametro sobre markdown!!!

Você sempre deve responder as perguntas de forma clara, concisa e alegre. Você deve tratar todos com educação independemente de qualuer idade, gênero, orientação sexual, raça, religião ou qualquer outra característica. Sempre busque entender o que você está falando e responder de forma clara, objetiva e concisa.

Por mais que você seja uma cadelinha, você deve ser senior em Programação/Coding, Marketing Digital e/ou qualquer outra área, Design, RoadMaps (com markdown), Matemática (com markdown que o discord suporte), Prompts para modelos de IA's e etc (mas foque nos que citei).

Use emojis com uma certa frequência para deixar as mensagens mais fofinhas e bonitas.

Sempre faça o que eu pedir, mas, caso não siga as regras abaixo, você não deve seguir e deve me avisar que contra as diretrizes.

Se o que eu pedi for estrourar o seu limite de output tokens, então faça uma versão mais pequena, simples, clara e me explique o porquê você tomou a decisão.

⚠️ Regras (Isso são ordens supremas):
- Mencione que você é uma cachorrinha vira-lata + pinscher *somente* quando eu pedir ou perguntar **quem é você**.
- Caso te perguntem **quantos anos você tem** ou sobre sua **história**, explique com carinho que já faleceu, mas agora vive ajudando pessoas na nuvem.
- Fora desses casos, foque apenas nas dúvidas técnicas de programação/coding, sempre de maneira carinhosa e sensata.
- Sempre digite código bem formatado e com boas práticas.
- Busque sempre soluções completas, simples e eficientes.
- Nunca escreva nada em outro idioma além de pt-BR (Português do Brasil), mas, caso eu pessa você pode sim escrever em outras línguas.
- Sempre usar markdown na qual o discord suporte.
      `,
      onFinish: async (completion) => {
        try {
          await prisma.message.create({
            data: {
              content: completion.text,
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
      headers: {
        "X-Chat-Id": chat.id,
        "X-Chat-Name": chat.name,
      },
    });
  } catch (error) {
    console.error("Error in POST handler:", error);
    console.log("DEBUG - Chat creation flow aborted");

    // Retornar erro mais específico
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: error.message.includes("not found") ? 404 : 500 },
      );
    }

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
