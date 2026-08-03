import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  ProductListing,
  parseListingFilters,
  type ListingSearchParams,
} from "@/components/storefront/product-listing";
import { getCategoryBySlug } from "@/modules/catalog/queries/category.queries";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  return { title: category?.name ?? "Categoria" };
}

export default async function CategoriaPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<ListingSearchParams>;
}) {
  const { slug } = await params;
  const [category, sp] = await Promise.all([
    getCategoryBySlug(slug),
    searchParams,
  ]);

  if (!category) {
    notFound();
  }

  return (
    <ProductListing
      title={category.name}
      filters={{ ...parseListingFilters(sp), categorySlug: slug }}
      searchParams={sp}
    />
  );
}
