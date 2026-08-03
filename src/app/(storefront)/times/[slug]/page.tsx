import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  ProductListing,
  parseListingFilters,
  type ListingSearchParams,
} from "@/components/storefront/product-listing";
import { getTeamBySlug } from "@/modules/catalog/queries/reference-data.queries";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const team = await getTeamBySlug(slug);
  return { title: team ? `Camisas ${team.name}` : "Time" };
}

export default async function TimePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<ListingSearchParams>;
}) {
  const { slug } = await params;
  const [team, sp] = await Promise.all([getTeamBySlug(slug), searchParams]);

  if (!team) {
    notFound();
  }

  return (
    <ProductListing
      title={`Camisas ${team.name}`}
      filters={{ ...parseListingFilters(sp), teamSlug: slug }}
      searchParams={sp}
    />
  );
}
