import { z } from "zod";

export const stockMovementTypeValues = ["IN", "OUT", "ADJUSTMENT"] as const;

export const stockMovementSchema = z
  .object({
    variantId: z.string().min(1),
    type: z.enum(stockMovementTypeValues),
    quantity: z.number().int().min(0, "Informe uma quantidade válida"),
    reason: z.string().trim().optional().or(z.literal("")),
  })
  .refine((data) => data.type === "ADJUSTMENT" || data.quantity >= 1, {
    message: "Informe uma quantidade maior que zero",
    path: ["quantity"],
  });

export type StockMovementInput = z.infer<typeof stockMovementSchema>;
