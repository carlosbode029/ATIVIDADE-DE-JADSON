import { Suspense } from "react";

import { ProductFilters } from "@/components/storefront/product-filters";
import { ProductGrid } from "@/components/storefront/product-grid";
import { StorefrontPagination } from "@/components/storefront/storefront-pagination";
import { getFavoritedProductIds } from "@/modules/catalog/queries/get-favorites";
import { listTopLevelCategories } from "@/modules/catalog/queries/category.queries";
import {
  listCountries,
  listLeagues,
  listSeasons,
  listTeams,
} from "@/modules/catalog/queries/reference-data.queries";
import {
  listAvailableSizes,
  listProductsStorefront,
  type ProductListFilters,
} from "@/modules/catalog/queries/storefront-product.queries";
import { getCurrentUser } from "@/modules/auth/queries/get-current-user";

export type ListingSearchParams = Record<string, string | undefined>;

export function parseListingFilters(
  searchParams: ListingSearchParams,
): ProductListFilters {
  const sort =
    searchParams.ordenar === "price_asc" || searchParams.ordenar === "price_desc"
      ? searchParams.ordenar
      : "newest";

  return {
    q: searchParams.q,
    categorySlug: searchParams.categoria,
    teamSlug: searchParams.time,
    countryCode: searchParams.pais,
    leagueSlug: searchParams.liga,
    seasonId: searchParams.temporada,
    size: searchParams.tamanho,
    sort,
    page: searchParams.page ? Number(searchParams.page) : 1,
  };
}

export async function ProductListing({
  title,
  subtitle,
  filters,
  searchParams,
}: {
  title: string;
  subtitle?: string;
  filters: ProductListFilters;
  searchParams: ListingSearchParams;
}) {
  const [result, categories, teams, countries, leagues, seasons, sizes, user] =
    await Promise.all([
      listProductsStorefront(filters),
      listTopLevelCategories(),
      listTeams(),
      listCountries(),
      listLeagues(),
      listSeasons(),
      listAvailableSizes(),
      getCurrentUser(),
    ]);

  const favoritedIds = user
    ? await getFavoritedProductIds(
        user.id,
        result.items.map((p) => p.id),
      )
    : new Set<string>();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-display text-2xl font-bold sm:text-3xl">{title}</h1>
      <p className="mb-8 mt-1 text-sm text-muted-foreground">
        {subtitle ?? `${result.total} produto(s) encontrado(s)`}
      </p>

      <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <Suspense fallback={null}>
            <ProductFilters
              data={{
                categories: categories.map((c) => ({
                  slug: c.slug,
                  name: c.name,
                })),
                teams: teams.map((t) => ({ slug: t.slug, name: t.name })),
                countries: countries.map((c) => ({
                  code: c.code,
                  name: c.name,
                })),
                leagues: leagues.map((l) => ({ slug: l.slug, name: l.name })),
                seasons: seasons.map((s) => ({ id: s.id, label: s.label })),
                sizes,
              }}
            />
          </Suspense>
        </aside>

        <div>
          <ProductGrid products={result.items} favoritedIds={favoritedIds} />
          <StorefrontPagination
            page={result.page}
            totalPages={result.totalPages}
            searchParams={searchParams}
          />
        </div>
      </div>
    </div>
  );
}
