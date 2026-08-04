import { prisma } from "@/lib/prisma";

export function listSuppliers() {
  return prisma.supplier.findMany({ orderBy: { name: "asc" } });
}
