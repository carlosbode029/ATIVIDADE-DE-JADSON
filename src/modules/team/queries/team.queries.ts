import { prisma } from "@/lib/prisma";

export function listStaffUsers() {
  return prisma.user.findMany({
    where: { role: { in: ["ADMIN", "STAFF"] } },
    orderBy: { name: "asc" },
  });
}
