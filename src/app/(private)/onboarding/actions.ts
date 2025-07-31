"use server";
import { prisma } from "@lib/prisma/client";
import { onboardingFormSchema } from "@lib/zod/onboardingFormSchema";
import { auth } from "@lib/betterAuth/auth";
import { debug } from "debug";
import { headers } from "next/headers";
import { z } from "zod";
import { getCachedSession } from "@/app/data/auth/getCachedSession";
import { validateApiKeyWithCache } from "@/app/api/chat/validateApiKeyWithCache";

const log = debug("app:onboarding:actions");

interface ActionResponse {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
}

export async function OboardingAction(
  formData: z.infer<typeof onboardingFormSchema>,
): Promise<ActionResponse> {
  const parsedForm = onboardingFormSchema.safeParse(formData);
  log("Parsed Onboarding Form Data:", parsedForm);

  // ✅ Captura TODOS os erros de validação do Zod
  if (!parsedForm.success) {
    const fieldErrors: Record<string, string> = {};

    parsedForm.error.issues.forEach((issue) => {
      const fieldName = issue.path[0]?.toString();
      if (fieldName) {
        fieldErrors[fieldName] = issue.message;
      }
    });

    return {
      success: false,
      error: "Dados do formulário inválidos",
      fieldErrors,
    };
  }

  const { apiKey, email, name } = parsedForm.data;

  try {
    // Validação da API Key
    const apiKeyIsValid = await validateApiKeyWithCache({ apiKey });
    if (!apiKeyIsValid) {
      return {
        success: false,
        fieldErrors: {
          apiKey: "API Key do Open Router não é válida!",
        },
      };
    }

    // Verificação de sessão
    const header = await headers();
    const session = await getCachedSession(header);

    if (!session || !session.user) {
      log("No session found!");
      return {
        success: false,
        error: "Sessão não encontrada!",
      };
    }

    // Busca usuário no banco
    const databaseUser = await prisma.user.findUnique({
      where: {
        id: session.user.id,
        email: session.user.email,
      },
      include: {
        apiKey: true,
      },
    });

    if (!databaseUser) {
      log("User not found in database!");
      return {
        success: false,
        error: "Usuário não encontrado!",
      };
    }

    // Verifica se email já existe (se diferente do atual)
    if (email && email !== databaseUser.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser && existingUser.id !== databaseUser.id) {
        return {
          success: false,
          fieldErrors: {
            email: "Este email já está em uso por outro usuário",
          },
        };
      }
    }

    // Envia email de verificação se necessário
    if (!session.user.emailVerified && email) {
      await auth.api.sendVerificationEmail({
        body: { email },
      });
    }

    // Atualiza dados do usuário
    await prisma.user.update({
      where: {
        id: databaseUser.id,
      },
      data: {
        name: name || databaseUser.name,
        email: email || databaseUser.email,
        apiKey: {
          upsert: {
            create: { key: apiKey },
            update: { key: apiKey },
          },
        },
      },
    });

    log("User updated successfully!");

    return {
      success: true,
    };
  } catch (error) {
    log("Database error:", error);

    // Tratamento específico para erros do Prisma
    if (error && typeof error === "object" && "code" in error) {
      const prismaError = error as { code: string; meta?: { target: string } };

      if (prismaError.code === "P2002") {
        // Violação de constraint unique
        const target = prismaError.meta?.target;
        if (target?.includes("email")) {
          return {
            success: false,
            fieldErrors: {
              email: "Este email já está cadastrado",
            },
          };
        }
      }
    }

    return {
      success: false,
      error: "Erro interno do servidor. Tente novamente.",
    };
  }
}
