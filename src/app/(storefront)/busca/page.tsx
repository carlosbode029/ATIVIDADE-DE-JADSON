import type { Metadata } from "next";

import {
  ProductListing,
  parseListingFilters,
  type ListingSearchParams,
} from "@/components/storefront/product-listing";

export const metadata: Metadata = {
  title: "Buscar",
};

export default async function BuscaPage({
  searchParams,
}: {
  searchParams: Promise<ListingSearchParams>;
}) {
  const sp = await searchParams;

  return (
    <ProductListing
      title={sp.q ? `Resultados para "${sp.q}"` : "Buscar camisas"}
      filters={parseListingFilters(sp)}
      searchParams={sp}
    />
  );
}
