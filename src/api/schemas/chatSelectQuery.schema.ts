import { z } from "zod";

export const chatSelectQuerySchema = z
  .object({
    id: z.boolean().optional().default(true),
    name: z.boolean().optional().default(true),
    ownerId: z.boolean().optional().default(true),
    createdAt: z.boolean().optional().default(true),
    updatedAt: z.boolean().optional().default(true),
  })
  .strict();
