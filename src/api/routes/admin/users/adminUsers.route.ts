import { adminMiddleware } from "@api/middlewares/admin/admin.middleware";
import { authMiddleware } from "@api/middlewares/auth/auth.middleware";
import { paginationSchema } from "@api/schemas/pagination.schema";
import { prisma } from "@lib/prisma/client";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import z from "zod";
import { debug } from "debug";
import { userSelectQuerySchema } from "@/api/schemas/userSelectQuery.schema";

const log = debug("app:api:usersRoute");

export const adminUsersRoute = new Hono()
  .use("*", authMiddleware)
  .use("*", adminMiddleware)
  .get(
    "/",
    zValidator(
      "query",
      z.object({
        select: userSelectQuerySchema,
        pagination: paginationSchema,
        onlyRole: z
          .enum(["USER", "ADMIN"], {
            error: "O role deve ser um dos seguintes valores: USER, ADMIN.",
          })
          .optional(),
      })
    ),
    async (c) => {
      try {
        const query = c.req.valid("query");
        const isAdmin = c.get("userIsAdmin");

        // ✅ Verificação necessária já que middleware só seta o contexto
        if (!isAdmin) {
          log("[GET] /api/admin/users - Unauthorized access attempt");
          return c.json(
            {
              message: "Unauthorized",
            },
            401
          );
        }

        // ✅ Otimizar processamento do select
        const finalSelect = Object.fromEntries(
          Object.entries(query.select).filter(([, value]) => value === true)
        );

        // ✅ Construir where condition corretamente
        const whereCondition = {
          ...(query.pagination.cursor && {
            createdAt: {
              gte: new Date(query.pagination.cursor),
            },
          }),
          ...(query.onlyRole && { role: query.onlyRole }),
        };

        const users = await prisma.user.findMany({
          where: whereCondition,
          take: query.pagination.limit, // ✅ CRÍTICO: Estava faltando!
          orderBy: {
            createdAt: "asc",
          },
          select: Object.keys(finalSelect).length > 0 ? finalSelect : undefined,
        });

        // ✅ Corrigir lógica do nextCursor
        const nextCursor =
          users.length === query.pagination.limit && users.length > 0
            ? new Date(users[users.length - 1].createdAt).getTime()
            : null;

        log(
          `[GET] /api/admin/users - Users fetched successfully. Count: ${users.length}`
        );

        return c.json({
          message: "Users fetched successfully",
          data: users || [],
          nextCursor,
        });
      } catch (e) {
        const error = e as Error;
        log("[GET] /api/admin/users - ERROR - Details:", error);

        // ✅ Melhorar tratamento de erro mantendo simplicidade
        if (error.name === "PrismaClientKnownRequestError") {
          return c.json(
            {
              message: "Database error occurred",
            },
            500
          );
        }

        return c.json(
          {
            message: "Internal server error",
          },
          500
        );
      }
    }
  );
