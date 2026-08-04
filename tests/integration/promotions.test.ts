import { afterEach, beforeAll, describe, expect, it } from "vitest";

import { prisma } from "@/lib/prisma";

/**
 * Reproduz a lógica de src/modules/marketing/actions/promotion.actions.ts
 * (a Server Action real exige contexto de auth do Next.js).
 */
async function getAffectedProductIds(promotionId: string): Promise<string[]> {
  const promotion = await prisma.promotion.findUniqueOrThrow({
    where: { id: promotionId },
    include: { products: true, categories: true },
  });

  const categoryIds = promotion.categories.map((c) => c.categoryId);
  const productsInCategories = categoryIds.length
    ? await prisma.product.findMany({
        where: { OR: [{ categoryId: { in: categoryIds } }, { subcategoryId: { in: categoryIds } }] },
        select: { id: true },
      })
    : [];

  return [
    ...new Set([
      ...promotion.products.map((p) => p.productId),
      ...productsInCategories.map((p) => p.id),
    ]),
  ];
}

async function applyPromotion(promotionId: string) {
  const promotion = await prisma.promotion.findUniqueOrThrow({ where: { id: promotionId } });
  const productIds = await getAffectedProductIds(promotionId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: { id: true, price: true },
  });

  const discountType = promotion.discountType;
  const discountValue = Number(promotion.discountValue);

  await prisma.$transaction(
    products.map((product) => {
      const price = Number(product.price);
      const raw =
        discountType === "PERCENTAGE" ? price * (1 - discountValue / 100) : price - discountValue;
      const promoPrice = Math.max(0, Math.round(raw * 100) / 100);
      return prisma.product.update({ where: { id: product.id }, data: { promoPrice } });
    }),
  );
}

async function removePromotionDiscount(promotionId: string) {
  const productIds = await getAffectedProductIds(promotionId);
  if (productIds.length > 0) {
    await prisma.product.updateMany({ where: { id: { in: productIds } }, data: { promoPrice: null } });
  }
}

describe("promoções (Fase 10)", () => {
  let category: Awaited<ReturnType<typeof prisma.category.findFirstOrThrow>>;
  let brand: Awaited<ReturnType<typeof prisma.brand.findFirstOrThrow>>;
  let country: Awaited<ReturnType<typeof prisma.country.findFirstOrThrow>>;
  const createdProductIds: string[] = [];
  const createdPromotionIds: string[] = [];

  beforeAll(async () => {
    category = await prisma.category.findFirstOrThrow({ where: { parentId: null } });
    brand = await prisma.brand.findFirstOrThrow();
    country = await prisma.country.findFirstOrThrow();
  });

  afterEach(async () => {
    for (const id of createdPromotionIds.splice(0)) {
      await prisma.promotion.delete({ where: { id } });
    }
    for (const id of createdProductIds.splice(0)) {
      await prisma.product.delete({ where: { id } });
    }
  });

  async function createTestProduct(name: string, price: number) {
    const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const product = await prisma.product.create({
      data: {
        name,
        slug: `${name.toLowerCase().replace(/\s+/g, "-")}-${unique}`,
        description: "Produto de teste",
        categoryId: category.id,
        brandId: brand.id,
        countryId: country.id,
        model: "TORCEDOR",
        sleeveType: "CURTA",
        sku: `TEST-PROMO-${unique}`,
        internalCode: `INT-${unique}`,
        price,
        weightGrams: 200,
      },
    });
    createdProductIds.push(product.id);
    return product;
  }

  it("aplica desconto percentual a um produto vinculado diretamente", async () => {
    const product = await createTestProduct("Camisa Percentual", 200);
    const promotion = await prisma.promotion.create({
      data: {
        name: "Teste Percentual",
        discountType: "PERCENTAGE",
        discountValue: 20,
        isActive: true,
        products: { create: [{ productId: product.id }] },
      },
    });
    createdPromotionIds.push(promotion.id);

    await applyPromotion(promotion.id);
    const updated = await prisma.product.findUniqueOrThrow({ where: { id: product.id } });
    expect(Number(updated.promoPrice)).toBe(160);
  });

  it("remove o desconto (volta promoPrice para null)", async () => {
    const product = await createTestProduct("Camisa Remover", 200);
    const promotion = await prisma.promotion.create({
      data: {
        name: "Teste Remover",
        discountType: "PERCENTAGE",
        discountValue: 20,
        isActive: true,
        products: { create: [{ productId: product.id }] },
      },
    });
    createdPromotionIds.push(promotion.id);

    await applyPromotion(promotion.id);
    await removePromotionDiscount(promotion.id);

    const updated = await prisma.product.findUniqueOrThrow({ where: { id: product.id } });
    expect(updated.promoPrice).toBeNull();
  });

  it("aplica desconto fixo a produtos vinculados por categoria", async () => {
    const product = await createTestProduct("Camisa Por Categoria", 100);
    const promotion = await prisma.promotion.create({
      data: {
        name: "Teste Fixo Por Categoria",
        discountType: "FIXED",
        discountValue: 30,
        isActive: true,
        categories: { create: [{ categoryId: category.id }] },
      },
    });
    createdPromotionIds.push(promotion.id);

    await applyPromotion(promotion.id);
    const updated = await prisma.product.findUniqueOrThrow({ where: { id: product.id } });
    expect(Number(updated.promoPrice)).toBe(70);
  });

  it("não deixa o preço promocional negativo quando o desconto fixo é maior que o preço", async () => {
    const product = await createTestProduct("Camisa Desconto Grande", 100);
    const promotion = await prisma.promotion.create({
      data: {
        name: "Teste Fixo Maior Que Preço",
        discountType: "FIXED",
        discountValue: 500,
        isActive: true,
        products: { create: [{ productId: product.id }] },
      },
    });
    createdPromotionIds.push(promotion.id);

    await applyPromotion(promotion.id);
    const updated = await prisma.product.findUniqueOrThrow({ where: { id: product.id } });
    expect(Number(updated.promoPrice)).toBe(0);
  });

  it("não duplica um produto vinculado diretamente e por categoria ao mesmo tempo", async () => {
    const product = await createTestProduct("Camisa Overlap", 100);
    const promotion = await prisma.promotion.create({
      data: {
        name: "Teste Overlap",
        discountType: "PERCENTAGE",
        discountValue: 10,
        isActive: true,
        products: { create: [{ productId: product.id }] },
        categories: { create: [{ categoryId: category.id }] },
      },
    });
    createdPromotionIds.push(promotion.id);

    const affected = await getAffectedProductIds(promotion.id);
    expect(affected.filter((id) => id === product.id)).toHaveLength(1);
  });
});
