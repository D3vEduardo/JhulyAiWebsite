import { z } from "zod";

export const paginationSchema = z.object({
  lastItemTimestamp: z.coerce
    .date({
      error: "O timestamp do último item deve ser uma data válida.",
    })
    .optional(),
  limit: z.coerce
    .number({
      error: "O limite deve ser um número válido.",
    })
    .optional()
    .default(20),
});
