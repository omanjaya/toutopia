import NextAuth from "next-auth";
import { authConfig } from "@/shared/lib/auth.config";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const { auth } = NextAuth(authConfig);

const publicRoutes = [
  "/",
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/tryout-utbk",
  "/tryout-cpns",
  "/tryout-bumn",
  "/tryout-kedinasan",
  "/tryout-pppk",
  "/pricing",
  "/packages",
  "/faq",
  "/about",
  "/contact",
  "/privacy",
  "/terms",
  "/leaderboard",
  "/blog",
];

const authRoutes = ["/login", "/register", "/forgot-password", "/reset-password"];

const publicApiPrefixes = [
  "/api/auth",
  "/api/health",
  "/api/articles",
  "/api/categories",
  "/api/search",
  "/api/payment/webhook",
  "/api/og/",
];

function isPublicApiRoute(pathname: string): boolean {
  return publicApiPrefixes.some((prefix) => pathname.startsWith(prefix));
}

function isValidCallbackUrl(url: string): boolean {
  return url.startsWith("/") && !url.includes("//") && !url.includes(":");
}

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const pathname = nextUrl.pathname;

  // Redirect any lingering /m/* paths to their canonical equivalents
  if (pathname === "/m" || pathname.startsWith("/m/")) {
    const canonical = pathname === "/m" ? "/" : pathname.slice(2);
    return NextResponse.redirect(new URL(canonical || "/", nextUrl));
  }

  const isPublicRoute =
    publicRoutes.includes(pathname) ||
    (pathname.startsWith("/api/exam/") && pathname.endsWith("/share")) ||
    pathname.startsWith("/packages/") ||
    pathname.startsWith("/leaderboard/") ||
    pathname.startsWith("/blog/") ||
    isPublicApiRoute(pathname) ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/images") ||
    pathname.startsWith("/icons");

  const isAuthRoute = authRoutes.includes(pathname);
  const isAdminRoute = pathname.startsWith("/admin");
  const isAdminApiRoute = pathname.startsWith("/api/admin");
  const isTeacherRoute = pathname.startsWith("/teacher");
  const isApiRoute = pathname.startsWith("/api");

  if (isAuthRoute && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  // Handle non-public API routes: return 401/403 JSON instead of redirect
  if (isApiRoute && !isPublicRoute) {
    if (!isLoggedIn) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Authentication required" } },
        { status: 401 }
      );
    }

    if (isAdminApiRoute) {
      const role = req.auth?.user?.role;
      if (role !== "SUPER_ADMIN" && role !== "ADMIN") {
        return NextResponse.json(
          { success: false, error: { code: "FORBIDDEN", message: "Admin access required" } },
          { status: 403 }
        );
      }
    }

    const isTeacherApiRoute = pathname.startsWith("/api/teacher");
    if (isTeacherApiRoute) {
      const role = req.auth?.user?.role;
      if (role !== "SUPER_ADMIN" && role !== "ADMIN" && role !== "TEACHER") {
        return NextResponse.json(
          { success: false, error: { code: "FORBIDDEN", message: "Teacher access required" } },
          { status: 403 }
        );
      }
    }
  }

  if (!isPublicRoute && !isLoggedIn && !isApiRoute) {
    const rawCallback = pathname;
    const callbackUrl = isValidCallbackUrl(rawCallback) ? rawCallback : "/dashboard";
    return NextResponse.redirect(
      new URL(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`, nextUrl)
    );
  }

  if (isAdminRoute && !isApiRoute && isLoggedIn) {
    const role = req.auth?.user?.role;
    if (role !== "SUPER_ADMIN" && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", nextUrl));
    }
  }

  if (isTeacherRoute && isLoggedIn) {
    const role = req.auth?.user?.role;
    if (
      role !== "SUPER_ADMIN" &&
      role !== "ADMIN" &&
      role !== "TEACHER"
    ) {
      return NextResponse.redirect(new URL("/dashboard", nextUrl));
    }
  }

  const response = NextResponse.next();
  setSecurityHeaders(response);
  return response;
});

function setSecurityHeaders(response: NextResponse): void {
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()"
  );
  response.headers.set(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains"
  );
  response.headers.set(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://app.sandbox.midtrans.com https://app.midtrans.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' data: blob: https: http://localhost:9000",
      "font-src 'self' data: https://fonts.gstatic.com",
      "connect-src 'self' https://app.sandbox.midtrans.com https://app.midtrans.com https://api.sandbox.midtrans.com https://api.midtrans.com",
      "frame-src 'self' https://app.sandbox.midtrans.com https://app.midtrans.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
    ].join("; ")
  );
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|manifest.json|robots.txt|sw.js|images|icons).*)"],
};
