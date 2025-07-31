import { z } from "zod";

const {
  PRIVATE_OPENROUTER_API_KEY,
  NEXT_AUTH_SECRET,
  NEXT_AUTH_URL,
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
  GOOGLE_RECAPTCHA_KEY,
  GOOGLE_RECAPTCHA_SECRET_KEY,
} = process.env;

const envSchema = z.object({
  PRIVATE_OPENROUTER_API_KEY: z
    .string()
    .min(1, "PRIVATE_OPENROUTER_API_KEY é obrigatório"),
  NEXT_AUTH_SECRET: z.string().min(1, "NEXT_AUTH_SECRET é obrigatório"),
  NEXT_AUTH_URL: z.string().url("NEXT_AUTH_URL deve ser uma URL válida"),
  DISCORD_CLIENT_ID: z.string().min(1, "DISCORD_CLIENT_ID é obrigatório"),
  DISCORD_CLIENT_SECRET: z
    .string()
    .min(1, "DISCORD_CLIENT_SECRET é obrigatório"),
  GITHUB_CLIENT_ID: z.string().min(1, "GITHUB_CLIENT_ID é obrigatório"),
  GITHUB_CLIENT_SECRET: z
    .string()
    .min(1, "DGITHUB_CLIENT_SECRET é obrigatório"),
  OPENROUTER_API_KEY: z.string().min(1, "OPENROUTER_API_KEY é obrigatório"),
  GOOGLE_API_KEY: z.string().min(1, "GOOGLE_API_KEY é obrigatório"),
  DATABASE_URL: z.string().min(1, "DATABASE_URL é obrigatório"),
  BETTER_AUTH_SECRET: z.string().min(1, "BETTER_AUTH_SECRET é obrigatório"),
  BETTER_AUTH_URL: z.url("BETTER_AUTH_URL deve ser uma URL válida"),
  NEXT_PUBLIC_BETTER_AUTH_URL: z
    .url("NEXT_PUBLIC_BETTER_AUTH_URL deve ser uma URL válida")
    .optional(),
  GOOGLE_RECAPTCHA_KEY: z
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
  GOOGLE_RECAPTCHA_KEY,
  GOOGLE_RECAPTCHA_SECRET_KEY,
});

if (!parsed.success) {
  console.error(
    "Erro de validação das variáveis de ambiente:",
    parsed.error.format()
  );
  throw new Error(
    "Variáveis de ambiente inválidas ou ausentes. Corrija o arquivo .env.local antes de iniciar a aplicação."
  );
}

export const env = parsed.data;
