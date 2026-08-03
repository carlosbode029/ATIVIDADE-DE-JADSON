"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { recordAuditLog } from "@/lib/audit-log";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slugify";
import { requireAdminUser } from "@/modules/auth/services/require-admin";
import {
  productSchema,
  type ProductInput,
} from "@/modules/catalog/schemas/product.schema";

type ActionResult = { error?: string };

function prismaErrorCode(error: unknown): string | undefined {
  if (typeof error === "object" && error !== null && "code" in error) {
    return (error as { code?: string }).code;
  }
  return undefined;
}

function toNullable<T>(value: T | undefined | ""): T | null {
  return value ? value : null;
}

function buildProductData(data: ProductInput) {
  return {
    name: data.name,
    description: data.description,
    sku: data.sku,
    internalCode: data.internalCode,
    model: data.model,
    sleeveType: data.sleeveType,
    price: data.price,
    promoPrice: data.promoPrice ?? null,
    weightGrams: data.weightGrams,
    isPreOrder: data.isPreOrder,
    leadTimeDays: data.leadTimeDays ?? null,
    allowsCustomName: data.allowsCustomName,
    allowsCustomNumber: data.allowsCustomNumber,
    allowsPatch: data.allowsPatch,
    isActive: data.isActive,
    isFeatured: data.isFeatured,
    metaTitle: toNullable(data.metaTitle),
    metaDescription: toNullable(data.metaDescription),
    categoryId: data.categoryId,
    subcategoryId: toNullable(data.subcategoryId),
    brandId: toNullable(data.brandId),
    seasonId: toNullable(data.seasonId),
    leagueId: toNullable(data.leagueId),
    countryId: toNullable(data.countryId),
    teamId: toNullable(data.teamId),
  };
}

export async function createProduct(input: ProductInput): Promise<ActionResult> {
  const parsed = productSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const admin = await requireAdminUser();
  const data = parsed.data;

  let productId: string;

  try {
    const product = await prisma.product.create({
      data: {
        ...buildProductData(data),
        slug: slugify(data.name),
        images: {
          create: data.images.map((image, index) => ({
            url: image.url,
            order: index,
          })),
        },
        videos: {
          create: data.videos.map((video, index) => ({
            url: video.url,
            order: index,
          })),
        },
        variants: {
          create: data.variants.map((variant) => ({
            size: variant.size,
            sku: variant.sku,
            stockQuantity: variant.stockQuantity,
            lowStockThreshold: variant.lowStockThreshold,
            priceOverride: variant.priceOverride ?? null,
          })),
        },
        patches: {
          create: data.patches.map((patch) => ({
            name: patch.name,
            price: patch.price,
          })),
        },
        relatedFrom: {
          create: data.relatedProductIds.map((relatedProductId) => ({
            relatedProductId,
          })),
        },
      },
    });
    productId = product.id;
  } catch (error) {
    if (prismaErrorCode(error) === "P2002") {
      return { error: "SKU, código interno ou nome já em uso." };
    }
    throw error;
  }

  await recordAuditLog({
    userId: admin.id,
    action: "CREATE",
    entity: "Product",
    entityId: productId,
  });

  revalidatePath("/admin/produtos");
  redirect(`/admin/produtos/${productId}`);
}

export async function updateProduct(
  id: string,
  input: ProductInput,
): Promise<ActionResult> {
  const parsed = productSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const admin = await requireAdminUser();
  const data = parsed.data;

  try {
    await prisma.$transaction(async (tx) => {
      await tx.product.update({
        where: { id },
        data: buildProductData(data),
      });

      // Imagens e vídeos não têm dependentes: substitui a coleção inteira.
      await tx.productImage.deleteMany({ where: { productId: id } });
      if (data.images.length > 0) {
        await tx.productImage.createMany({
          data: data.images.map((image, index) => ({
            productId: id,
            url: image.url,
            order: index,
          })),
        });
      }

      await tx.productVideo.deleteMany({ where: { productId: id } });
      if (data.videos.length > 0) {
        await tx.productVideo.createMany({
          data: data.videos.map((video, index) => ({
            productId: id,
            url: video.url,
            order: index,
          })),
        });
      }

      // Variantes e patches podem estar referenciados em pedidos: reconcilia
      // por id em vez de substituir tudo.
      const existingVariants = await tx.productVariant.findMany({
        where: { productId: id },
        select: { id: true },
      });
      const incomingVariantIds = new Set(
        data.variants.filter((v) => v.id).map((v) => v.id),
      );
      const variantIdsToRemove = existingVariants
        .map((v) => v.id)
        .filter((existingId) => !incomingVariantIds.has(existingId));

      if (variantIdsToRemove.length > 0) {
        await tx.productVariant.deleteMany({
          where: { id: { in: variantIdsToRemove } },
        });
      }

      for (const variant of data.variants) {
        const variantData = {
          size: variant.size,
          sku: variant.sku,
          stockQuantity: variant.stockQuantity,
          lowStockThreshold: variant.lowStockThreshold,
          priceOverride: variant.priceOverride ?? null,
        };

        if (variant.id) {
          await tx.productVariant.update({
            where: { id: variant.id },
            data: variantData,
          });
        } else {
          await tx.productVariant.create({
            data: { ...variantData, productId: id },
          });
        }
      }

      const existingPatches = await tx.productPatch.findMany({
        where: { productId: id },
        select: { id: true },
      });
      const incomingPatchIds = new Set(
        data.patches.filter((p) => p.id).map((p) => p.id),
      );
      const patchIdsToRemove = existingPatches
        .map((p) => p.id)
        .filter((existingId) => !incomingPatchIds.has(existingId));

      if (patchIdsToRemove.length > 0) {
        await tx.productPatch.deleteMany({
          where: { id: { in: patchIdsToRemove } },
        });
      }

      for (const patch of data.patches) {
        if (patch.id) {
          await tx.productPatch.update({
            where: { id: patch.id },
            data: { name: patch.name, price: patch.price },
          });
        } else {
          await tx.productPatch.create({
            data: { productId: id, name: patch.name, price: patch.price },
          });
        }
      }

      // Produtos relacionados: join simples, sem dependentes.
      await tx.relatedProduct.deleteMany({ where: { productId: id } });
      if (data.relatedProductIds.length > 0) {
        await tx.relatedProduct.createMany({
          data: data.relatedProductIds.map((relatedProductId) => ({
            productId: id,
            relatedProductId,
          })),
        });
      }
    });
  } catch (error) {
    const code = prismaErrorCode(error);
    if (code === "P2002") {
      return { error: "SKU, código interno ou nome já em uso." };
    }
    if (code === "P2003" || code === "P2014") {
      return {
        error:
          "Não foi possível remover um tamanho/patch já usado em pedidos existentes.",
      };
    }
    throw error;
  }

  await recordAuditLog({
    userId: admin.id,
    action: "UPDATE",
    entity: "Product",
    entityId: id,
  });

  revalidatePath("/admin/produtos");
  revalidatePath(`/admin/produtos/${id}`);
  return {};
}

export async function deleteProduct(id: string): Promise<ActionResult> {
  const admin = await requireAdminUser();

  try {
    await prisma.product.delete({ where: { id } });
  } catch {
    return {
      error: "Não é possível excluir: existem pedidos vinculados a este produto.",
    };
  }

  await recordAuditLog({
    userId: admin.id,
    action: "DELETE",
    entity: "Product",
    entityId: id,
  });

  revalidatePath("/admin/produtos");
  return {};
}
