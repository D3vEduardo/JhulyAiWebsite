"use server";

import { prisma } from "@/lib/prisma/client";
import { auth } from "@/lib/betterAuth/auth";
import { headers } from "next/headers";
import { debug } from "debug";

const log = debug("app:messages:getChatMessages");

export async function getChatMessages(chatId: string) {
  log("Pegando mensagens do chat:", chatId);
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  log("Sessão do usuário:", session);
  if (!session || !session.user) {
    throw new Error("User not authenticated");
  }
  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
    include: {
      chats: {
        include: {
          messages: {
            orderBy: {
              createdAt: "asc",
            },
          },
        },
      },
    },
  });

  const chat = user?.chats.find((chat) => chat.id === chatId);

  return chat?.messages || [];
}
