import { prisma } from "@lib/prisma/client";
import { cache } from "react";
import "server-only";

export const getCachedUser = cache(async (userId: string, email: string) => {
  return await prisma.user.findUnique({
    where: {
      id: userId,
      email: email,
    },
    select: {
      id: true,
      email: true,
      name: true,
      apiKey: {
        select: {
          id: true,
          key: true,
        },
      },
    },
  });
});
