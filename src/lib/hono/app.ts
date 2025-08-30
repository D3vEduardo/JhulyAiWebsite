import { aiStreamRoute } from "@api/routes/ai/stream/stream.route";
import { authRoute } from "@api/routes/auth/auth.route";
import { Hono } from "hono";
import { rateLimiter } from "hono-rate-limiter";

export const honoApp = new Hono()
  .basePath("/api")
  .use(
    rateLimiter({
      windowMs: 60 * 1000,
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
  .route("/ai/stream", aiStreamRoute);
