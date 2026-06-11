/**
 * ProExam - Session Management Library
 * Handles JWT-based stateless session encryption, decryption, and cookie management.
 *
 * Uses the `jose` library for Edge-compatible JWT operations and the
 * Next.js `cookies()` API for secure HttpOnly cookie management.
 */
import "server-only";

import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import { cookies } from "next/headers";
import type { SessionPayload, AuthUser } from "@/types/auth";

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const SESSION_COOKIE_NAME = "proexam-session";

/**
 * Session duration: 24 hours.
 * Short-lived to limit window of token theft exploitation.
 */
const SESSION_DURATION_SECONDS = 24 * 60 * 60;

/**
 * Encoded secret key for JWT signing/verification.
 * Must be at least 256 bits (32 bytes) for HS256.
 */
function getEncodedKey(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error(
      "AUTH_SECRET environment variable is not set. " +
        "Generate one with: openssl rand -base64 32"
    );
  }
  return new TextEncoder().encode(secret);
}

// ---------------------------------------------------------------------------
// JWT Encryption / Decryption
// ---------------------------------------------------------------------------

/**
 * Sign and encrypt a session payload into a JWT string.
 */
export async function encrypt(
  payload: Omit<SessionPayload, "iat" | "exp">
): Promise<string> {
  return new SignJWT(payload as unknown as JWTPayload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_SECONDS}s`)
    .sign(getEncodedKey());
}

/**
 * Verify and decrypt a JWT string back into a SessionPayload.
 * Returns null if the token is invalid, expired, or malformed.
 */
export async function decrypt(
  token: string | undefined
): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getEncodedKey(), {
      algorithms: ["HS256"],
    });
    return payload as unknown as SessionPayload;
  } catch {
    // Token is invalid, expired, or tampered with
    return null;
  }
}

// ---------------------------------------------------------------------------
// Cookie-Based Session Management
// ---------------------------------------------------------------------------

/**
 * Create a new authenticated session.
 * Signs the payload into a JWT and stores it in an HttpOnly cookie.
 */
export async function createSession(
  payload: Omit<SessionPayload, "iat" | "exp">
): Promise<void> {
  const expiresAt = new Date(Date.now() + SESSION_DURATION_SECONDS * 1000);
  const session = await encrypt(payload);
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE_NAME, session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    sameSite: "lax",
    path: "/",
  });
}

/**
 * Refresh the current session by extending its expiration.
 * Call this on active requests to implement sliding session expiration.
 */
export async function refreshSession(): Promise<void> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const payload = await decrypt(sessionCookie);

  if (!payload) return;

  const expiresAt = new Date(Date.now() + SESSION_DURATION_SECONDS * 1000);

  // Re-sign with fresh iat/exp
  const { iat, exp, ...rest } = payload;
  const newToken = await encrypt(rest);

  cookieStore.set(SESSION_COOKIE_NAME, newToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    sameSite: "lax",
    path: "/",
  });
}

/**
 * Destroy the current session by deleting the cookie.
 */
export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

/**
 * Retrieve and verify the current session from cookies.
 * Returns the AuthUser if authenticated, or null.
 */
export async function getSession(): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const payload = await decrypt(sessionCookie);

  if (!payload) return null;

  return {
    id: payload.userId,
    name: payload.name,
    email: payload.email,
    role: payload.role,
    roles: payload.roles,
    permissions: payload.permissions,
    universityId: payload.universityId,
  };
}

/**
 * Get the raw session cookie name (for use in proxy/middleware).
 */
export function getSessionCookieName(): string {
  return SESSION_COOKIE_NAME;
}
