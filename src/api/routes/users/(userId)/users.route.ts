import { authMiddleware } from "@api/middlewares/auth/auth.middleware";
import { prisma } from "@lib/prisma/client";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import z from "zod";
import { debug } from "debug";
import { userSelectQuerySchema } from "@/api/schemas/userSelectQuery.schema";
const log = debug("app:api:usersRoute:userId");

export const usersRoute = new Hono().use("*", authMiddleware).get(
  "/",
  zValidator(
    "param",
    z.object({
      userId: z.coerce.string({
        error: "Invalid userId!",
      }),
    })
  ),
  zValidator(
    "query",
    userSelectQuerySchema
      .pick({
        name: true,
        image: true,
        createdAt: true,
      })
      .strict()
  ),
  async (c) => {
    const param = c.req.valid("param");
    const select = c.req.valid("query");
    try {
      const finalSelect = Object.fromEntries(
        Object.entries(select).filter(([, value]) => value === true)
      );

      const user = await prisma.user.findUnique({
        where: {
          id: param.userId,
        },
        select: Object.keys(finalSelect).length > 0 ? finalSelect : undefined,
      });

      if (!user) {
        log(`[GET] /api/users/${param.userId} - User not found`);
        return c.json(
          {
            message: "User not found",
          },
          404
        );
      }

      log(`[GET] /api/users/${param.userId} - User fetched successfully`);
      return c.json({
        message: "User fetched successfully",
        data: user,
      });
    } catch (e) {
      log(`[GET] /api/users/${param.userId} - ERROR - Detalhes:`, e);
      return c.json(
        {
          message: "Internal server error",
        },
        500
      );
    }
  }
);
