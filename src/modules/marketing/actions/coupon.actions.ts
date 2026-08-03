"use server";

import { revalidatePath } from "next/cache";

import { recordAuditLog } from "@/lib/audit-log";
import { prisma } from "@/lib/prisma";
import { requireAdminUser } from "@/modules/auth/services/require-admin";
import {
  couponSchema,
  type CouponInput,
} from "@/modules/marketing/schemas/coupon.schema";

type ActionResult = { error?: string };

function isUniqueConstraintError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "P2002"
  );
}

function buildCouponData(data: CouponInput) {
  return {
    code: data.code,
    type: data.type,
    value: data.value,
    minOrderValue: data.minOrderValue ?? null,
    maxUses: data.maxUses ?? null,
    startsAt: data.startsAt ? new Date(data.startsAt) : null,
    expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
    isActive: data.isActive,
  };
}

export async function createCoupon(input: CouponInput): Promise<ActionResult> {
  const parsed = couponSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const admin = await requireAdminUser();

  try {
    const coupon = await prisma.coupon.create({ data: buildCouponData(parsed.data) });
    await recordAuditLog({
      userId: admin.id,
      action: "CREATE",
      entity: "Coupon",
      entityId: coupon.id,
    });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return { error: "Já existe um cupom com esse código." };
    }
    throw error;
  }

  revalidatePath("/admin/cupons");
  return {};
}

export async function updateCoupon(
  id: string,
  input: CouponInput,
): Promise<ActionResult> {
  const parsed = couponSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const admin = await requireAdminUser();

  try {
    await prisma.coupon.update({
      where: { id },
      data: buildCouponData(parsed.data),
    });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return { error: "Já existe um cupom com esse código." };
    }
    throw error;
  }

  await recordAuditLog({
    userId: admin.id,
    action: "UPDATE",
    entity: "Coupon",
    entityId: id,
  });

  revalidatePath("/admin/cupons");
  return {};
}

export async function deleteCoupon(id: string): Promise<ActionResult> {
  const admin = await requireAdminUser();

  try {
    await prisma.coupon.delete({ where: { id } });
  } catch {
    return { error: "Não é possível excluir: existem pedidos vinculados." };
  }

  await recordAuditLog({
    userId: admin.id,
    action: "DELETE",
    entity: "Coupon",
    entityId: id,
  });

  revalidatePath("/admin/cupons");
  return {};
}
