import { z } from "zod";

const clientEnvSchema = z.object({
  NEXT_PUBLIC_GOOGLE_RECAPTCHA_KEY: z
    .string()
    .min(1, "NEXT_PUBLIC_GOOGLE_RECAPTCHA_KEY deve existir!"),
  NEXT_PUBLIC_APP_URL: z
    .url("NEXT_PUBLIC_APP_URL deve ser uma URL válida")
    .min(1, "NEXT_PUBLIC_APP_URL deve ser uma string!"),
});

const parsed = clientEnvSchema.safeParse({
  NEXT_PUBLIC_GOOGLE_RECAPTCHA_KEY:
    process.env.NEXT_PUBLIC_GOOGLE_RECAPTCHA_KEY,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
});

if (!parsed.success) {
  const error = parsed.error;
  const formattedErrors = error.issues
    .map((issue) => {
      const path = issue.path.join(".") || "(root)";
      return `❌ ${path}: ${issue.message}`;
    })
    .join("\n");

  const errorMessage =
    `\nErro de validação das variáveis de ambiente (client):\n${formattedErrors}\n\nCorrija o arquivo .env.local antes de iniciar a aplicação.`.trim();
  throw new Error(errorMessage);
}

const clientEnv = parsed.data;
export { clientEnv };
