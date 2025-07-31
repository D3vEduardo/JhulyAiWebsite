import { z } from "zod";
import { userSchema } from "./userSchema";

export const onboardingFormSchema = userSchema
  .pick({
    name: true,
    email: true,
    apiKey: true,
  })
  .extend({
    apiKey: z
      .string({
        error: "API Key is required!",
      })
      .min(1, "API Key is required!"),
  });
