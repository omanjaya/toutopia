import { auth } from "./auth";
import type { UserRole, SessionUser } from "@/shared/types/user.types";
import { UnauthorizedError, ForbiddenError } from "./api-error";

export async function requireAuth(): Promise<SessionUser> {
  const session = await auth();

  if (!session?.user) {
    throw new UnauthorizedError();
  }

  return session.user as SessionUser;
}

export async function requireRole(
  allowedRoles: UserRole[]
): Promise<SessionUser> {
  const user = await requireAuth();

  if (!allowedRoles.includes(user.role)) {
    throw new ForbiddenError();
  }

  return user;
}

export async function requireAdmin(): Promise<SessionUser> {
  return requireRole(["SUPER_ADMIN", "ADMIN"]);
}

export async function requireTeacher(): Promise<SessionUser> {
  return requireRole(["SUPER_ADMIN", "ADMIN", "TEACHER"]);
}
