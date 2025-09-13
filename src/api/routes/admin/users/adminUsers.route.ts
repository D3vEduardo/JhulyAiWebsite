import { adminMiddleware } from "@api/middlewares/admin/admin.middleware";
import { authMiddleware } from "@api/middlewares/auth/auth.middleware";
import { paginationSchema } from "@api/schemas/pagination.schema";
import { prisma } from "@lib/prisma/client";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import z from "zod";
import { debug } from "debug";
import { userSelectQuerySchema } from "@api/schemas/userQuery.schema";
const log = debug("app:api:usersRoute");

export const adminUsersRoute = new Hono()
  .use("*", authMiddleware)
  .use("*", adminMiddleware)
  .get(
    "/",
    zValidator(
      "json",
      z.object({
        select: userSelectQuerySchema,
      }),
    ),
    zValidator(
      "query",
      z.object({
        pagination: paginationSchema,
        onlyRole: z
          .enum(["USER", "ADMIN"], {
            error: "O role deve ser um dos seguintes valores: USER, ADMIN.",
          })
          .optional(),
      }),
    ),
    async (c) => {
      try {
        const query = c.req.valid("query");
        const body = c.req.valid("json");
        const isAdmin = c.get("userIsAdmin");

        if (!isAdmin) {
          log("[GET] /api/admin/users - Unauthorized");
          return c.json(
            {
              message: "Unauthorized",
            },
            401,
          );
        }

        const finalSelect = Object.fromEntries(
          Object.entries(body.select).filter(([, value]) => value === true),
        );

        const users = await prisma.user.findMany({
          where: {
            createdAt: {
              gte: new Date(query.pagination.cursor || 0),
            },
            role: query.onlyRole ? query.onlyRole : undefined,
          },
          orderBy: {
            createdAt: "asc",
          },
          select: Object.keys(finalSelect).length > 0 ? finalSelect : undefined,
        });

        log("[GET] /api/admin/users - Users fetched successfully");
        return c.json({
          message: "Users fetched successfully",
          data: users || [],
        });
      } catch (e) {
        log("[GET] /api/admin/users - ERROR - Detalhes:", e);
        return c.json(
          {
            message: "Internal server error",
          },
          500,
        );
      }
    },
  );
