import type { Metadata } from "next";

import {
  ProductListing,
  parseListingFilters,
  type ListingSearchParams,
} from "@/components/storefront/product-listing";

export const metadata: Metadata = {
  title: "Camisas de futebol",
};

export default async function ProdutosPage({
  searchParams,
}: {
  searchParams: Promise<ListingSearchParams>;
}) {
  const sp = await searchParams;

  return (
    <ProductListing
      title="Todas as camisas"
      filters={parseListingFilters(sp)}
      searchParams={sp}
    />
  );
}
