import { z } from "zod";

export const paginationSchema = z
  .object({
    cursor: z.coerce
      .date({
        error: "O cursor deve ser uma data válida.",
      })
      .optional(),
    limit: z.coerce
      .number({
        error: "O limite deve ser um número válido.",
      })
      .optional()
      .default(20),
  })
  .optional()
  .default({
    limit: 20,
    cursor: undefined,
  });
