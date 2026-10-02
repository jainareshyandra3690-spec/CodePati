import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import type { Role } from "@prisma/client";

export interface AuthenticatedUser {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  role: Role;
}

export type UserAuthResult =
  | { status: "UNAUTHENTICATED" }
  | { status: "AUTHORIZED"; user: AuthenticatedUser };

/**
 * Retrieves and validates the authenticated user from the database.
 * Never trusts client-side state alone.
 */
export async function getAuthenticatedUser(): Promise<AuthenticatedUser | null> {
  const session = await auth();
  if (!session?.user) {
    return null;
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
    return null;
  }

  return {
    id: dbUser.id,
    name: dbUser.name,
    email: dbUser.email,
    image: dbUser.image || dbUser.profileImage || session.user.image || null,
    role: dbUser.role,
  };
}

/**
 * Enforces authentication inside Server Actions / pages.
 * Throws a descriptive authorization error if unauthenticated.
 */
export async function requireAuthenticatedUser(): Promise<AuthenticatedUser> {
  const user = await getAuthenticatedUser();
  if (!user) {
    throw new Error("Authentication required. Please sign in to perform this action.");
  }
  return user;
}
