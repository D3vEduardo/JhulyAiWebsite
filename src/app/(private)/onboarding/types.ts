import { onboardingFormSchema } from "@lib/zod/onboardingFormSchema";
import { UseFormRegister } from "react-hook-form";
import z from "zod";

export type RegisterType = UseFormRegister<
  z.infer<typeof onboardingFormSchema>
>;

export type FieldsType = ["name", "email", "apiKey"];
