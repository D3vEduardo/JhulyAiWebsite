import { imageConfigDefault } from "next/dist/shared/lib/image-config";
import z from "zod";

export const userSelectQuerySchema = z
  .object({
    id: z.coerce
      .boolean({
        error: "Id deve ser um booleano válido.",
      })
      .optional()
      .default(true),
    email: z.coerce
      .boolean({
        error: "Email deve ser um booleano válido.",
      })
      .optional()
      .default(false),
    name: z.coerce
      .boolean({
        error: "Nome deve ser um booleano válido.",
      })
      .optional()
      .default(true),
    image: z.coerce
      .boolean({
        error: "Imagem deve ser um booleano válido.",
      })
      .optional()
      .default(true),
    apiKey: z.coerce
      .boolean({
        error: "ApiKey deve ser um booleano válido.",
      })
      .optional()
      .default(false),
    chats: z.coerce
      .boolean({
        error: "Chats deve ser um booleano válido.",
      })
      .optional()
      .default(false),
    messages: z.coerce
      .boolean({
        error: "Messages deve ser um booleano válido.",
      })
      .optional()
      .default(false),
    role: z
      .boolean({
        error: "Role deve ser um booleano válido.",
      })
      .optional()
      .default(false),
    createdAt: z
      .boolean({
        error: "CreatedAt deve ser um booleano válido.",
      })
      .optional()
      .default(true),
    updatedAt: z
      .boolean({
        error: "UpdatedAt deve ser um booleano válido.",
      })
      .optional()
      .default(true),
  })
  .strict();
