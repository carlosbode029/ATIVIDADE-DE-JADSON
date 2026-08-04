import { z } from "zod";

export const promotionDiscountTypeValues = ["PERCENTAGE", "FIXED"] as const;

export const promotionSchema = z
  .object({
    name: z.string().trim().min(1, "Informe o nome da promoção"),
    description: z.string().trim().optional().or(z.literal("")),
    discountType: z.enum(promotionDiscountTypeValues),
    discountValue: z.number().min(0.01, "Informe o valor do desconto"),
    startsAt: z.string().optional().or(z.literal("")),
    expiresAt: z.string().optional().or(z.literal("")),
    isActive: z.boolean(),
    productIds: z.array(z.string()),
    categoryIds: z.array(z.string()),
  })
  .refine((data) => data.productIds.length > 0 || data.categoryIds.length > 0, {
    message: "Selecione ao menos um produto ou categoria",
    path: ["productIds"],
  })
  .refine(
    (data) => data.discountType !== "PERCENTAGE" || data.discountValue <= 100,
    { message: "Desconto percentual não pode passar de 100%", path: ["discountValue"] },
  );

export type PromotionInput = z.infer<typeof promotionSchema>;
