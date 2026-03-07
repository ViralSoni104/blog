import authConfig from "@/auth.config";
import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import {
  DEFAULT_LOGIN_REDIRECT,
  apiAuthPrefix,
  authRoutes,
  publicRoutePrefixes,
  publicRoutes,
} from "@/route";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { nextUrl } = req;

  // 💡 SECURITY FIX: Always use req.auth.
  // Manually parsing cookies bypasses JWT signature validation and creates a severe vulnerability.
  const isLoggedIn = !!req.auth;

  const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix);
  const isAuthRoute = authRoutes.includes(nextUrl.pathname);
  const isPublicRoute =
    publicRoutes.includes(nextUrl.pathname) ||
    publicRoutePrefixes.some((prefix) => nextUrl.pathname.startsWith(prefix));

  // 1. Let NextAuth API routes pass untouched
  if (isApiAuthRoute) {
    return NextResponse.next();
  }

  // 2. Redirect logged-in users away from Auth pages (Login/Register)
  if (isAuthRoute) {
    if (isLoggedIn) {
      return applySecurityHeaders(
        NextResponse.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl)),
      );
    }
    return applySecurityHeaders(NextResponse.next());
  }

  // 3. Protect private routes
  if (!isLoggedIn && !isPublicRoute) {
    let callbackUrl = nextUrl.pathname;
    if (nextUrl.search) callbackUrl += nextUrl.search;

    const encodedCallbackUrl = encodeURIComponent(callbackUrl);

    return applySecurityHeaders(
      NextResponse.redirect(
        new URL(`/auth/login?callbackUrl=${encodedCallbackUrl}`, nextUrl),
      ),
    );
  }

  // 4. Allow public or authenticated traffic
  return applySecurityHeaders(NextResponse.next());
});

/**
 * 💡 Helper to attach standard security headers to ALL outgoing responses.
 * (Your previous code only attached them to standard responses, missing redirects).
 */
function applySecurityHeaders(response: NextResponse) {
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  return response;
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API and TRPC routes
    "/(api|trpc)(.*)",
  ],
};
