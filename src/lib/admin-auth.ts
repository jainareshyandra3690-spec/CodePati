import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import type { Role } from "@prisma/client";

export interface AuthenticatedAdminUser {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  role: Role;
}

export type AdminAuthResult =
  | { status: "UNAUTHENTICATED" }
  | { status: "FORBIDDEN"; user: AuthenticatedAdminUser }
  | { status: "AUTHORIZED"; user: AuthenticatedAdminUser };

/**
 * Verifies the current request session on the server against PostgreSQL.
 * Never trusts client-side state alone.
 */
export async function getAdminAuthStatus(): Promise<AdminAuthResult> {
  const session = await auth();
  if (!session?.user) {
    return { status: "UNAUTHENTICATED" };
  }

  const userId = session.user.id;
  const userEmail = session.user.email;

  const dbUser = await prisma.user.findFirst({
    where: userId
      ? { id: userId }
      : userEmail
      ? { email: userEmail }
      : undefined,
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      profileImage: true,
      role: true,
    },
  });

  if (!dbUser) {
    return { status: "UNAUTHENTICATED" };
  }

  const normalizedUser: AuthenticatedAdminUser = {
    id: dbUser.id,
    name: dbUser.name,
    email: dbUser.email,
    image: dbUser.image || dbUser.profileImage || session.user.image || null,
    role: dbUser.role,
  };

  if (dbUser.role !== "ADMIN") {
    return { status: "FORBIDDEN", user: normalizedUser };
  }

  return { status: "AUTHORIZED", user: normalizedUser };
}

/**
 * Enforces ADMIN role inside Server Actions / mutations.
 * Throws a descriptive authorization error if not an authenticated ADMIN.
 */
export async function requireAdminUser(): Promise<AuthenticatedAdminUser> {
  const result = await getAdminAuthStatus();
  if (result.status === "UNAUTHENTICATED") {
    throw new Error("Authentication required. Please sign in as an administrator.");
  }
  if (result.status === "FORBIDDEN") {
    throw new Error("Access denied. Administrator privileges (ADMIN) are required for this action.");
  }
  return result.user;
}
