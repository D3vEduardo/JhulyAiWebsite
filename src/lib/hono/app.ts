import { aiStreamRoute } from "@api/routes/ai/stream/stream.route";
import { authRoute } from "@api/routes/auth/auth.route";
import { usersRoute } from "@api/routes/users/(userId)/users.route";
import { usersMeRoute } from "@api/routes/users/me/usersMe.route";
import { Hono } from "hono";
import { rateLimiter } from "hono-rate-limiter";
import { adminUsersRoute } from "@api/routes/admin/users/adminUsers.route";
import { usersMeChatRoute } from "@api/routes/users/me/chats/userMeChats.route";

export const honoApp = new Hono()
  .basePath("/api")
  .use("*", async (ctx, next) => {
    console.log(
      `Hono API Request: [${ctx.req.method.toUpperCase()}] ${ctx.req.url}`
    );
    await next();
  })
  .use(
    rateLimiter({
      windowMs: 60 * 1_000,
      limit: 100,
      message: "Too many requests, please try again later.",
      standardHeaders: "draft-6",
      keyGenerator(c) {
        return (
          c.req.header("x-forwarded-for") ||
          c.req.header("x-real-ip") ||
          c.req.header("cf-connecting-ip") ||
          c.req.header("fastly-client-ip") ||
          c.req.header("true-client-ip") ||
          c.req.header("x-cluster-client-ip") ||
          c.req.header("x-forwarded") ||
          "default"
        );
      },
    })
  )
  .get("/health", async (c) => {
    return c.json({
      status: "Ok!",
    });
  })
  .route("/auth", authRoute)
  .route("/ai/stream", aiStreamRoute)

  // Users routes - ordem ajustada para que /users/me seja processado antes de /users/:userId
  .route("/users/me", usersMeRoute)
  .route("/users/me/chats", usersMeChatRoute)
  .route("/users/:userId", usersRoute)

  // Admin routes
  .route("/admin/users", adminUsersRoute);
