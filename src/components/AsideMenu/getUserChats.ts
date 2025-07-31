"use server";

import { getCachedSession } from "@/app/data/auth/getCachedSession";
import { prisma } from "@lib/prisma/client";
import { headers } from "next/headers";
import { debug } from "debug";
const log = debug("components:aside-menu:get-user-chats");

export async function getUserChats() {
  log("Getting user chats on server...");
  const session = await getCachedSession(await headers());
  if (!session?.user?.id) {
    throw new Error("Usuário não autenticado");
  }

  const userData = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
    select: {
      chats: true,
    },
  });

  if (!userData) {
    throw new Error("Usuário não encontrado");
  }

  log("Get user chats on server is completed!");
  return userData.chats;
}
