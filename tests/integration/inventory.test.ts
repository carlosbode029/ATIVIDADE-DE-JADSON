import { afterEach, beforeAll, describe, expect, it } from "vitest";

import { prisma } from "@/lib/prisma";
import { listStockMovements, listVariantsStock } from "@/modules/inventory/queries/inventory.queries";

/**
 * Reproduz a lógica de src/modules/inventory/actions/inventory.actions.ts
 * (a Server Action real exige contexto de auth do Next.js).
 */
async function applyMovement(
  variantId: string,
  type: "IN" | "OUT" | "ADJUSTMENT",
  quantity: number,
  reason?: string,
) {
  const variant = await prisma.productVariant.findUniqueOrThrow({ where: { id: variantId } });

  let newStock: number;
  let movementQuantity: number;
  let finalReason = reason ?? null;

  if (type === "IN") {
    newStock = variant.stockQuantity + quantity;
    movementQuantity = quantity;
  } else if (type === "OUT") {
    if (quantity > variant.stockQuantity) throw new Error("insufficient-stock");
    newStock = variant.stockQuantity - quantity;
    movementQuantity = quantity;
  } else {
    newStock = quantity;
    movementQuantity = Math.abs(newStock - variant.stockQuantity);
    finalReason = finalReason ?? `Ajuste de ${variant.stockQuantity} para ${newStock}`;
  }

  await prisma.$transaction([
    prisma.productVariant.update({ where: { id: variant.id }, data: { stockQuantity: newStock } }),
    prisma.stockMovement.create({
      data: { productVariantId: variant.id, type, quantity: movementQuantity, reason: finalReason },
    }),
  ]);
}

describe("movimentação de estoque (Fase 8)", () => {
  let product: Awaited<ReturnType<typeof prisma.product.findFirstOrThrow>>;
  let variantId: string;

  beforeAll(async () => {
    product = await prisma.product.findFirstOrThrow();
  });

  afterEach(async () => {
    await prisma.stockMovement.deleteMany({ where: { productVariantId: variantId } });
    await prisma.productVariant.delete({ where: { id: variantId } });
  });

  async function createTestVariant(stockQuantity: number, lowStockThreshold = 5) {
    const variant = await prisma.productVariant.create({
      data: {
        productId: product.id,
        size: "TESTE",
        sku: `TEST-SKU-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        stockQuantity,
        lowStockThreshold,
      },
    });
    variantId = variant.id;
    return variant;
  }

  it("IN soma ao estoque atual", async () => {
    await createTestVariant(10);
    await applyMovement(variantId, "IN", 20, "Reposição");
    const variant = await prisma.productVariant.findUniqueOrThrow({ where: { id: variantId } });
    expect(variant.stockQuantity).toBe(30);
  });

  it("OUT subtrai do estoque atual", async () => {
    await createTestVariant(30);
    await applyMovement(variantId, "OUT", 5, "Venda avulsa");
    const variant = await prisma.productVariant.findUniqueOrThrow({ where: { id: variantId } });
    expect(variant.stockQuantity).toBe(25);
  });

  it("OUT maior que o saldo disponível é bloqueado e não altera o estoque", async () => {
    await createTestVariant(25);
    await expect(applyMovement(variantId, "OUT", 999, "Tentativa inválida")).rejects.toThrow(
      "insufficient-stock",
    );
    const variant = await prisma.productVariant.findUniqueOrThrow({ where: { id: variantId } });
    expect(variant.stockQuantity).toBe(25);
  });

  it("ADJUSTMENT define o valor absoluto e registra o delta em módulo, com motivo automático", async () => {
    await createTestVariant(25);
    await applyMovement(variantId, "ADJUSTMENT", 8);

    const variant = await prisma.productVariant.findUniqueOrThrow({ where: { id: variantId } });
    expect(variant.stockQuantity).toBe(8);

    const movement = await prisma.stockMovement.findFirstOrThrow({
      where: { productVariantId: variantId },
    });
    expect(movement.quantity).toBe(17); // |25 - 8|
    expect(movement.reason).toBe("Ajuste de 25 para 8");
  });

  it("listStockMovements ordena do mais recente para o mais antigo", async () => {
    await createTestVariant(10);
    await applyMovement(variantId, "IN", 5, "primeiro");
    await applyMovement(variantId, "IN", 5, "segundo");

    const history = await listStockMovements(variantId);
    expect(history).toHaveLength(2);
    expect(history[0].reason).toBe("segundo");
    expect(history[1].reason).toBe("primeiro");
  });

  it("listVariantsStock filtra por estoque baixo e por busca (produto/SKU)", async () => {
    const variant = await createTestVariant(3, 5); // 3 <= 5 → estoque baixo

    const lowStockResult = await listVariantsStock({ lowStockOnly: true, query: variant.sku });
    expect(lowStockResult.items.some((v) => v.id === variantId)).toBe(true);

    const allResult = await listVariantsStock({ query: variant.sku, lowStockOnly: false });
    expect(allResult.items.some((v) => v.id === variantId)).toBe(true);

    const noMatch = await listVariantsStock({ query: "sku-que-nao-existe-xyz" });
    expect(noMatch.items).toHaveLength(0);
  });
});
