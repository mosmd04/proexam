/**
 * ProExam - Auth API Route Handler
 * Provides REST endpoints for authentication operations.
 *
 * POST /api/auth/login - Authenticate and create session
 * POST /api/auth/logout - Destroy session
 * GET  /api/auth/session - Get current session info
 */
import { NextRequest, NextResponse } from "next/server";
import { comparePassword } from "@/lib/hash";
import { createSession, deleteSession, getSession } from "@/lib/session";
import {
  getUserByEmailWithRoles,
  extractRoleNames,
  extractPermissionKeys,
  getPrimaryRole,
  updateLastLogin,
} from "@/lib/dal";

/**
 * GET /api/auth - Returns current session information
 */
export async function GET() {
  const user = await getSession();

  if (!user) {
    return NextResponse.json(
      { authenticated: false, user: null },
      { status: 401 }
    );
  }

  return NextResponse.json({
    authenticated: true,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      roles: user.roles,
      universityId: user.universityId,
    },
  });
}

/**
 * POST /api/auth - Login or logout based on action field
 */
export async function POST(request: NextRequest) {
  const body = await request.json();
  const action = body.action as string;

  if (action === "logout") {
    await deleteSession();
    return NextResponse.json({ success: true, message: "Logged out." });
  }

  if (action === "login") {
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password are required." },
        { status: 400 }
      );
    }

    const user = await getUserByEmailWithRoles(email);

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Invalid email or password." },
        { status: 401 }
      );
    }

    if (!user.isActive) {
      return NextResponse.json(
        { success: false, error: "Account is deactivated." },
        { status: 403 }
      );
    }

    const isPasswordValid = await comparePassword(password, user.passwordHash);
    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, error: "Invalid email or password." },
        { status: 401 }
      );
    }

    const roleNames = extractRoleNames(user.userRoles);
    const permissionKeys = extractPermissionKeys(user.userRoles);
    const primaryRole = getPrimaryRole(roleNames);
    const universityId = user.institutionUsers[0]?.universityId ?? null;

    await createSession({
      userId: user.id,
      name: user.name,
      email: user.email,
      role: primaryRole,
      roles: roleNames,
      permissions: permissionKeys,
      universityId,
    });

    updateLastLogin(user.id).catch(() => {});

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: primaryRole,
        roles: roleNames,
        universityId,
      },
    });
  }

  return NextResponse.json(
    { success: false, error: "Invalid action. Use 'login' or 'logout'." },
    { status: 400 }
  );
}
