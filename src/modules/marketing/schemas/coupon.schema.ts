import { z } from "zod";

export const discountTypeValues = ["PERCENTAGE", "FIXED"] as const;

export const couponSchema = z.object({
  code: z
    .string()
    .trim()
    .min(3, "O código precisa ter ao menos 3 caracteres")
    .toUpperCase(),
  type: z.enum(discountTypeValues),
  value: z.number().min(0.01, "Informe o valor do desconto"),
  minOrderValue: z.number().min(0).optional(),
  maxUses: z.number().int().min(1).optional(),
  startsAt: z.string().optional().or(z.literal("")),
  expiresAt: z.string().optional().or(z.literal("")),
  isActive: z.boolean(),
});

export type CouponInput = z.infer<typeof couponSchema>;
