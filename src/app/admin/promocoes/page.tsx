import type { Metadata } from "next";

import { PromotionManager } from "@/components/admin/promotion-manager";
import { listAllCategoriesFlat } from "@/modules/catalog/queries/category.queries";
import { listProductOptions } from "@/modules/catalog/queries/product.queries";
import { listPromotions } from "@/modules/marketing/queries/promotion.queries";

export const metadata: Metadata = {
  title: "Promoções",
};

export default async function AdminPromocoesPage() {
  const [promotions, products, categories] = await Promise.all([
    listPromotions(),
    listProductOptions(),
    listAllCategoriesFlat(),
  ]);

  const serializedPromotions = promotions.map((promotion) => ({
    ...promotion,
    discountValue: Number(promotion.discountValue),
  }));

  return (
    <PromotionManager
      promotions={serializedPromotions}
      products={products}
      categories={categories}
    />
  );
}
