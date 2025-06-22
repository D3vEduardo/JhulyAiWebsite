'use server';

import { auth } from "@/lib/nextAuth/auth";
import { prisma } from "@/lib/prisma/client";

export async function getUserChats() {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error("Usuário não autenticado");
    }

    const userData = await prisma.user.findUnique({
        where: {
            id: session.user.id
        },
        include: {
            chats: true
        }
    });

    if (!userData) {
        throw new Error("Usuário não encontrado");
    }

    return userData.chats;
}