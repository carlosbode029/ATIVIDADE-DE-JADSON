import type { Metadata } from "next";

import { CouponManager } from "@/components/admin/coupon-manager";
import { listCoupons } from "@/modules/marketing/queries/coupon.queries";

export const metadata: Metadata = {
  title: "Cupons",
};

export default async function AdminCuponsPage() {
  const coupons = await listCoupons();

  return (
    <CouponManager
      coupons={coupons.map((coupon) => ({
        ...coupon,
        value: Number(coupon.value),
        minOrderValue: coupon.minOrderValue ? Number(coupon.minOrderValue) : null,
      }))}
    />
  );
}
