import { prisma } from "@/lib/prisma";

export function listCoupons() {
  return prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });
}

export function getCouponByCode(code: string) {
  return prisma.coupon.findUnique({ where: { code: code.trim().toUpperCase() } });
}
