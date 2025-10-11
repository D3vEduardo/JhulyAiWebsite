import { z } from "zod";

const serverEnvSchema = z.object({
  PRIVATE_OPENROUTER_API_KEY: z
    .string()
    .min(1, "PRIVATE_OPENROUTER_API_KEY é obrigatório"),
  DISCORD_CLIENT_ID: z.string().min(1, "DISCORD_CLIENT_ID é obrigatório"),
  DISCORD_CLIENT_SECRET: z
    .string()
    .min(1, "DISCORD_CLIENT_SECRET é obrigatório"),
  GITHUB_CLIENT_ID: z.string().min(1, "GITHUB_CLIENT_ID é obrigatório"),
  GITHUB_CLIENT_SECRET: z.string().min(1, "GITHUB_CLIENT_SECRET é obrigatório"),
  OPENROUTER_API_KEY: z.string().min(1, "OPENROUTER_API_KEY é obrigatório"),
  GOOGLE_API_KEY: z.string().min(1, "GOOGLE_API_KEY é obrigatório"),
  DATABASE_URL: z.string().min(1, "DATABASE_URL é obrigatório"),
  BETTER_AUTH_SECRET: z.string().min(1, "BETTER_AUTH_SECRET é obrigatório"),
  GOOGLE_RECAPTCHA_SECRET_KEY: z
    .string("GOOGLE_RECAPTCHA_SECRET_KEY deve ser uma string!")
    .min(1, "GOOGLE_RECAPTCHA_SECRET_KEY deve existir!"),
  GOOGLE_EMAIL_USER: z.string().optional(),
});

const parsed = serverEnvSchema.safeParse(process.env);

if (!parsed.success) {
  const error = parsed.error;
  const formattedErrors = error.issues
    .map((issue) => {
      const path = issue.path.join(".") || "(root)";
      return `❌ ${path}: ${issue.message}`;
    })
    .join("\n");

  const errorMessage =
    `\nErro de validação das variáveis de ambiente (server):\n${formattedErrors}\n\nCorrija o arquivo .env.local antes de iniciar a aplicação.`.trim();
  throw new Error(errorMessage);
}

const serverEnv = parsed.data;
export { serverEnv };
