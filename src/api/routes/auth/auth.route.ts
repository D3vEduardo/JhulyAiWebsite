import { auth } from "@/lib/betterAuth/auth";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { env } from "@env";

export const authRoute = new Hono()
  .use(
    "/*",
    cors({
      origin: env.NEXT_PUBLIC_APP_URL,
      allowHeaders: ["Content-Type", "Authorization"],
      allowMethods: ["GET", "POST", "OPTIONS"],
      exposeHeaders: ["Content-Length"],
      maxAge: 600,
      credentials: true,
    }),
  )
  .on(["POST", "GET"], "/*", async (c) => {
    return auth.handler(c.req.raw);
  });
