import { z } from "zod";

export const paymentMethodValues = ["PIX", "CREDIT_CARD", "BOLETO"] as const;

export const checkoutSchema = z.object({
  addressId: z.string().trim().min(1, "Selecione um endereço de entrega"),
  shippingMethodId: z.string().trim().min(1, "Selecione uma opção de frete"),
  couponCode: z.string().trim().optional().or(z.literal("")),
  paymentMethod: z.enum(paymentMethodValues),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
