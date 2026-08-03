import { prisma } from "@/lib/prisma";

export async function getCatalogStats() {
  const [productCount, categoryCount, lowStockVariantCount] =
    await Promise.all([
      prisma.product.count(),
      prisma.category.count(),
      prisma.$queryRaw<
        { count: bigint }[]
      >`SELECT COUNT(*) as count FROM "ProductVariant" WHERE "stockQuantity" <= "lowStockThreshold"`,
    ]);

  return {
    productCount,
    categoryCount,
    lowStockCount: Number(lowStockVariantCount[0]?.count ?? 0),
  };
}
