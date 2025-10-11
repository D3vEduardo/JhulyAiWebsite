import { authMiddleware } from "@api/middlewares/auth/auth.middleware";
import { validateApiKeyWithCache } from "@api/utils/validateApiKeyWithCache";
import { prisma } from "@lib/prisma/client";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import { debug } from "debug";
import { auth } from "@lib/betterAuth/auth";
import { serverEnv } from "@server.env";

const log = debug("app:api:users:me:update");

const updateUserDataSchema = z.object({
  name: z.string().optional(),
  email: z.string().email().optional(),
  apiKey: z.string().optional(),
});

export const usersMeUpdateRoute = new Hono().use("*", authMiddleware).patch(
  "/",
  zValidator("json", updateUserDataSchema),
  async (c) => {
    const user = c.get("user");
    const { name, email, apiKey } = c.req.valid("json");

    try {
      // Verificar se a apiKey é válida antes de atualizar
      if (apiKey) {
        const apiKeyIsValid = await validateApiKeyWithCache({ apiKey });
        if (!apiKeyIsValid) {
          return c.json(
            {
              success: false,
              fieldErrors: {
                apiKey: "API Key do Open Router não é válida!",
              },
            },
            400
          );
        }
      }

      // Verificar se o email já está sendo usado por outro usuário
      if (email && email !== user.email) {
        const existingUser = await prisma.user.findUnique({
          where: { email },
        });

        if (existingUser && existingUser.id !== user.id) {
          return c.json(
            {
              success: false,
              fieldErrors: {
                email: "Este email já está em uso por outro usuário",
              },
            },
            409
          );
        }
      }

      // Enviar email de verificação se o email foi alterado e ainda não foi verificado
      if (email && !user.emailVerified) {
        await auth.api.sendVerificationEmail({
          body: { email },
        });
      }

      // Atualizar os dados do usuário
      const updatedUser = await prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          name: name ?? user.name,
          email: email ?? user.email,
          apiKey: apiKey
            ? {
                upsert: {
                  create: { key: apiKey },
                  update: { key: apiKey },
                },
              }
            : undefined,
        },
        include: {
          apiKey: true,
        },
      });

      log(`User ${user.id} updated successfully!`);

      return c.json({
        success: true,
        message: "User updated successfully",
        data: {
          id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
          emailVerified: updatedUser.emailVerified,
        },
      });
    } catch (e) {
      log("Error updating user:", e);

      if (e instanceof Error && (e as any).code === "P2002") {
        // Prisma unique constraint error
        const target = (e as any).meta?.target;
        if (target && Array.isArray(target) && target.includes("email")) {
          return c.json(
            {
              success: false,
              fieldErrors: {
                email: "Este email já está cadastrado",
              },
            },
            409
          );
        }
      }

      return c.json(
        {
          success: false,
          error: "Erro interno do servidor. Tente novamente.",
        },
        500
      );
    }
  }
);