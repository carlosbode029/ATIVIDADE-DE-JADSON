import { CategoryGrid } from "@/components/storefront/category-grid";
import { HeroSection } from "@/components/storefront/hero-section";
import { TrustBadges } from "@/components/storefront/trust-badges";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <TrustBadges />
      <CategoryGrid />
    </>
  );
}
