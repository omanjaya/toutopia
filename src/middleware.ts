import NextAuth from "next-auth";
import { authConfig } from "@/shared/lib/auth.config";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const { auth } = NextAuth(authConfig);

const MOBILE_UA_REGEX =
  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile Safari|mobile/i;

function isMobileUserAgent(request: NextRequest): boolean {
  const ua = request.headers.get("user-agent") ?? "";
  return MOBILE_UA_REGEX.test(ua);
}

/** Paths that should never be rewritten to /m/ */
function shouldSkipMobileRewrite(pathname: string): boolean {
  if (pathname === "/m" || pathname.startsWith("/m/")) return true;
  if (pathname.startsWith("/admin")) return true;
  if (pathname.startsWith("/teacher")) return true;
  if (pathname.startsWith("/api/")) return true;
  if (pathname.startsWith("/_next")) return true;
  if (pathname.startsWith("/images")) return true;
  if (pathname.startsWith("/icons")) return true;
  if (pathname.startsWith("/manifest")) return true;
  if (pathname.startsWith("/robots")) return true;
  if (pathname.startsWith("/sw")) return true;
  if (pathname.startsWith("/favicon")) return true;
  return false;
}

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

/** Strip /m prefix to get the canonical path for route matching */
function stripMobilePrefix(pathname: string): string {
  if (pathname === "/m") return "/";
  if (pathname.startsWith("/m/")) return pathname.slice(2);
  return pathname;
}

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const pathname = nextUrl.pathname;
  const isMobile = isMobileUserAgent(req);
  const isMobilePath = pathname === "/m" || pathname.startsWith("/m/");

  // For /m/ routes, use the canonical (non-mobile) path for auth/public checks
  const canonicalPath = stripMobilePrefix(pathname);

  const isPublicRoute =
    publicRoutes.includes(canonicalPath) ||
    (canonicalPath.startsWith("/api/exam/") && canonicalPath.endsWith("/share")) ||
    canonicalPath.startsWith("/packages/") ||
    canonicalPath.startsWith("/leaderboard/") ||
    canonicalPath.startsWith("/blog/") ||
    isPublicApiRoute(canonicalPath) ||
    canonicalPath.startsWith("/_next") ||
    canonicalPath.startsWith("/images") ||
    canonicalPath.startsWith("/icons");

  const isAuthRoute = authRoutes.includes(canonicalPath);
  const isAdminRoute = canonicalPath.startsWith("/admin");
  const isAdminApiRoute = canonicalPath.startsWith("/api/admin");
  const isTeacherRoute = canonicalPath.startsWith("/teacher");
  const isApiRoute = canonicalPath.startsWith("/api");

  if (isAuthRoute && isLoggedIn) {
    const dashboardUrl = isMobile ? "/m/dashboard" : "/dashboard";
    return NextResponse.redirect(new URL(dashboardUrl, nextUrl));
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

  // Mobile rewrite: rewrite desktop paths to /m/ equivalent for mobile users
  if (isMobile && !shouldSkipMobileRewrite(pathname)) {
    const mobilePath = pathname === "/" ? "/m" : `/m${pathname}`;
    const rewriteUrl = new URL(mobilePath, nextUrl);
    rewriteUrl.search = nextUrl.search;
    const response = NextResponse.rewrite(rewriteUrl);
    response.headers.set("x-device-type", "mobile");
    // Security headers
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
    return response;
  }

  const response = NextResponse.next();

  // Set device type header
  response.headers.set("x-device-type", isMobilePath || isMobile ? "mobile" : "desktop");

  // Security headers
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

  return response;
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|images|icons).*)"],
};
