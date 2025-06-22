import { streamText } from "ai";
import { openrouter } from "@lib/openrouter/client";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@lib/prisma/client";
import { auth } from "@lib/nextAuth/auth";
import { generateChatNameWithAi } from "@utils/generateChatNameWithAi";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prompt, chatId } = body;
    console.log("Prompt received:", prompt);

    if (!prompt)
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );

    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.upsert({
      where: { id: session.user.id },
      update: {},
      create: {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
      },
    });

    const chat = await prisma.chat.upsert({
      where: { id: chatId || "" },
      update: {},
      create: {
        name: await generateChatNameWithAi(prompt),
        ownerId: user.id,
      },
    });

    await prisma.message.create({
      data: {
        content: prompt,
        role: "user",
        chatId: chat.id,
        senderId: user.id,
      },
    });

    const result = streamText({
      model: openrouter("deepseek/deepseek-r1-0528:free"),
      prompt,
    });

    result.text
      .then(async (aiResponse) => {
        await prisma.message.create({
          data: {
            content: aiResponse,
            role: "assistant",
            chatId: chat.id,
          },
        });
      })
      .catch((error) => {
        console.error("Error saving AI response:", error);
      });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error("Error in POST handler:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
