import { authMiddleware } from "@/api/middlewares/auth/auth.middleware";
import { userSelectQuerySchema } from "@/api/schemas/userSelectQuery.schema";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import z from "zod";
import { debug } from "debug";
const log = debug("app:api:usersRoute:me");

const userSelectQuerySchemaOmited = userSelectQuerySchema
  .omit({
    // messages: true,
    // chats: true,
    apiKey: true,
  })
  .strict();

export const usersMeRoute = new Hono()
  .use("*", authMiddleware)
  .get("/", zValidator("query", userSelectQuerySchemaOmited), async (c) => {
    try {
      const select = c.req.valid("query");
      const rawUser = c.get("user");

      if (!rawUser) {
        log(`[GET] /api/users/me NOT_FOUND - User not found in context`);
        return c.json({ message: "User not found" }, 404);
      }

      const allowedKeys = Object.keys(userSelectQuerySchemaOmited.shape);
      const userSliced = Object.fromEntries(
        Object.entries(rawUser).filter(([key]) => allowedKeys.includes(key))
      );

      const finalSelect = Object.fromEntries(
        Object.entries(select).filter(([, value]) => value === true)
      );

      const userWithSelect =
        Object.keys(finalSelect).length > 0
          ? Object.fromEntries(
              Object.entries(userSliced).filter(
                ([key]) => finalSelect[key] === true
              )
            )
          : userSliced;

      log(`[GET] /api/users/me - User fetched successfully`);
      return c.json({
        message: "User fetched successfully!",
        data: userWithSelect,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        log(
          `[GET] /api/users/me VALIDATION_ERROR - Invalid query parameters: ${error.message}`
        );
        return c.json(
          { message: "Invalid query parameters", errors: error.issues },
          400
        );
      }

      log(
        `[GET] /api/users/me INTERNAL_ERROR - ${error instanceof Error ? error.message : "Unknown error"}`
      );
      return c.json({ message: "Internal server error" }, 500);
    }
  });
