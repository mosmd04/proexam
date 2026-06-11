/**
 * ProExam - Data Access Layer (DAL) for Authentication
 * Centralizes all auth-related database queries.
 * This module is server-only and must never be imported in client components.
 */
import "server-only";

import prisma from "@/lib/prisma";

/**
 * Fetch a user by email with their roles and permissions for authentication.
 * This is the primary query used during the login flow.
 */
export async function getUserByEmailWithRoles(email: string) {
  return prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      name: true,
      email: true,
      passwordHash: true,
      isActive: true,
      userRoles: {
        select: {
          role: {
            select: {
              name: true,
              rolePermissions: {
                select: {
                  permission: {
                    select: {
                      key: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
      institutionUsers: {
        select: {
          universityId: true,
        },
        take: 1,
      },
    },
  });
}

/**
 * Extracts a flat list of role names from the user query result.
 */
export function extractRoleNames(
  userRoles: {
    role: {
      name: string;
      rolePermissions: { permission: { key: string } }[];
    };
  }[]
): string[] {
  return userRoles.map((ur) => ur.role.name);
}

/**
 * Extracts a deduplicated flat list of permission keys from the user query result.
 */
export function extractPermissionKeys(
  userRoles: {
    role: {
      name: string;
      rolePermissions: { permission: { key: string } }[];
    };
  }[]
): string[] {
  const keys = new Set<string>();
  for (const ur of userRoles) {
    for (const rp of ur.role.rolePermissions) {
      keys.add(rp.permission.key);
    }
  }
  return Array.from(keys);
}

/**
 * Determines the primary (highest-privilege) role from a list of role names.
 * Priority order: SUPER_ADMIN > UNIVERSITY_ADMIN > TEACHER > STUDENT
 */
export function getPrimaryRole(roleNames: string[]): string {
  const priority = ["SUPER_ADMIN", "UNIVERSITY_ADMIN", "TEACHER", "STUDENT"];
  for (const role of priority) {
    if (roleNames.includes(role)) {
      return role;
    }
  }
  return roleNames[0] ?? "STUDENT";
}

/**
 * Update the user's lastLoginAt timestamp.
 */
export async function updateLastLogin(userId: string): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: { lastLoginAt: new Date() },
  });
}
