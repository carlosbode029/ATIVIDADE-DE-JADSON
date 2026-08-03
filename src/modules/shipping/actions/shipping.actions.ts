"use server";

import { revalidatePath } from "next/cache";

import { recordAuditLog } from "@/lib/audit-log";
import { prisma } from "@/lib/prisma";
import { requireAdminUser } from "@/modules/auth/services/require-admin";
import {
  carrierSchema,
  shippingMethodSchema,
  type CarrierInput,
  type ShippingMethodInput,
} from "@/modules/shipping/schemas/shipping.schema";

type ActionResult = { error?: string };

export async function createCarrier(input: CarrierInput): Promise<ActionResult> {
  const parsed = carrierSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const admin = await requireAdminUser();
  const carrier = await prisma.carrier.create({
    data: {
      name: parsed.data.name,
      trackingUrlTemplate: parsed.data.trackingUrlTemplate || null,
    },
  });

  await recordAuditLog({
    userId: admin.id,
    action: "CREATE",
    entity: "Carrier",
    entityId: carrier.id,
  });

  revalidatePath("/admin/transportadoras");
  return {};
}

export async function updateCarrier(
  id: string,
  input: CarrierInput,
): Promise<ActionResult> {
  const parsed = carrierSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const admin = await requireAdminUser();
  await prisma.carrier.update({
    where: { id },
    data: {
      name: parsed.data.name,
      trackingUrlTemplate: parsed.data.trackingUrlTemplate || null,
    },
  });

  await recordAuditLog({
    userId: admin.id,
    action: "UPDATE",
    entity: "Carrier",
    entityId: id,
  });

  revalidatePath("/admin/transportadoras");
  return {};
}

export async function deleteCarrier(id: string): Promise<ActionResult> {
  const admin = await requireAdminUser();

  try {
    await prisma.carrier.delete({ where: { id } });
  } catch {
    return {
      error: "Não é possível excluir: existem fretes ou pedidos vinculados.",
    };
  }

  await recordAuditLog({
    userId: admin.id,
    action: "DELETE",
    entity: "Carrier",
    entityId: id,
  });

  revalidatePath("/admin/transportadoras");
  return {};
}

export async function createShippingMethod(
  input: ShippingMethodInput,
): Promise<ActionResult> {
  const parsed = shippingMethodSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const admin = await requireAdminUser();
  const method = await prisma.shippingMethod.create({ data: parsed.data });

  await recordAuditLog({
    userId: admin.id,
    action: "CREATE",
    entity: "ShippingMethod",
    entityId: method.id,
  });

  revalidatePath("/admin/fretes");
  return {};
}

export async function updateShippingMethod(
  id: string,
  input: ShippingMethodInput,
): Promise<ActionResult> {
  const parsed = shippingMethodSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const admin = await requireAdminUser();
  await prisma.shippingMethod.update({ where: { id }, data: parsed.data });

  await recordAuditLog({
    userId: admin.id,
    action: "UPDATE",
    entity: "ShippingMethod",
    entityId: id,
  });

  revalidatePath("/admin/fretes");
  return {};
}

export async function deleteShippingMethod(id: string): Promise<ActionResult> {
  const admin = await requireAdminUser();

  try {
    await prisma.shippingMethod.delete({ where: { id } });
  } catch {
    return { error: "Não é possível excluir: existem pedidos vinculados." };
  }

  await recordAuditLog({
    userId: admin.id,
    action: "DELETE",
    entity: "ShippingMethod",
    entityId: id,
  });

  revalidatePath("/admin/fretes");
  return {};
}
