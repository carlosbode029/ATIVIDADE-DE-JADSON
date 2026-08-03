import { prisma } from "@/lib/prisma";

export async function getOrderStats() {
  const [totalOrders, pendingOrders] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({ where: { status: "PENDING" } }),
  ]);

  return { totalOrders, pendingOrders };
}
