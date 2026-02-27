import { z } from "zod";

export const updateUserRoleSchema = z.object({
  role: z.enum(["SUPER_ADMIN", "ADMIN", "TEACHER", "STUDENT"]),
});

export const updateUserStatusSchema = z.object({
  status: z.enum(["ACTIVE", "SUSPENDED", "BANNED"]),
});

export const grantPackageAccessSchema = z.object({
  packageId: z.string().min(1, "Package ID wajib diisi"),
  expiresAt: z.string().datetime().optional(),
  reason: z.string().max(500).optional(),
});

export type UpdateUserRoleInput = z.infer<typeof updateUserRoleSchema>;
export type UpdateUserStatusInput = z.infer<typeof updateUserStatusSchema>;
export type GrantPackageAccessInput = z.infer<typeof grantPackageAccessSchema>;
