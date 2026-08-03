import { prisma } from "@/lib/prisma";

export function getOrderById(id: string) {
  return prisma.order.findUnique({
    where: { id },
    include: {
      items: { include: { patch: true } },
      shippingAddress: true,
      shippingMethod: { include: { carrier: true } },
      coupon: true,
      payments: true,
    },
  });
}
