import { prisma } from "@/lib/prisma";

export function listPromotions() {
  return prisma.promotion.findMany({
    orderBy: { name: "asc" },
    include: {
      products: { include: { product: { select: { id: true, name: true } } } },
      categories: { include: { category: { select: { id: true, name: true } } } },
    },
  });
}
