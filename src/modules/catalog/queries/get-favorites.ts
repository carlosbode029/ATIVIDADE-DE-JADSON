import { prisma } from "@/lib/prisma";

export function getFavoritesByUserId(userId: string) {
  return prisma.favorite.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      product: {
        include: { images: { orderBy: { order: "asc" }, take: 1 } },
      },
    },
  });
}
