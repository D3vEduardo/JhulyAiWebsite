import { auth } from "@lib/betterAuth/auth";
import { cache } from "react";

export const getCachedSession = cache(async (reqHeaders: Headers) => {
  return await auth.api.getSession({
    headers: reqHeaders,
  });
});
