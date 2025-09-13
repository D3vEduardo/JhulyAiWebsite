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
  const { role: authenticadedUserRole } = c.get("user");

  c.set("userIsAdmin", authenticadedUserRole === UserRole.ADMIN);
  return await next();
};
