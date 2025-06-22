"use server";

import { prisma } from "@/lib/prisma/client";
import { auth } from "@lib/nextAuth/auth";

export async function getChatMessages(chatId: string) {
    const session = await auth();
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
                    messages: true,
                },
            },
        },
    });

    const chat = user?.chats.find((chat) => chat.id === chatId);

    return chat?.messages || [];
}
