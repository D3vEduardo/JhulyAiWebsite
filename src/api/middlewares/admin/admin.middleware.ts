import { MiddlewareHandler } from "hono";
import { AuthMiddlewareVariables } from "../auth/auth.middleware";
import { prisma } from "@/lib/prisma/client";
import { UserRole } from "@prisma/client";

export type AdminMiddlewareVariables = {
  userIsAdmin: boolean;
};

export const adminMiddleware: MiddlewareHandler<{
  Variables: AdminMiddlewareVariables & AuthMiddlewareVariables;
}> = async (c, next) => {
  const user = c.get("user");
  const authenticadedUserRole = await prisma.user.findUnique({
    where: {
      id: user.id,
    },
    select: {
      role: true,
    },
  });

  c.set("userIsAdmin", authenticadedUserRole?.role === UserRole.ADMIN);
  return await next();
};
