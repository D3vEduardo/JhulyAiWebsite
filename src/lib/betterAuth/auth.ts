import { prismaAdapter } from "better-auth/adapters/prisma";
import { admin, magicLink } from "better-auth/plugins";
import { nextCookies } from "better-auth/next-js";
import { betterAuth } from "better-auth";
import { serverEnv as env } from "@server.env";
import { clientEnv as clientEnv } from "@client.env";
import { prisma } from "../prisma/client";
import { debug } from "debug";
import { UserRole } from "@prisma/client";

const log = debug("app:auth");

export const auth = betterAuth({
  baseURL: clientEnv.NEXT_PUBLIC_APP_URL,
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  socialProviders: {
    github: {
      clientId: env.GITHUB_CLIENT_ID,
      clientSecret: env.GITHUB_CLIENT_SECRET,
      scope: ["user:email"],
    },
    discord: {
      clientId: env.DISCORD_CLIENT_ID,
      clientSecret: env.DISCORD_CLIENT_SECRET,
    },
  },
  appName: "jhuly-website",

  plugins: [
    magicLink({
      sendMagicLink({ email, token, url }, request) {
        log("Enviando link mágico para:", email);
        log("Token:", token);
        log("URL:", url);
        log("Request:", request);
      },
    }),
    admin({
      adminRoles: UserRole.ADMIN,
      defaultRole: UserRole.USER,
    }),
    nextCookies(),
  ],
  logger: {
    level: "debug",
    disabled: false,
  },
});
