import { messageSelectQuerySchema } from "@api/schemas/messageSelectQuery.schema";
import { prisma } from "@lib/prisma/client";
import { authMiddleware } from "@api/middlewares/auth/auth.middleware";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import z from "zod";
import { debug } from "debug";
const log = debug("app:api:users:me:chats:chatId:messages:messageId");

export const usersMeChatMessageByIdRoute = new Hono()
  .use("*", authMiddleware)
  .get(
    "/",
    zValidator(
      "param",
      z.object({
        chatId: z.string({
          error: "Invalid chatId!",
        }),
        messageId: z.string({
          error: "Invalid messageId!",
        }),
      })
    ),
    zValidator("query", messageSelectQuerySchema.strict()),
    async (c) => {
      const user = c.get("user");
      const param = c.req.valid("param");
      const select = c.req.valid("query");

      try {
        // Verificar se o chat pertence ao usuário autenticado
        const chat = await prisma.chat.findUnique({
          where: {
            id: param.chatId,
            ownerId: user.id,
          },
        });

        if (!chat) {
          log(
            `[GET] /api/users/me/chats/${param.chatId}/messages/${param.messageId}: Chat not found or access denied for user ${user.id}`
          );
          return c.json(
            {
              message: "Chat not found or access denied",
            },
            404
          );
        }

        // Construir select dinamicamente com base nos campos solicitados
        const finalSelect = Object.fromEntries(
          Object.entries(select).filter(([, value]) => value === true)
        );

        const message = await prisma.message.findUnique({
          where: {
            id: param.messageId,
            chatId: param.chatId, // Garantir que a mensagem pertence ao chat especificado
          },
          select: Object.keys(finalSelect).length > 0 ? finalSelect : undefined,
        });

        if (!message) {
          log(
            `[GET] /api/users/me/chats/${param.chatId}/messages/${param.messageId}: Message not found for user ${user.id}`
          );
          return c.json(
            {
              message: "Message not found or access denied",
            },
            404
          );
        }

        log(
          `[GET] /api/users/me/chats/${param.chatId}/messages/${param.messageId}: Message fetched successfully for user ${user.id}`
        );
        return c.json({
          message: "Message fetched successfully",
          data: message,
        });
      } catch (e) {
        const error = e instanceof Error ? e : new Error(String(e));
        log(
          `[GET] /api/users/me/chats/${param.chatId}/messages/${param.messageId}: Error for user ${user.id}:`,
          error
        );

        const isPrismaError = (
          err: unknown
        ): err is { code: string; name: string } => {
          return (
            typeof err === "object" &&
            err !== null &&
            "code" in err &&
            "name" in err
          );
        };

        const isValidationError = (
          err: unknown
        ): err is { name: string; message: string; errors: unknown } => {
          return (
            typeof err === "object" &&
            err !== null &&
            "name" in err &&
            (err as { name: string }).name === "ValidationError"
          );
        };

        if (isPrismaError(e)) {
          if (e.code === "P2002") {
            return c.json(
              {
                error: "Duplicate entry found",
                message: "A message with this identifier already exists",
              },
              409
            );
          }

          if (e.code === "P2025") {
            return c.json(
              {
                error: "Record not found",
                message: "The requested message could not be found",
              },
              404
            );
          }

          if (e.name === "PrismaClientKnownRequestError") {
            return c.json(
              {
                error: "Database error",
                message: "An error occurred while accessing the database",
              },
              500
            );
          }
        }

        if (isValidationError(e)) {
          return c.json(
            {
              error: "Validation failed",
              message: error.message,
              details: (e as { errors: unknown }).errors,
            },
            400
          );
        }

        return c.json(
          {
            error: "Internal server error",
            message:
              "An unexpected error occurred while retrieving the message",
          },
          500
        );
      }
    }
  );
