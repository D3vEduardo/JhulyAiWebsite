import NextAuth from "next-auth";
import Discord from "next-auth/providers/discord";
import { env } from "@env";
import GitHub from "next-auth/providers/github";

export const { handlers, auth, signIn, signOut } = NextAuth({
    providers: [
        Discord({
            clientId: env.DISCORD_CLIENT_ID,
            clientSecret: env.DISCORD_CLIENT_SECRET,
        }),
        GitHub({
            clientId: env.GITHUB_CLIENT_ID,
            clientSecret: env.GITHUB_CLIENT_SECRET,
        })
    ],
    secret: env.NEXT_AUTH_SECRET,
    callbacks: {
        async jwt({ token, profile }) {
            if (profile?.id) {
                token.discordId = profile.id;
            }
            return token;
        },
        async session({ session, token }) {
            console.log("Session", session, token);
            return {
                ...session,
                discordId: token.discordId as string
            };
        }
    }
})