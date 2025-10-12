import { createAuthClient } from "better-auth/react";
import { magicLinkClient, adminClient } from "better-auth/client/plugins";
import { clientEnv } from "@/client.env";

export const authClient = createAuthClient({
  plugins: [magicLinkClient(), adminClient()],
  baseURL: clientEnv.NEXT_PUBLIC_APP_URL,
});
