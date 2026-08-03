import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";

const PAGE_SIZE = 24;

export type ProductListFilters = {
  q?: string;
  categorySlug?: string;
  teamSlug?: string;
  countryCode?: string;
  leagueSlug?: string;
  seasonId?: string;
  size?: string;
  sort?: "newest" | "price_asc" | "price_desc";
  page?: number;
};

export async function listProductsStorefront(filters: ProductListFilters) {
  const page = filters.page && filters.page > 0 ? filters.page : 1;

  const where: Prisma.ProductWhereInput = { isActive: true };
  const and: Prisma.ProductWhereInput[] = [];

  if (filters.q) {
    and.push({
      OR: [
        { name: { contains: filters.q, mode: "insensitive" } },
        { description: { contains: filters.q, mode: "insensitive" } },
      ],
    });
  }

  if (filters.categorySlug) {
    and.push({
      OR: [
        { category: { slug: filters.categorySlug } },
        { subcategory: { slug: filters.categorySlug } },
      ],
    });
  }

  if (filters.teamSlug) and.push({ team: { slug: filters.teamSlug } });
  if (filters.countryCode) and.push({ country: { code: filters.countryCode } });
  if (filters.leagueSlug) and.push({ league: { slug: filters.leagueSlug } });
  if (filters.seasonId) and.push({ seasonId: filters.seasonId });
  if (filters.size) and.push({ variants: { some: { size: filters.size } } });

  if (and.length > 0) {
    where.AND = and;
  }

  const orderBy: Prisma.ProductOrderByWithRelationInput =
    filters.sort === "price_asc"
      ? { price: "asc" }
      : filters.sort === "price_desc"
        ? { price: "desc" }
        : { createdAt: "desc" };

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        images: { orderBy: { order: "asc" }, take: 1 },
        team: true,
        category: true,
        variants: { select: { size: true, stockQuantity: true } },
      },
    }),
    prisma.product.count({ where }),
  ]);

  return {
    items,
    total,
    page,
    pageSize: PAGE_SIZE,
    totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  };
}

export function getProductBySlug(slug: string) {
  return prisma.product.findFirst({
    where: { slug, isActive: true },
    include: {
      images: { orderBy: { order: "asc" } },
      videos: { orderBy: { order: "asc" } },
      variants: { orderBy: { size: "asc" } },
      patches: true,
      category: true,
      subcategory: true,
      brand: true,
      season: true,
      league: true,
      country: true,
      team: true,
      relatedFrom: {
        include: {
          relatedProduct: {
            include: {
              images: { orderBy: { order: "asc" }, take: 1 },
              team: true,
              category: true,
              variants: { select: { size: true, stockQuantity: true } },
            },
          },
        },
      },
    },
  });
}

const HOME_SECTION_INCLUDE = {
  images: { orderBy: { order: "asc" as const }, take: 1 },
  team: true,
  category: true,
  variants: { select: { size: true, stockQuantity: true } },
} satisfies Prisma.ProductInclude;

export function listLatestProducts(take = 8) {
  return prisma.product.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
    take,
    include: HOME_SECTION_INCLUDE,
  });
}

export function listFeaturedProducts(take = 8) {
  return prisma.product.findMany({
    where: { isActive: true, isFeatured: true },
    orderBy: { createdAt: "desc" },
    take,
    include: HOME_SECTION_INCLUDE,
  });
}

export async function listAvailableSizes() {
  const variants = await prisma.productVariant.findMany({
    where: { product: { isActive: true } },
    select: { size: true },
    distinct: ["size"],
  });

  return variants.map((v) => v.size).sort();
}
