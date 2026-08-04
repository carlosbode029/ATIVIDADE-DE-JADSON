"use server";

import { revalidatePath } from "next/cache";

import { recordAuditLog } from "@/lib/audit-log";
import { prisma } from "@/lib/prisma";
import { requireAdminUser } from "@/modules/auth/services/require-admin";
import {
  promotionSchema,
  type PromotionInput,
} from "@/modules/marketing/schemas/promotion.schema";

type ActionResult = { error?: string };

function buildPromotionData(data: PromotionInput) {
  return {
    name: data.name,
    description: data.description || null,
    discountType: data.discountType,
    discountValue: data.discountValue,
    startsAt: data.startsAt ? new Date(data.startsAt) : null,
    expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
    isActive: data.isActive,
  };
}

function revalidatePromotions() {
  revalidatePath("/admin/promocoes");
  revalidatePath("/admin/produtos");
  revalidatePath("/");
  revalidatePath("/produtos");
}

export async function createPromotion(input: PromotionInput): Promise<ActionResult> {
  const parsed = promotionSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const admin = await requireAdminUser();

  const promotion = await prisma.promotion.create({
    data: {
      ...buildPromotionData(parsed.data),
      products: {
        create: parsed.data.productIds.map((productId) => ({ productId })),
      },
      categories: {
        create: parsed.data.categoryIds.map((categoryId) => ({ categoryId })),
      },
    },
  });

  await recordAuditLog({
    userId: admin.id,
    action: "CREATE",
    entity: "Promotion",
    entityId: promotion.id,
  });

  revalidatePromotions();
  return {};
}

export async function updatePromotion(
  id: string,
  input: PromotionInput,
): Promise<ActionResult> {
  const parsed = promotionSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const admin = await requireAdminUser();

  await prisma.$transaction([
    prisma.promotion.update({ where: { id }, data: buildPromotionData(parsed.data) }),
    prisma.promotionProduct.deleteMany({ where: { promotionId: id } }),
    prisma.promotionCategory.deleteMany({ where: { promotionId: id } }),
    prisma.promotionProduct.createMany({
      data: parsed.data.productIds.map((productId) => ({ promotionId: id, productId })),
    }),
    prisma.promotionCategory.createMany({
      data: parsed.data.categoryIds.map((categoryId) => ({ promotionId: id, categoryId })),
    }),
  ]);

  await recordAuditLog({
    userId: admin.id,
    action: "UPDATE",
    entity: "Promotion",
    entityId: id,
  });

  revalidatePromotions();
  return {};
}

export async function deletePromotion(id: string): Promise<ActionResult> {
  const admin = await requireAdminUser();

  await prisma.promotion.delete({ where: { id } });
  await recordAuditLog({
    userId: admin.id,
    action: "DELETE",
    entity: "Promotion",
    entityId: id,
  });

  revalidatePromotions();
  return {};
}

async function getAffectedProductIds(promotionId: string): Promise<string[]> {
  const promotion = await prisma.promotion.findUnique({
    where: { id: promotionId },
    include: { products: true, categories: true },
  });
  if (!promotion) return [];

  const categoryIds = promotion.categories.map((c) => c.categoryId);
  const productsInCategories = categoryIds.length
    ? await prisma.product.findMany({
        where: {
          OR: [{ categoryId: { in: categoryIds } }, { subcategoryId: { in: categoryIds } }],
        },
        select: { id: true },
      })
    : [];

  const ids = new Set<string>([
    ...promotion.products.map((p) => p.productId),
    ...productsInCategories.map((p) => p.id),
  ]);

  return [...ids];
}

export async function applyPromotion(promotionId: string): Promise<ActionResult> {
  const admin = await requireAdminUser();

  const promotion = await prisma.promotion.findUnique({ where: { id: promotionId } });
  if (!promotion) return { error: "Promoção não encontrada." };

  const productIds = await getAffectedProductIds(promotionId);
  if (productIds.length === 0) {
    return { error: "Nenhum produto vinculado a esta promoção." };
  }

  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: { id: true, price: true },
  });

  const discountType = promotion.discountType;
  const discountValue = Number(promotion.discountValue);

  await prisma.$transaction(
    products.map((product) => {
      const price = Number(product.price);
      const rawPromoPrice =
        discountType === "PERCENTAGE"
          ? price * (1 - discountValue / 100)
          : price - discountValue;
      const promoPrice = Math.max(0, Math.round(rawPromoPrice * 100) / 100);

      return prisma.product.update({ where: { id: product.id }, data: { promoPrice } });
    }),
  );

  await recordAuditLog({
    userId: admin.id,
    action: "UPDATE",
    entity: "Promotion",
    entityId: promotion.id,
    metadata: { applied: true, productCount: products.length },
  });

  revalidatePromotions();
  return {};
}

export async function removePromotionDiscount(promotionId: string): Promise<ActionResult> {
  const admin = await requireAdminUser();

  const promotion = await prisma.promotion.findUnique({ where: { id: promotionId } });
  if (!promotion) return { error: "Promoção não encontrada." };

  const productIds = await getAffectedProductIds(promotionId);
  if (productIds.length > 0) {
    await prisma.product.updateMany({
      where: { id: { in: productIds } },
      data: { promoPrice: null },
    });
  }

  await recordAuditLog({
    userId: admin.id,
    action: "UPDATE",
    entity: "Promotion",
    entityId: promotion.id,
    metadata: { applied: false, productCount: productIds.length },
  });

  revalidatePromotions();
  return {};
}
