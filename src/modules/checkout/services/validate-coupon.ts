import { prisma } from "@/lib/prisma";
import type { Coupon } from "@/generated/prisma/client";

type ValidateCouponResult =
  | { ok: false; error: string }
  | { ok: true; coupon: Coupon; discount: number };

export async function validateCoupon(
  code: string,
  subtotal: number,
): Promise<ValidateCouponResult> {
  const coupon = await prisma.coupon.findUnique({
    where: { code: code.trim().toUpperCase() },
  });

  if (!coupon) {
    return { ok: false, error: "Cupom não encontrado." };
  }
  if (!coupon.isActive) {
    return { ok: false, error: "Cupom inativo." };
  }

  const now = new Date();
  if (coupon.startsAt && now < coupon.startsAt) {
    return { ok: false, error: "Este cupom ainda não é válido." };
  }
  if (coupon.expiresAt && now > coupon.expiresAt) {
    return { ok: false, error: "Este cupom expirou." };
  }
  if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
    return { ok: false, error: "Este cupom atingiu o limite de usos." };
  }
  if (coupon.minOrderValue && subtotal < Number(coupon.minOrderValue)) {
    return {
      ok: false,
      error: `Pedido mínimo de R$ ${Number(coupon.minOrderValue).toFixed(2)} para usar este cupom.`,
    };
  }

  const rawDiscount =
    coupon.type === "PERCENTAGE"
      ? subtotal * (Number(coupon.value) / 100)
      : Number(coupon.value);

  return { ok: true, coupon, discount: Math.min(rawDiscount, subtotal) };
}
