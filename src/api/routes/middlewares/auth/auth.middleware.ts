import { auth } from "@/lib/betterAuth/auth";
import { MiddlewareHandler } from "hono";

export type authMiddlewareVariables = {
  user: typeof auth.$Infer.Session.user;
  session: typeof auth.$Infer.Session.session;
};

export const authMiddleware: MiddlewareHandler<{
  Variables: authMiddlewareVariables;
}> = async (c, next) => {
  const authData = await auth.api.getSession({
    headers: c.req.raw.headers,
  });

  if (!authData) {
    return c.json({
      error: "Unauthorized",
      status: 401,
    });
  }

  c.set("user", authData.user);
  c.set("session", authData.session);

  return next();
};
