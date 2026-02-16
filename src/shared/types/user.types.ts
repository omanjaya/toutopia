export type UserRole = "SUPER_ADMIN" | "ADMIN" | "TEACHER" | "STUDENT";
export type UserStatus = "ACTIVE" | "SUSPENDED" | "BANNED";

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar: string | null;
}
