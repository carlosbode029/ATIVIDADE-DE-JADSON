import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

const PAGE_SIZE = 20;

export type StockVariantRow = {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  size: string;
  stockQuantity: number;
  lowStockThreshold: number;
};

export async function listVariantsStock({
  query,
  lowStockOnly,
  page = 1,
}: {
  query?: string;
  lowStockOnly?: boolean;
  page?: number;
}) {
  const searchFilter = query
    ? Prisma.sql`AND (p.name ILIKE ${`%${query}%`} OR pv.sku ILIKE ${`%${query}%`})`
    : Prisma.empty;
  const lowStockFilter = lowStockOnly
    ? Prisma.sql`AND pv."stockQuantity" <= pv."lowStockThreshold"`
    : Prisma.empty;

  const [items, totalResult] = await Promise.all([
    prisma.$queryRaw<StockVariantRow[]>`
      SELECT
        pv.id,
        pv."productId",
        p.name AS "productName",
        pv.sku,
        pv.size,
        pv."stockQuantity",
        pv."lowStockThreshold"
      FROM "ProductVariant" pv
      JOIN "Product" p ON p.id = pv."productId"
      WHERE TRUE ${searchFilter} ${lowStockFilter}
      ORDER BY p.name ASC, pv.size ASC
      LIMIT ${PAGE_SIZE} OFFSET ${(page - 1) * PAGE_SIZE}
    `,
    prisma.$queryRaw<{ count: bigint }[]>`
      SELECT COUNT(*) as count
      FROM "ProductVariant" pv
      JOIN "Product" p ON p.id = pv."productId"
      WHERE TRUE ${searchFilter} ${lowStockFilter}
    `,
  ]);

  const total = Number(totalResult[0]?.count ?? 0);

  return {
    items,
    total,
    page,
    pageSize: PAGE_SIZE,
    totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  };
}

export function listStockMovements(variantId: string, limit = 20) {
  return prisma.stockMovement.findMany({
    where: { productVariantId: variantId },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: { createdBy: { select: { name: true } } },
  });
}
