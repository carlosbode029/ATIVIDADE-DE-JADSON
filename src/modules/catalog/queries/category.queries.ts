import { prisma } from "@/lib/prisma";

export function listCategoryTree() {
  return prisma.category.findMany({
    where: { parentId: null },
    orderBy: { order: "asc" },
    include: {
      children: { orderBy: { order: "asc" } },
    },
  });
}

export function listTopLevelCategories() {
  return prisma.category.findMany({
    where: { parentId: null },
    orderBy: { name: "asc" },
  });
}

export function getCategoryBySlug(slug: string) {
  return prisma.category.findFirst({
    where: { slug, isActive: true },
  });
}

export function listAllCategoriesFlat() {
  return prisma.category.findMany({
    select: { id: true, name: true, parentId: true },
    orderBy: { name: "asc" },
  });
}
