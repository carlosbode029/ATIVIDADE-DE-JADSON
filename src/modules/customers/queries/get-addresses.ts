import { prisma } from "@/lib/prisma";

export function getAddressesByUserId(userId: string) {
  return prisma.address.findMany({
    where: { userId },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });
}
