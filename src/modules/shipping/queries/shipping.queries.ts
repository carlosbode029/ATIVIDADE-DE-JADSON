import { prisma } from "@/lib/prisma";

export function listCarriers() {
  return prisma.carrier.findMany({ orderBy: { name: "asc" } });
}

export function listShippingMethods() {
  return prisma.shippingMethod.findMany({
    orderBy: { basePrice: "asc" },
    include: { carrier: true },
  });
}

export function listActiveShippingMethods() {
  return prisma.shippingMethod.findMany({
    where: { isActive: true },
    orderBy: { basePrice: "asc" },
    include: { carrier: true },
  });
}
