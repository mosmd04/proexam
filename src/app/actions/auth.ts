/**
 * ProExam - Authentication Server Actions
 * Handles login, logout, and signup flows.
 * These are Next.js Server Actions invoked from client forms.
 */
"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { comparePassword, hashPassword } from "@/lib/hash";
import { createSession, deleteSession } from "@/lib/session";
import {
  getUserByEmailWithRoles,
  extractRoleNames,
  extractPermissionKeys,
  getPrimaryRole,
  updateLastLogin,
} from "@/lib/dal";
import prisma from "@/lib/prisma";

// ---------------------------------------------------------------------------
// Validation Schemas
// ---------------------------------------------------------------------------

const LoginSchema = z.object({
  email: z.string().email("Please enter a valid email address.").trim(),
  password: z.string().min(1, "Password is required."),
});

const SignupSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters.")
    .max(255, "Name must be at most 255 characters.")
    .trim(),
  email: z.string().email("Please enter a valid email address.").trim(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .regex(/[a-zA-Z]/, "Password must contain at least one letter.")
    .regex(/[0-9]/, "Password must contain at least one number.")
    .regex(
      /[^a-zA-Z0-9]/,
      "Password must contain at least one special character."
    ),
});

// ---------------------------------------------------------------------------
// Action State Types
// ---------------------------------------------------------------------------

export interface AuthActionState {
  errors?: {
    email?: string[];
    password?: string[];
    name?: string[];
  };
  message?: string;
}

// ---------------------------------------------------------------------------
// Login Action
// ---------------------------------------------------------------------------

export async function login(
  _prevState: AuthActionState | undefined,
  formData: FormData
): Promise<AuthActionState> {
  // 1. Validate input
  const validated = LoginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  const { email, password } = validated.data;

  // 2. Look up user with roles & permissions
  const user = await getUserByEmailWithRoles(email);

  if (!user) {
    return { message: "Invalid email or password." };
  }

  // 3. Check account status
  if (!user.isActive) {
    return {
      message:
        "Your account has been deactivated. Please contact your administrator.",
    };
  }

  // 4. Verify password
  const isPasswordValid = await comparePassword(password, user.passwordHash);
  if (!isPasswordValid) {
    return { message: "Invalid email or password." };
  }

  // 5. Extract roles and permissions
  const roleNames = extractRoleNames(user.userRoles);
  const permissionKeys = extractPermissionKeys(user.userRoles);
  const primaryRole = getPrimaryRole(roleNames);
  const universityId = user.institutionUsers[0]?.universityId ?? null;

  // 6. Create session
  await createSession({
    userId: user.id,
    name: user.name,
    email: user.email,
    role: primaryRole,
    roles: roleNames,
    permissions: permissionKeys,
    universityId,
  });

  // 7. Update last login timestamp (fire-and-forget)
  updateLastLogin(user.id).catch(() => {
    /* non-critical, swallow errors */
  });

  // 8. Redirect based on role
  const dashboardRoute = getDashboardRoute(primaryRole);
  redirect(dashboardRoute);
}

// ---------------------------------------------------------------------------
// Signup Action
// ---------------------------------------------------------------------------

export async function signup(
  _prevState: AuthActionState | undefined,
  formData: FormData
): Promise<AuthActionState> {
  // 1. Validate input
  const validated = SignupSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  const { name, email, password } = validated.data;

  // 2. Check for existing user
  const existingUser = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  if (existingUser) {
    return { message: "An account with this email already exists." };
  }

  // 3. Hash password
  const passwordHash = await hashPassword(password);

  // 4. Create user
  const newUser = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
    },
  });

  // 5. Assign default STUDENT role
  const studentRole = await prisma.role.findUnique({
    where: { name: "STUDENT" },
    select: {
      id: true,
      name: true,
      rolePermissions: {
        select: {
          permission: {
            select: { key: true },
          },
        },
      },
    },
  });

  if (studentRole) {
    await prisma.userRole.create({
      data: {
        userId: newUser.id,
        roleId: studentRole.id,
      },
    });

    const permissionKeys = studentRole.rolePermissions.map(
      (rp) => rp.permission.key
    );

    // 6. Create session
    await createSession({
      userId: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: studentRole.name,
      roles: [studentRole.name],
      permissions: permissionKeys,
      universityId: null,
    });
  } else {
    // No STUDENT role in DB — create session with minimal permissions
    await createSession({
      userId: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: "STUDENT",
      roles: [],
      permissions: [],
      universityId: null,
    });
  }

  redirect("/student");
}

// ---------------------------------------------------------------------------
// Logout Action
// ---------------------------------------------------------------------------

export async function logout(): Promise<void> {
  await deleteSession();
  redirect("/login");
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getDashboardRoute(role: string): string {
  switch (role) {
    case "SUPER_ADMIN":
    case "UNIVERSITY_ADMIN":
      return "/admin";
    case "TEACHER":
      return "/teacher";
    case "STUDENT":
      return "/student";
    default:
      return "/";
  }
}
