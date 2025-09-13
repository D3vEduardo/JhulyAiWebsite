import { authMiddleware } from "@api/middlewares/auth/auth.middleware";
import { prisma } from "@lib/prisma/client";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import z from "zod";
import { debug } from "debug";
import { userSelectQuerySchema } from "@api/schemas/userQuery.schema";
const log = debug("app:api:usersRoute");

export const usersRoute = new Hono().use("*", authMiddleware).get(
  "/:userId",
  zValidator(
    "param",
    z.object({
      userId: z.coerce.string({
        error: "Invalid userId!",
      }),
    }),
  ),
  zValidator(
    "json",
    z
      .object({
        select: userSelectQuerySchema.pick({
          name: true,
          image: true,
          id: true,
          createdAt: true,
        }),
      })
      .strict(),
  ),
  async (c) => {
    const param = c.req.valid("param");
    const body = c.req.valid("json");
    try {
      const finalSelect = Object.fromEntries(
        Object.entries(body.select).filter(([, value]) => value === true),
      );

      const user = await prisma.user.findUnique({
        where: {
          id: param.userId,
        },
        select: Object.keys(finalSelect).length > 0 ? finalSelect : undefined,
      });

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
        500,
      );
    }
  },
);
