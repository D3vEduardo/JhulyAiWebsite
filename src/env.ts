import { z } from "zod";

const {
  PRIVATE_OPENROUTER_API_KEY,
  DISCORD_CLIENT_ID,
  DISCORD_CLIENT_SECRET,
  GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET,
  OPENROUTER_API_KEY,
  GOOGLE_API_KEY,
  DATABASE_URL,
  BETTER_AUTH_SECRET,
  BETTER_AUTH_URL,
  NEXT_PUBLIC_BETTER_AUTH_URL,
  NEXT_PUBLIC_GOOGLE_RECAPTCHA_KEY,
  GOOGLE_RECAPTCHA_SECRET_KEY,
} = process.env;

const envSchema = z.object({
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
  BETTER_AUTH_URL: z.string().url("BETTER_AUTH_URL deve ser uma URL válida"),
  NEXT_PUBLIC_BETTER_AUTH_URL: z
    .string()
    .url("NEXT_PUBLIC_BETTER_AUTH_URL deve ser uma URL válida")
    .optional(),
  NEXT_PUBLIC_GOOGLE_RECAPTCHA_KEY: z
    .string("GOOGLE_RECAPTCHA_KEY deve ser uma string!")
    .min(1, "GOOGLE_RECAPTCHA_KEY deve existir!"),
  GOOGLE_RECAPTCHA_SECRET_KEY: z
    .string("GOOGLE_RECAPTCHA_SECRET_KEY deve ser uma string!")
    .min(1, "GOOGLE_RECAPTCHA_SECRET_KEY deve existir!"),
});

const parsed = envSchema.safeParse({
  PRIVATE_OPENROUTER_API_KEY,
  DISCORD_CLIENT_ID,
  DISCORD_CLIENT_SECRET,
  GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET,
  OPENROUTER_API_KEY,
  GOOGLE_API_KEY,
  DATABASE_URL,
  BETTER_AUTH_SECRET,
  BETTER_AUTH_URL,
  NEXT_PUBLIC_BETTER_AUTH_URL,
  NEXT_PUBLIC_GOOGLE_RECAPTCHA_KEY,
  GOOGLE_RECAPTCHA_SECRET_KEY,
});

if (!parsed.success) {
  const error = parsed.error; // tipo: ZodError<...>

  const formattedErrors = error.issues
    .map((issue) => {
      const path = issue.path.join(".") || "(root)";
      return `❌ ${path}: ${issue.message}`;
    })
    .join("\n");

  const errorMessage = `
Erro de validação das variáveis de ambiente:
${formattedErrors}

Corrija o arquivo .env.local antes de iniciar a aplicação.
  `.trim();

  throw new Error(errorMessage);
}

export { parsed as env };
