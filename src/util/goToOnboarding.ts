import { apiKeySchema } from "@lib/zod/apiKeySchema";
import { userSchema } from "@lib/zod/userSchema";

const extendedUserSchema = userSchema.extend({
  apiKey: apiKeySchema,
});

export function GoToOnboarding(user: unknown) {
  const parsedUser = extendedUserSchema.safeParse(user);
  return !parsedUser.success;
}
