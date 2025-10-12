import { paginationSchema } from "@/api/schemas/pagination.schema";
import { prisma } from "@/lib/prisma/client";
import { authMiddleware } from "@api/middlewares/auth/auth.middleware";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import z from "zod";
import { debug } from "debug";
import { safeValidateUIMessages } from "ai";
import type { UIMessage } from "ai";

const log = debug("app:api:users:me:chats:chatId:messages");

export const usersMeChatMessagesRoute = new Hono().use("*", authMiddleware).get(
  "/",
  zValidator(
    "param",
    z.object({
      chatId: z.string({
        error: "Invalid chatId!",
      }),
    })
  ),
  zValidator("query", paginationSchema),
  async (c) => {
    const user = c.get("user");
    const param = c.req.valid("param");
    const query = c.req.valid("query");

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
          `[GET] /api/users/me/chats/${param.chatId}/messages: Chat not found or access denied for user ${user.id}`
        );
        return c.json(
          {
            message: "Chat not found or access denied",
          },
          404
        );
      }

      // Construir where condition dinamicamente
      const whereCondition = {
        chatId: param.chatId,
        ...(query.cursor && {
          createdAt: {
            lt: new Date(query.cursor),
          },
        }),
      };

      const messages = await prisma.message.findMany({
        where: whereCondition,
        take: query.limit + 1,
        select: {
          chatId: true,
          parts: true,
          createdAt: true,
          id: true,
          role: true,
          updatedAt: true,
          senderId: true,
        },
        orderBy: {
          createdAt: "asc",
        },
      });

      // Verificar se há próxima página
      const hasNextPage = messages.length > query.limit;
      const result = hasNextPage ? messages.slice(0, -1) : messages;

      // Transformar mensagens do Prisma para o formato UIMessage
      const transformedMessages = result.map((msg) => {
        // Normalizar o role para lowercase
        const normalizedRole = msg.role.toLowerCase() as
          | "user"
          | "assistant"
          | "system";

        let partsArray: unknown[];
        if (Array.isArray(msg.parts)) {
          partsArray = msg.parts;
        } else if (typeof msg.parts === "object" && msg.parts !== null) {
          // Se parts for um objeto (como no seu caso), extrair o conteúdo
          const partsObj = msg.parts as Record<string, unknown>;
          if (partsObj.content && Array.isArray(partsObj.content)) {
            partsArray = partsObj.content;
          } else {
            // Fallback: colocar o objeto inteiro como um elemento do array
            partsArray = [partsObj];
          }
        } else {
          partsArray = [];
        }

        return {
          id: msg.id,
          role: normalizedRole,
          parts: partsArray,
          createdAt: msg.createdAt,
        };
      });

      const uiMessageResult = await safeValidateUIMessages({
        // parts shape comes from the DB and may not exactly match the
        // library's UIMessagePart type. Cast here so the runtime validation
        // still runs via safeValidateUIMessages while keeping TypeScript happy.
        messages: transformedMessages as unknown as UIMessage[],
      });

      if (!uiMessageResult.success) {
        log(
          `[GET] /api/users/me/chats/${param.chatId}/messages: Validation error for user ${user.id}:`,
          uiMessageResult.error
        );
        return c.json(
          {
            error: "Validation failed",
            message: "One or more messages failed validation",
            details: uiMessageResult.error,
          },
          500
        );
      }

      // Calcular próximo cursor
      const nextCursor =
        hasNextPage && result.length > 0
          ? new Date(result[result.length - 1].createdAt).getTime()
          : null;

      log(
        `[GET] /api/users/me/chats/${param.chatId}/messages: Retrieved ${result.length} messages for user ${user.id}`
      );

      return c.json({
        message: "Success on get chat messages!",
        data: uiMessageResult.data,
        pagination: {
          nextCursor,
          hasNextPage,
          limit: query.limit,
        },
      });
    } catch (e) {
      const error = e instanceof Error ? e : new Error(String(e));
      log(
        `[GET] /api/users/me/chats/${param.chatId}/messages: Error for user ${user.id}:`,
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
          message: "An unexpected error occurred while retrieving messages",
        },
        500
      );
    }
  }
);
