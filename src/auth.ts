import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "@/lib/prisma";
import type { Role } from "@prisma/client";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = (token.id as string) || (token.sub as string);
        session.user.role = (token.role as Role) || "USER";
        if (token.picture && !session.user.image) {
          session.user.image = token.picture as string;
        }
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: Role }).role || "USER";
      }
      // Always synchronize role with PostgreSQL so role promotions/demotions take effect immediately
      const lookupId = (token.id as string) || token.sub;
      if (lookupId) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: lookupId },
            select: { role: true },
          });
          if (dbUser) {
            token.role = dbUser.role;
          }
        } catch {
          // Keep existing token role if DB lookup temporarily fails
        }
      }
      return token;
    },
  },
  events: {
    async linkAccount({ user, account }) {
      if (account.provider === "google" && user.id) {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            googleId: account.providerAccountId,
            profileImage: user.image ?? undefined,
          },
        });
      }
    },
    async createUser({ user }) {
      if (user.id && user.image) {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            profileImage: user.image,
          },
        });
      }
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
});
