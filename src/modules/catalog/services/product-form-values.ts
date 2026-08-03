import type { getProductById } from "@/modules/catalog/queries/product.queries";
import type { ProductInput } from "@/modules/catalog/schemas/product.schema";

type Product = NonNullable<Awaited<ReturnType<typeof getProductById>>>;

export const EMPTY_PRODUCT_FORM_VALUES: ProductInput = {
  name: "",
  description: "",
  sku: "",
  internalCode: "",
  model: "TORCEDOR",
  sleeveType: "CURTA",
  price: 0,
  promoPrice: undefined,
  weightGrams: 200,
  isPreOrder: false,
  leadTimeDays: undefined,
  allowsCustomName: true,
  allowsCustomNumber: true,
  allowsPatch: true,
  isActive: true,
  isFeatured: false,
  metaTitle: "",
  metaDescription: "",
  categoryId: "",
  subcategoryId: "",
  brandId: "",
  seasonId: "",
  leagueId: "",
  countryId: "",
  teamId: "",
  images: [],
  videos: [],
  variants: [],
  patches: [],
  relatedProductIds: [],
};

/**
 * Converte um Product do Prisma (campos Decimal) para o shape plano de
 * `ProductInput`, usado como defaultValues do formulário. Precisa rodar no
 * servidor — Decimal não pode atravessar a fronteira Server → Client
 * Component.
 */
export function toProductFormValues(product: Product): ProductInput {
  return {
    name: product.name,
    description: product.description,
    sku: product.sku,
    internalCode: product.internalCode,
    model: product.model,
    sleeveType: product.sleeveType,
    price: Number(product.price),
    promoPrice: product.promoPrice ? Number(product.promoPrice) : undefined,
    weightGrams: product.weightGrams,
    isPreOrder: product.isPreOrder,
    leadTimeDays: product.leadTimeDays ?? undefined,
    allowsCustomName: product.allowsCustomName,
    allowsCustomNumber: product.allowsCustomNumber,
    allowsPatch: product.allowsPatch,
    isActive: product.isActive,
    isFeatured: product.isFeatured,
    metaTitle: product.metaTitle ?? "",
    metaDescription: product.metaDescription ?? "",
    categoryId: product.categoryId,
    subcategoryId: product.subcategoryId ?? "",
    brandId: product.brandId ?? "",
    seasonId: product.seasonId ?? "",
    leagueId: product.leagueId ?? "",
    countryId: product.countryId ?? "",
    teamId: product.teamId ?? "",
    images: product.images.map((image) => ({ url: image.url })),
    videos: product.videos.map((video) => ({ url: video.url })),
    variants: product.variants.map((variant) => ({
      id: variant.id,
      size: variant.size,
      sku: variant.sku,
      stockQuantity: variant.stockQuantity,
      lowStockThreshold: variant.lowStockThreshold,
      priceOverride: variant.priceOverride
        ? Number(variant.priceOverride)
        : undefined,
    })),
    patches: product.patches.map((patch) => ({
      id: patch.id,
      name: patch.name,
      price: Number(patch.price),
    })),
    relatedProductIds: product.relatedFrom.map((rel) => rel.relatedProductId),
  };
}
