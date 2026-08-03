import { CategoryGrid } from "@/components/storefront/category-grid";
import { HeroSection } from "@/components/storefront/hero-section";
import { ProductSection } from "@/components/storefront/product-section";
import { TrustBadges } from "@/components/storefront/trust-badges";
import { getCurrentUser } from "@/modules/auth/queries/get-current-user";
import { getFavoritedProductIds } from "@/modules/catalog/queries/get-favorites";
import {
  listFeaturedProducts,
  listLatestProducts,
} from "@/modules/catalog/queries/storefront-product.queries";

export default async function HomePage() {
  const [latest, featured, user] = await Promise.all([
    listLatestProducts(),
    listFeaturedProducts(),
    getCurrentUser(),
  ]);

  const allIds = [...latest, ...featured].map((p) => p.id);
  const favoritedIds = user
    ? await getFavoritedProductIds(user.id, allIds)
    : new Set<string>();

  return (
    <>
      <HeroSection />
      <TrustBadges />
      <ProductSection
        title="Lançamentos"
        href="/produtos?ordenar=newest"
        products={latest}
        favoritedIds={favoritedIds}
      />
      <ProductSection
        title="Destaques"
        href="/produtos"
        products={featured}
        favoritedIds={favoritedIds}
      />
      <CategoryGrid />
    </>
  );
}
