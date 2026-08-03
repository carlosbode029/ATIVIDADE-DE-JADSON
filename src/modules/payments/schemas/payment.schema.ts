import { z } from "zod";

export const cpfSchema = z
  .string()
  .trim()
  .regex(/^\d{11}$/, "Informe um CPF válido (somente números, 11 dígitos)");

export const pixChargeSchema = z.object({
  orderId: z.string().min(1),
  cpf: cpfSchema,
});

export type PixChargeInput = z.infer<typeof pixChargeSchema>;

export const boletoChargeSchema = z.object({
  orderId: z.string().min(1),
  cpf: cpfSchema,
});

export type BoletoChargeInput = z.infer<typeof boletoChargeSchema>;

export const cardChargeSchema = z.object({
  orderId: z.string().min(1),
  cpf: cpfSchema,
  token: z.string().min(1),
  installments: z.number().int().min(1),
  paymentMethodId: z.string().min(1),
  issuerId: z.string().optional(),
});

export type CardChargeInput = z.infer<typeof cardChargeSchema>;
