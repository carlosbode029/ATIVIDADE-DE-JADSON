import { prisma } from "@/lib/prisma";

export function getOrdersByUserId(userId: string) {
  return prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: { items: true, payments: true },
  });
}
