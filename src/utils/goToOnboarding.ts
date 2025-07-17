import { userSchema } from "@lib/zod/userSchema";
import { User } from "better-auth";

export function GoToOnboarding(user: User) {
  const parsedUser = userSchema.safeParse(user);

  return !parsedUser.success;
}
