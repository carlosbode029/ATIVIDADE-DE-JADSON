import { prisma } from "@/lib/prisma";

export function listBannersAdmin() {
  return prisma.banner.findMany({
    orderBy: [{ position: "asc" }, { order: "asc" }],
  });
}

export function listActiveBanners(position: string) {
  const now = new Date();
  return prisma.banner.findMany({
    where: {
      position,
      isActive: true,
      AND: [
        { OR: [{ startsAt: null }, { startsAt: { lte: now } }] },
        { OR: [{ expiresAt: null }, { expiresAt: { gte: now } }] },
      ],
    },
    orderBy: { order: "asc" },
  });
}
