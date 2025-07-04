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
});

const parsed = envSchema.safeParse({
  PRIVATE_OPENROUTER_API_KEY,
  NEXT_AUTH_SECRET,
  NEXT_AUTH_URL,
  DISCORD_CLIENT_ID,
  DISCORD_CLIENT_SECRET,
  GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET,
  OPENROUTER_API_KEY,
  GOOGLE_API_KEY,
});

if (!parsed.success) {
  console.error(
    "Erro de validação das variáveis de ambiente:",
    parsed.error.format(),
  );
  throw new Error(
    "Variáveis de ambiente inválidas ou ausentes. Corrija o arquivo .env.local antes de iniciar a aplicação.",
  );
}

export const env = parsed.data;
