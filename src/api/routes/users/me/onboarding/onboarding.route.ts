import { authMiddleware } from "@/api/middlewares/auth/auth.middleware";
import { prisma } from "@/lib/prisma/client";
import { Hono } from "hono";
import { debug } from "debug";
import { zValidator } from "@hono/zod-validator";
import { userSchema } from "@/lib/zod/userSchema";
import { z } from "zod";
import { getUserOnboardingStatus } from "./onboarding.utils";
const log = debug("app:api:usersRoute:me:onboarding:hasCompleted");

export const onboardingRoute = new Hono()
  .use("*", authMiddleware)
  .get("/", async (c) => {
    try {
      const rawUser = c.get("user");
      const apiKey = await prisma.apiKey.findUnique({
        where: {
          userId: rawUser.id,
        },
      });

      const userOnboardingStatus = getUserOnboardingStatus({
        name: rawUser.name,
        email: rawUser.email,
        apiKey: apiKey?.key,
      });

      if (!userOnboardingStatus.hasCompletedOnboarding) {
        log(
          `[GET] /api/users/me/onboarding/hasCompleted - Onboarding not completed for user ${rawUser.id}`
        );
        return c.json(
          {
            message: "Onboarding not completed",
            data: {
              hasCompletedOnboarding: false,
              uncompletedFields: userOnboardingStatus.uncompletedFields,
              defaultValues: {
                name: rawUser.name || "",
                email: rawUser.email || "",
                apiKey: apiKey?.key || "",
              },
            },
          },
          200
        );
      }

      log(
        `[GET] /api/users/me/onboarding/hasCompleted - Onboarding completed for user ${rawUser.id}`
      );
      return c.json(
        {
          message: "Onboarding completed",
          data: { hasCompletedOnboarding: true },
        },
        200
      );
    } catch (error) {
      log(
        `[GET] /api/users/me/onboarding/hasCompleted INTERNAL_ERROR - ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
      return c.json({ message: "Internal server error" }, 500);
    }
  })
  .post(
    "/",
    zValidator(
      "json",
      z.object({
        apiKey: z.string().optional(),
        email: z.email("Email inválido!").optional(),
        name: z.string().optional(),
      })
    ),
    async (c) => {
      try {
        const rawUser = c.get("user");
        const apiKey = await prisma.apiKey.findUnique({
          where: {
            userId: rawUser.id,
          },
          select: {
            key: true,
          },
        });
        const data = c.req.valid("json");

        const receivedUserFields = Object.fromEntries(
          Object.entries(data).filter(
            ([key, value]) => value !== undefined && key !== "apiKey"
          )
        );

        const userOnboardingStatus = getUserOnboardingStatus({
          name: data.name || rawUser.name,
          email: data.email || rawUser.email,
          apiKey: data.apiKey || apiKey?.key,
        });

        if (!userOnboardingStatus.hasCompletedOnboarding) {
          log(
            `[POST] /api/users/me/onboarding - Onboarding not completed, missing fields: ${userOnboardingStatus.uncompletedFields}`
          );
          return c.json(
            {
              message: "Onboarding not completed",
              data: {
                hasCompletedOnboarding: false,
                uncompletedField: userOnboardingStatus.uncompletedFields,
              },
            },
            400
          );
        }

        const user = await prisma.user.update({
          where: {
            id: rawUser.id,
          },
          data: {
            ...receivedUserFields,
          },
        });

        if (data.apiKey) {
          await prisma.apiKey.upsert({
            where: {
              userId: rawUser.id,
            },
            create: {
              key: data.apiKey,
              userId: rawUser.id,
            },
            update: {
              key: data.apiKey,
            },
          });
        }

        const updatedUser = userSchema.safeParse(user);

        if (!updatedUser.success) {
          log(
            `[POST] /api/users/me/onboarding VALIDATION_ERROR - Updated user data is invalid: ${updatedUser.error.message}`
          );

          // Converte os issues do Zod para fieldErrors compatível com RHF
          const fieldErrors: Record<string, string> = {};
          updatedUser.error.issues.forEach((issue) => {
            if (issue.path.length > 0) {
              fieldErrors[issue.path[0] as string] = issue.message;
            }
          });

          return c.json<{
            message: string;
            fieldErrors: Record<string, string>;
          }>(
            {
              message: "Updated user data is invalid",
              fieldErrors,
            },
            400
          );
        }

        log(
          `[POST] /api/users/me/onboarding - Onboarding completed successfully for user ${rawUser.id}`
        );
        return c.json(
          {
            message: "Onboarding completed successfully",
            data: updatedUser.data,
          },
          200
        );
      } catch (error) {
        log(
          `[POST] /api/users/me/onboarding INTERNAL_ERROR - ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
        return c.json({ message: "Internal server error" }, 500);
      }
    }
  );
