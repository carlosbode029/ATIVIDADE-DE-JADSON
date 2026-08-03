import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ProductForm } from "@/components/admin/product-form";
import { listCategoryTree } from "@/modules/catalog/queries/category.queries";
import {
  getProductById,
  listProductOptions,
} from "@/modules/catalog/queries/product.queries";
import {
  listBrands,
  listCountries,
  listLeagues,
  listSeasons,
  listTeams,
} from "@/modules/catalog/queries/reference-data.queries";
import { toProductFormValues } from "@/modules/catalog/services/product-form-values";

export const metadata: Metadata = {
  title: "Editar produto",
};

export default async function EditarProdutoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [
    product,
    categories,
    brands,
    seasons,
    leagues,
    countries,
    teams,
    relatedOptions,
  ] = await Promise.all([
    getProductById(id),
    listCategoryTree(),
    listBrands(),
    listSeasons(),
    listLeagues(),
    listCountries(),
    listTeams(),
    listProductOptions(id),
  ]);

  if (!product) {
    notFound();
  }

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl font-bold">{product.name}</h1>
      <ProductForm
        categories={categories}
        brands={brands}
        seasons={seasons}
        leagues={leagues}
        countries={countries}
        teams={teams}
        relatedOptions={relatedOptions}
        productId={product.id}
        defaultValues={toProductFormValues(product)}
      />
    </div>
  );
}
