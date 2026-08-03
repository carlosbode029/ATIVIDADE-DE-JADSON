import type { Metadata } from "next";

import { ProductForm } from "@/components/admin/product-form";
import { listCategoryTree } from "@/modules/catalog/queries/category.queries";
import { listProductOptions } from "@/modules/catalog/queries/product.queries";
import {
  listBrands,
  listCountries,
  listLeagues,
  listSeasons,
  listTeams,
} from "@/modules/catalog/queries/reference-data.queries";

export const metadata: Metadata = {
  title: "Novo produto",
};

export default async function NovoProdutoPage() {
  const [categories, brands, seasons, leagues, countries, teams, relatedOptions] =
    await Promise.all([
      listCategoryTree(),
      listBrands(),
      listSeasons(),
      listLeagues(),
      listCountries(),
      listTeams(),
      listProductOptions(),
    ]);

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl font-bold">Novo produto</h1>
      <ProductForm
        categories={categories}
        brands={brands}
        seasons={seasons}
        leagues={leagues}
        countries={countries}
        teams={teams}
        relatedOptions={relatedOptions}
      />
    </div>
  );
}
