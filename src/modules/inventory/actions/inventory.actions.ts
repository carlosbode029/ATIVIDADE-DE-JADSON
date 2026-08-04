"use server";

import { revalidatePath } from "next/cache";

import { recordAuditLog } from "@/lib/audit-log";
import { prisma } from "@/lib/prisma";
import { requireAdminUser } from "@/modules/auth/services/require-admin";
import { listStockMovements } from "@/modules/inventory/queries/inventory.queries";
import {
  stockMovementSchema,
  type StockMovementInput,
} from "@/modules/inventory/schemas/inventory.schema";

type ActionResult = { error?: string };

export async function getStockMovements(variantId: string) {
  await requireAdminUser();
  return listStockMovements(variantId);
}

export async function createStockMovement(
  input: StockMovementInput,
): Promise<ActionResult> {
  const parsed = stockMovementSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const admin = await requireAdminUser();

  const variant = await prisma.productVariant.findUnique({
    where: { id: parsed.data.variantId },
  });
  if (!variant) return { error: "Variante não encontrada." };

  let newStock: number;
  let movementQuantity: number;
  let reason = parsed.data.reason || null;

  if (parsed.data.type === "IN") {
    newStock = variant.stockQuantity + parsed.data.quantity;
    movementQuantity = parsed.data.quantity;
  } else if (parsed.data.type === "OUT") {
    if (parsed.data.quantity > variant.stockQuantity) {
      return { error: "Quantidade maior que o estoque disponível." };
    }
    newStock = variant.stockQuantity - parsed.data.quantity;
    movementQuantity = parsed.data.quantity;
  } else {
    // ADJUSTMENT: a quantidade informada é o novo valor absoluto de estoque.
    newStock = parsed.data.quantity;
    movementQuantity = Math.abs(newStock - variant.stockQuantity);
    reason = reason ?? `Ajuste de ${variant.stockQuantity} para ${newStock}`;
  }

  await prisma.$transaction([
    prisma.productVariant.update({
      where: { id: variant.id },
      data: { stockQuantity: newStock },
    }),
    prisma.stockMovement.create({
      data: {
        productVariantId: variant.id,
        type: parsed.data.type,
        quantity: movementQuantity,
        reason,
        createdById: admin.id,
      },
    }),
  ]);

  await recordAuditLog({
    userId: admin.id,
    action: "UPDATE",
    entity: "ProductVariant",
    entityId: variant.id,
    metadata: {
      type: parsed.data.type,
      from: variant.stockQuantity,
      to: newStock,
    },
  });

  revalidatePath("/admin/estoque");
  revalidatePath("/admin");
  return {};
}
