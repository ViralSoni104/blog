import { auth } from "@/auth";
import { redirect } from "next/navigation";

export const currentUser = async () => {
  const session = await auth();
  return session?.user;
};

export const authRedirect = async () => {
  const session = await auth();
  // 1. Check session on the server
  if (!session) {
    // 2. Redirect happens before the browser even sees the page
    redirect("/auth/login");
  }
  return session;
};

export const homeRedirect = async () => {
  const session = await auth();
  if (session) {
    redirect("/");
  }
};
