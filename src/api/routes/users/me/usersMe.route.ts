import { authMiddleware } from "@/api/middlewares/auth/auth.middleware";

import { Hono } from "hono";
import z from "zod";
import { debug } from "debug";
const log = debug("app:api:usersRoute:me");

export const usersMeRoute = new Hono()
  .use("*", authMiddleware)
  .get("/", async (c) => {
    try {
      const rawUser = c.get("user");

      if (!rawUser) {
        log(`[GET] /api/users/me NOT_FOUND - User not found in context`);
        return c.json({ message: "User not found" }, 404);
      }

      log(`[GET] /api/users/me - User fetched successfully`);
      return c.json({
        message: "User fetched successfully!",
        data: rawUser,
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
