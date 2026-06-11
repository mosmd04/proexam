/**
 * ProExam - Auth Helper
 * Provides `auth()` — a convenience wrapper around getSession()
 * for use in Server Components, Server Actions, and Route Handlers.
 */
import "server-only";

import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import type { AuthUser } from "@/types/auth";

/**
 * Get the current authenticated user.
 * Returns the AuthUser or null if not authenticated.
 */
export async function auth(): Promise<AuthUser | null> {
  return getSession();
}

/**
 * Require authentication — redirects to /login if not authenticated.
 * Use in Server Components and Server Actions that require a logged-in user.
 */
export async function requireAuth(): Promise<AuthUser> {
  const user = await getSession();
  if (!user) {
    redirect("/login");
  }
  return user;
}

/**
 * Require a specific role — redirects to /unauthorized if the user
 * doesn't have any of the specified roles.
 */
export async function requireRole(...allowedRoles: string[]): Promise<AuthUser> {
  const user = await requireAuth();
  const hasRole = allowedRoles.some((role) => user.roles.includes(role));
  if (!hasRole) {
    redirect("/unauthorized");
  }
  return user;
}

/**
 * Require a specific permission — redirects to /unauthorized if the user
 * doesn't have the specified permission key.
 */
export async function requirePermission(
  permissionKey: string
): Promise<AuthUser> {
  const user = await requireAuth();
  if (!user.permissions.includes(permissionKey)) {
    redirect("/unauthorized");
  }
  return user;
}

/**
 * Check if the current user has a specific permission.
 * Does NOT redirect — returns a boolean.
 */
export async function hasPermission(permissionKey: string): Promise<boolean> {
  const user = await getSession();
  if (!user) return false;
  return user.permissions.includes(permissionKey);
}

/**
 * Check if the current user has a specific role.
 * Does NOT redirect — returns a boolean.
 */
export async function hasRole(roleName: string): Promise<boolean> {
  const user = await getSession();
  if (!user) return false;
  return user.roles.includes(roleName);
}
