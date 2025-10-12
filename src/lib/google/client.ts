import { serverEnv as env } from "@server.env";
import { createGoogleGenerativeAI } from "@ai-sdk/google";

export const google = createGoogleGenerativeAI({
  apiKey: env.GOOGLE_API_KEY,
});
