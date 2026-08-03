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
