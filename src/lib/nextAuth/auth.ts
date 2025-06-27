import NextAuth from "next-auth";
import Discord from "next-auth/providers/discord";
import { env } from "@env";
import GitHub from "next-auth/providers/github";
import { prisma } from "../prisma/client";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Discord({
      clientId: env.DISCORD_CLIENT_ID,
      clientSecret: env.DISCORD_CLIENT_SECRET,
      id: "discord",
      allowDangerousEmailAccountLinking: false,
    }),
    GitHub({
      clientId: env.GITHUB_CLIENT_ID,
      clientSecret: env.GITHUB_CLIENT_SECRET,
      id: "github",
      allowDangerousEmailAccountLinking: false,
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account?.providerAccountId && profile) {
        const accountLinkedASocialMedia =
          await prisma.socialMediaAccount.findUnique({
            where: {
              providerAccountId: account.providerAccountId,
            },
            include: {
              user: true,
            },
          });

        if (!accountLinkedASocialMedia?.user) {
          const newUser = await prisma.user.create({
            data: {
              name: profile.name || profile.nickname,
              email: profile.email,
              socialMediaAccount: {
                create: {
                  providerAccountId: account.providerAccountId,
                  provider: account.provider,
                },
              },
            },
          });

          token.id = newUser.id;
          token.name = newUser.name;
        } else {
          token.id = accountLinkedASocialMedia.user.id;
          token.name = accountLinkedASocialMedia.user.name;
        }
      }
      return token;
    },
    session({ session, token }) {
      console.log("Auth Session - Token:", token);
      if (token.id && token.name) {
        session.user.id = token.id as string;
        session.user.name = token.name as string;
      }

      return session;
    },
  },
  secret: env.NEXT_AUTH_SECRET,
});
