import { authMiddleware } from "@/api/middlewares/auth/auth.middleware";
import { userSelectQuerySchema } from "@/api/schemas/userQuery.schema";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import z from "zod";

const userSelectQuerySchemaOmited = userSelectQuerySchema
  .omit({
    messages: true,
    chats: true,
    apiKey: true,
  })
  .strict();

export const usersMeRoute = new Hono().use("*", authMiddleware).get(
  "/",
  zValidator(
    "json",
    z.object({
      select: userSelectQuerySchemaOmited,
    }),
  ),
  async (c) => {
    const body = c.req.valid("json");
    const user = userSelectQuerySchemaOmited.parse(c.get("user"));

    const finalSelect = Object.fromEntries(
      Object.entries(body.select).filter(([, value]) => value === true),
    );

    const userWithSelect =
      Object.keys(finalSelect).length > 0
        ? Object.fromEntries(
            Object.entries(user).filter(([key]) => finalSelect[key] === true),
          )
        : user;

    return c.json({
      message: "User fetched successfully!",
      data: userWithSelect,
    });
  },
);
