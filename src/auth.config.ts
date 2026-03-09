import type { NextAuthConfig } from "next-auth";
import { getUserByEmail, getUserById } from "@/data/user";
import { LoginSchema } from "@/schemas";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import { UserRole } from "@/generated/prisma/enums";
import { getTwoFactorConfirmationByUserId } from "@/data/two-factor-confirmation";
import { getAccountByUserId } from "@/data/account";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

export default {
  providers: [
    GitHub({
      clientId: process.env.AUTH_GITHUB_CLIENT_ID,
      clientSecret: process.env.AUTH_GITHUB_CLIENT_SECRET,
    }),
    Google({
      clientId: process.env.AUTH_GOOGLE_CLIENT_ID,
      clientSecret: process.env.AUTH_GOOGLE_CLIENT_SECRET,
    }),
    // Logic: Replace the empty Credentials provider
    Credentials({
      async authorize(credentials) {
        const validatedFields = LoginSchema.safeParse(credentials);
        if (validatedFields.success) {
          const { email, password } = validatedFields.data;

          const user = await getUserByEmail(email);
          if (!user || !user.password) {
            return null;
          }

          const isPasswordValid = await bcrypt.compare(password, user.password);
          if (!isPasswordValid || !user.emailVerified) {
            return null;
          }
          return user;
        }
        return null;
      },
    }),
  ],
  pages: {
    signIn: "/auth/login",
    error: "/auth/login",
  },
  events: {
    async linkAccount({ user }) {
      await db.user.update({
        where: { id: user.id },
        data: { emailVerified: new Date() },
      });
    },
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider !== "credentials") return true;
      if (!user.id) return false;
      const exsisitingUser = await getUserById(user.id);
      if (!exsisitingUser || !exsisitingUser.emailVerified) {
        return false;
      }
      if (exsisitingUser.isTwoFactorEnabled) {
        const twoFactorConfirmation = await getTwoFactorConfirmationByUserId(
          exsisitingUser.id,
        );

        // If no confirmation record exists in DB, it means they haven't entered the 6-digit code yet
        if (!twoFactorConfirmation) return false;

        // If it exists, they just verified it! Delete it for next time and let them in.
        await db.twoFactorConfirmation.delete({
          where: { id: twoFactorConfirmation.id },
        });
      }
      return true;
    },
    async jwt({ token, trigger, session }) {
      if (token.sub) {
        const exsisitingUser = await getUserById(token.sub);
        if (exsisitingUser) {
          const existingAccount = await getAccountByUserId(exsisitingUser.id);
          if (trigger === "update" && session) {
            // This merges any new data passed to update() into the token
            token.name = session.name || exsisitingUser.name;
            token.email = session.email || exsisitingUser.email;
            token.image = session.image || exsisitingUser.image;
            token.role = session.role || exsisitingUser.role;
            token.isTwoFactorEnabled =
              session.isTwoFactorEnabled !== undefined
                ? session.isTwoFactorEnabled
                : exsisitingUser.isTwoFactorEnabled;
          } else {
            token.isOAuth = !!existingAccount;
            token.provider = existingAccount?.provider;
            token.image = exsisitingUser.image;
            token.name = exsisitingUser.name;
            token.email = exsisitingUser.email;
            token.role = exsisitingUser.role;
            token.isTwoFactorEnabled = exsisitingUser.isTwoFactorEnabled;
          }
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      if (session.user && token.role) {
        session.user.role = token.role as UserRole;
      }
      if (session.user) {
        session.user.isTwoFactorEnabled = token.isTwoFactorEnabled as boolean;
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.isOAuth = token.isOAuth as boolean;
        // 3. Pass provider and image to the session object
        session.user.provider = token.provider as string;
        session.user.image = token.image as string;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
