import z from "zod";

export const apiKeySchema = z
  .object({
    id: z.uuid({
      error: "Invalid API Key ID format",
    }),
    key: z.string({ error: "API Key is required" }),
  })
  .optional();
