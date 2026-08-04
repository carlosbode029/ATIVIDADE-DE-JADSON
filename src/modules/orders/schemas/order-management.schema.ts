import { z } from "zod";

export const updateOrderStatusSchema = z.object({
  orderId: z.string().min(1),
  status: z.enum(["PROCESSING", "DELIVERED"]),
});

export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;

export const updateOrderTrackingSchema = z.object({
  orderId: z.string().min(1),
  carrierId: z.string().min(1),
  trackingCode: z.string().min(1, "Informe o código de rastreio."),
});

export type UpdateOrderTrackingInput = z.infer<typeof updateOrderTrackingSchema>;
