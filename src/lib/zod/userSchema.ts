import { z } from "zod";
import { apiKeySchema } from "./apiKeySchema";

export const userSchema = z.object({
  id: z.string({
    error: "Invalid user ID format. It should be a valid UUID.",
  }),
  name: z.string().min(1, "Name is required"),
  email: z.email("Invalid email address"),
  emailVerified: z.boolean().default(false),
  apiKey: apiKeySchema.optional(),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
  image: z
    .url({
      error: "Invalid image URL format.",
    })
    .optional(),
});

/*

id            String    @id @unique @default(uuid())
  name          String?
  email         String?
  emailVerified Boolean   @default(false)
  apiKey        ApiKey?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @default(now())
  messages      Message[]
  chats         Chat[]
  image         String?
  sessions      Session[]
  accounts      Account[]
  */
