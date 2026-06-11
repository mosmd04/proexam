/**
 * ProExam - Authentication Type Definitions
 * Provides type-safe session and JWT payload interfaces.
 */

/**
 * The payload stored inside the signed JWT session cookie.
 * Contains the minimum data needed for auth/authz decisions.
 */
export interface SessionPayload {
  /** User's UUID */
  userId: string;
  /** User's display name */
  name: string;
  /** User's email address */
  email: string;
  /** Primary role name, e.g. "SUPER_ADMIN", "TEACHER", "STUDENT" */
  role: string;
  /** All role names assigned to the user */
  roles: string[];
  /** Permission keys, e.g. ["exam:create", "questions:read"] */
  permissions: string[];
  /** University UUID the user is affiliated with (null if unaffiliated) */
  universityId: string | null;
  /** JWT issued-at timestamp (seconds since epoch) */
  iat: number;
  /** JWT expiration timestamp (seconds since epoch) */
  exp: number;
}

/**
 * Represents the authenticated user available throughout the application.
 * Derived from the SessionPayload after JWT verification.
 */
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
  roles: string[];
  permissions: string[];
  universityId: string | null;
}

/**
 * Result of a login attempt.
 */
export interface LoginResult {
  success: boolean;
  error?: string;
}

/**
 * Validated session returned by verifySession.
 * Contains either a valid user or null if unauthenticated.
 */
export interface VerifiedSession {
  isAuthenticated: true;
  user: AuthUser;
}
