import type { Metadata } from "next";
import { Suspense } from "react";

import { ProductsTable } from "@/components/admin/products-table";
import { listProductsAdmin } from "@/modules/catalog/queries/product.queries";

export const metadata: Metadata = {
  title: "Produtos",
};

export default async function AdminProdutosPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const params = await searchParams;
  const result = await listProductsAdmin({
    query: params.q,
    page: params.page ? Number(params.page) : 1,
  });

  return (
    <Suspense fallback={null}>
      <ProductsTable result={result} />
    </Suspense>
  );
}
