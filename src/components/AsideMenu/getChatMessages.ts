"use server";

import { prisma } from "@lib/prisma/client";
import { headers } from "next/headers";
import { debug } from "debug";
import { getCachedSession } from "@data/auth/getCachedSession";
import { ConvertMessageOfDatabaseToAiModel } from "@utils/convertMessageOfDbToAiModel";

const log = debug("components:aside-menu:get-chat-messages");

export async function getChatMessages(chatId: string) {
  if (chatId === "new") return [];
  log("Pegando mensagens do chat:", chatId);
  const header = await headers();
  const session = await getCachedSession(header);
  log("Sessão do usuário:", session);
  if (!session || !session.user) {
    throw new Error("User not authenticated");
  }
  const userChats = await prisma.chat.findMany({
    where: {
      ownerId: session.user.id,
    },
    include: {
      messages: true,
    },
  });

  const chat = userChats?.find((chat) => chat.id === chatId);
  const convertedChatMessages = await ConvertMessageOfDatabaseToAiModel(
    chat?.messages || [],
  );
  return convertedChatMessages;
}
