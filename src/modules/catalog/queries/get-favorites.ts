import { prisma } from "@/lib/prisma";

export async function getFavoritedProductIds(
  userId: string,
  productIds: string[],
) {
  if (productIds.length === 0) {
    return new Set<string>();
  }

  const favorites = await prisma.favorite.findMany({
    where: { userId, productId: { in: productIds } },
    select: { productId: true },
  });

  return new Set(favorites.map((favorite) => favorite.productId));
}

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
