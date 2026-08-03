import { z } from "zod";

export const addToCartSchema = z.object({
  productId: z.string().min(1),
  productVariantId: z.string().min(1),
  quantity: z.number().int().min(1).max(20),
  patchId: z.string().optional().or(z.literal("")),
  customName: z.string().trim().max(20).optional().or(z.literal("")),
  customNumber: z.string().trim().max(2).optional().or(z.literal("")),
});

export type AddToCartInput = z.infer<typeof addToCartSchema>;
