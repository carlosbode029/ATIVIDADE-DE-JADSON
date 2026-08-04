import { prisma } from "@/lib/prisma";

export async function getOrderStats() {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [totalOrders, pendingOrders, monthEntries] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.financeEntry.findMany({
      where: { date: { gte: monthStart } },
      select: { type: true, amount: true },
    }),
  ]);

  const monthRevenue = monthEntries.reduce((sum, entry) => {
    const amount = Number(entry.amount);
    return entry.type === "INCOME" ? sum + amount : sum - amount;
  }, 0);

  return { totalOrders, pendingOrders, monthRevenue };
}

export function getRecentOrders(limit = 5) {
  return prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    include: { user: { select: { name: true, email: true } } },
  });
}
