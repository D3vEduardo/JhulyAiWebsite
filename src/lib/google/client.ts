import { env } from "@/env";
import { createGoogleGenerativeAI } from "@ai-sdk/google";

export const google = createGoogleGenerativeAI({
  apiKey: env.GOOGLE_API_KEY,
});
