import { z } from "zod";

export const productModelValues = ["TORCEDOR", "JOGADOR"] as const;
export const sleeveTypeValues = ["CURTA", "LONGA"] as const;

const optionalId = z.string().trim().optional().or(z.literal(""));

export const productVariantSchema = z.object({
  id: optionalId,
  size: z.string().trim().min(1, "Informe o tamanho"),
  sku: z.string().trim().min(1, "Informe o SKU da variante"),
  stockQuantity: z.number().int().min(0, "Estoque não pode ser negativo"),
  lowStockThreshold: z.number().int().min(0),
  priceOverride: z.number().min(0).optional(),
});

export type ProductVariantInput = z.infer<typeof productVariantSchema>;

export const productPatchSchema = z.object({
  id: optionalId,
  name: z.string().trim().min(1, "Informe o nome do patch"),
  price: z.number().min(0),
});

export type ProductPatchInput = z.infer<typeof productPatchSchema>;

export const productMediaSchema = z.object({
  url: z.string().trim().url("URL inválida"),
});

export type ProductMediaInput = z.infer<typeof productMediaSchema>;

export const productSchema = z.object({
  name: z.string().trim().min(1, "Informe o nome"),
  description: z.string().trim().min(1, "Informe a descrição"),
  sku: z.string().trim().min(1, "Informe o SKU"),
  internalCode: z.string().trim().min(1, "Informe o código interno"),
  model: z.enum(productModelValues),
  sleeveType: z.enum(sleeveTypeValues),
  price: z.number().min(0, "Informe o preço"),
  promoPrice: z.number().min(0).optional(),
  weightGrams: z.number().int().min(1, "Informe o peso em gramas"),
  isPreOrder: z.boolean(),
  leadTimeDays: z.number().int().min(0).optional(),
  allowsCustomName: z.boolean(),
  allowsCustomNumber: z.boolean(),
  allowsPatch: z.boolean(),
  isActive: z.boolean(),
  isFeatured: z.boolean(),
  metaTitle: z.string().trim().optional().or(z.literal("")),
  metaDescription: z.string().trim().optional().or(z.literal("")),
  categoryId: z.string().trim().min(1, "Selecione a categoria"),
  subcategoryId: optionalId,
  brandId: optionalId,
  seasonId: optionalId,
  leagueId: optionalId,
  countryId: optionalId,
  teamId: optionalId,
  images: z
    .array(productMediaSchema)
    .min(1, "Adicione ao menos uma foto"),
  videos: z.array(productMediaSchema),
  variants: z
    .array(productVariantSchema)
    .min(1, "Adicione ao menos um tamanho"),
  patches: z.array(productPatchSchema),
  relatedProductIds: z.array(z.string()),
});

export type ProductInput = z.infer<typeof productSchema>;

export const bulkProductImportSchema = z.object({
  categoryId: z.string().trim().min(1, "Selecione a categoria"),
  seasonId: optionalId,
  model: z.enum(productModelValues),
  sleeveType: z.enum(sleeveTypeValues),
  teamNames: z
    .array(z.string().trim().min(1))
    .min(1, "Informe ao menos um time, um por linha"),
});

export type BulkProductImportInput = z.infer<typeof bulkProductImportSchema>;

export type BulkProductImportResult = {
  created: string[];
  skipped: { line: string; reason: string }[];
};
