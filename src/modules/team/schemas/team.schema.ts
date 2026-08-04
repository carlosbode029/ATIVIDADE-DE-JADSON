import { z } from "zod";

export const roleValues = ["CUSTOMER", "STAFF", "ADMIN"] as const;

export const findUserByEmailSchema = z.object({
  email: z.string().trim().email("Informe um e-mail válido"),
});

export type FindUserByEmailInput = z.infer<typeof findUserByEmailSchema>;

export const updateUserRoleSchema = z.object({
  userId: z.string().min(1),
  role: z.enum(roleValues),
});

export type UpdateUserRoleInput = z.infer<typeof updateUserRoleSchema>;
