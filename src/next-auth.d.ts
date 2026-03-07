import { type DefaultSession } from "next-auth";
import { UserRole } from "@/generated/prisma/enums.ts";

export type ExtendedUser = DefaultSession["user"] & {
  role: UserRole;
  isTwoFactorEnabled: boolean;
  isOAuth: boolean;
  provider?: string;
};
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: ExtendedUser;
  }
}
