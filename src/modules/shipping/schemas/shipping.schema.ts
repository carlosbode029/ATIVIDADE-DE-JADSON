import { z } from "zod";

export const carrierSchema = z.object({
  name: z.string().trim().min(1, "Informe o nome da transportadora"),
  trackingUrlTemplate: z
    .string()
    .trim()
    .url("URL inválida")
    .optional()
    .or(z.literal("")),
});

export type CarrierInput = z.infer<typeof carrierSchema>;

export const shippingMethodSchema = z
  .object({
    name: z.string().trim().min(1, "Informe o nome do frete"),
    carrierId: z.string().trim().min(1, "Selecione a transportadora"),
    basePrice: z.number().min(0),
    pricePerKg: z.number().min(0),
    estimatedDaysMin: z.number().int().min(0),
    estimatedDaysMax: z.number().int().min(0),
    isActive: z.boolean(),
  })
  .refine((data) => data.estimatedDaysMax >= data.estimatedDaysMin, {
    message: "O prazo máximo deve ser maior ou igual ao mínimo",
    path: ["estimatedDaysMax"],
  });

export type ShippingMethodInput = z.infer<typeof shippingMethodSchema>;
