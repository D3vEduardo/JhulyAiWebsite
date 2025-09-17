import { z } from "zod";

export const messageSelectQuerySchema = z
  .object({
    id: z.boolean().optional().default(true),
    role: z.boolean().optional().default(true),
    reasoning: z.boolean().optional().default(true),
    content: z.boolean().optional().default(true),
    chatId: z.boolean().optional().default(true),
    senderId: z.boolean().optional().default(true),
    createdAt: z.boolean().optional().default(true),
    updatedAt: z.boolean().optional().default(true),
  })
  .strict();