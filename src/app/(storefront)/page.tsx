import { CategoryGrid } from "@/components/storefront/category-grid";
import { HeroSection } from "@/components/storefront/hero-section";
import { ProductSection } from "@/components/storefront/product-section";
import { PromoBannerStrip } from "@/components/storefront/promo-banner-strip";
import { TrustBadges } from "@/components/storefront/trust-badges";
import { getCurrentUser } from "@/modules/auth/queries/get-current-user";
import { getFavoritedProductIds } from "@/modules/catalog/queries/get-favorites";
import {
  listFeaturedProducts,
  listLatestProducts,
} from "@/modules/catalog/queries/storefront-product.queries";
import { listActiveBanners } from "@/modules/marketing/queries/banner.queries";

export default async function HomePage() {
  const [latest, featured, user, banners] = await Promise.all([
    listLatestProducts(),
    listFeaturedProducts(),
    getCurrentUser(),
    listActiveBanners("HOME"),
  ]);

  const allIds = [...latest, ...featured].map((p) => p.id);
  const favoritedIds = user
    ? await getFavoritedProductIds(user.id, allIds)
    : new Set<string>();

  return (
    <>
      <HeroSection />
      <PromoBannerStrip banners={banners} />
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
