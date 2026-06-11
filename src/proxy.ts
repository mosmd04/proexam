/**
 * ProExam - Route Protection Proxy (formerly middleware.ts)
 * Next.js 16 renamed middleware to proxy. This file runs on the Node.js runtime
 * and intercepts every matched request to enforce authentication and role-based
 * authorization before the request reaches the application.
 *
 * Security model:
 *   - Unauthenticated users → redirect to /login
 *   - Authenticated but unauthorized → redirect to /unauthorized
 *   - JWT is verified on every request using jose (constant-time verification)
 *   - Role checks are optimistic (from JWT payload, not DB) for performance;
 *     secure DB-level checks should be done in Server Actions and API routes.
 */
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const SESSION_COOKIE_NAME = "proexam-session";

function getEncodedKey(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("AUTH_SECRET environment variable is not set.");
  }
  return new TextEncoder().encode(secret);
}

// ---------------------------------------------------------------------------
// Route → Role Mapping
// ---------------------------------------------------------------------------

interface RouteRule {
  pathPrefix: string;
  allowedRoles: string[];
}

/**
 * Define which roles can access which path prefixes.
 * Evaluated in order — first match wins.
 */
const PROTECTED_ROUTES: RouteRule[] = [
  {
    pathPrefix: "/admin",
    allowedRoles: ["SUPER_ADMIN", "UNIVERSITY_ADMIN"],
  },
  {
    pathPrefix: "/teacher",
    allowedRoles: ["SUPER_ADMIN", "UNIVERSITY_ADMIN", "TEACHER"],
  },
  {
    pathPrefix: "/student",
    allowedRoles: ["SUPER_ADMIN", "UNIVERSITY_ADMIN", "TEACHER", "STUDENT"],
  },
  {
    pathPrefix: "/exam/live",
    allowedRoles: ["STUDENT"],
  },
];

/**
 * Public routes that should never be intercepted.
 */
const PUBLIC_ROUTES = [
  "/login",
  "/signup",
  "/unauthorized",
  "/api/auth",
  "/",
];

// ---------------------------------------------------------------------------
// Proxy Function
// ---------------------------------------------------------------------------

export async function proxy(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;

  // 1. Skip public routes
  if (PUBLIC_ROUTES.some((route) => pathname === route || pathname.startsWith(route + "/"))) {
    // If user IS authenticated and hits /login or /signup, redirect to dashboard
    if (pathname === "/login" || pathname === "/signup") {
      const session = await verifyToken(request);
      if (session) {
        const dashboardUrl = getDashboardUrl(session.role as string, request);
        return NextResponse.redirect(dashboardUrl);
      }
    }
    return NextResponse.next();
  }

  // 2. Verify JWT from cookie
  const session = await verifyToken(request);

  if (!session) {
    // Unauthenticated → redirect to login with callback URL
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 3. Check role-based authorization for protected routes
  const matchedRule = PROTECTED_ROUTES.find((rule) =>
    pathname.startsWith(rule.pathPrefix)
  );

  if (matchedRule) {
    const userRole = session.role as string;
    const userRoles = (session.roles as string[]) ?? [userRole];

    const isAuthorized = matchedRule.allowedRoles.some(
      (allowed) => userRoles.includes(allowed)
    );

    if (!isAuthorized) {
      // Authenticated but wrong role → 403
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }
  }

  // 4. Inject user info into request headers for downstream consumption
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-user-id", session.userId as string);
  requestHeaders.set("x-user-role", session.role as string);
  requestHeaders.set("x-user-email", session.email as string);

  if (session.universityId) {
    requestHeaders.set("x-user-university-id", session.universityId as string);
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

// ---------------------------------------------------------------------------
// JWT Verification (lightweight — no DB calls)
// ---------------------------------------------------------------------------

interface TokenPayload {
  userId: string;
  role: string;
  roles: string[];
  email: string;
  universityId: string | null;
  [key: string]: unknown;
}

async function verifyToken(
  request: NextRequest
): Promise<TokenPayload | null> {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getEncodedKey(), {
      algorithms: ["HS256"],
    });
    return payload as unknown as TokenPayload;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getDashboardUrl(role: string, request: NextRequest): URL {
  switch (role) {
    case "SUPER_ADMIN":
    case "UNIVERSITY_ADMIN":
      return new URL("/admin", request.url);
    case "TEACHER":
      return new URL("/teacher", request.url);
    case "STUDENT":
      return new URL("/student", request.url);
    default:
      return new URL("/", request.url);
  }
}

// ---------------------------------------------------------------------------
// Matcher Configuration
// ---------------------------------------------------------------------------

export const config = {
  matcher: [
    /*
     * Match all paths except:
     *   - _next/static (static files)
     *   - _next/image (image optimization)
     *   - favicon.ico, sitemap.xml, robots.txt (metadata files)
     *   - Public assets (images, fonts, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp|woff|woff2|ttf|eot)$).*)",
  ],
};
