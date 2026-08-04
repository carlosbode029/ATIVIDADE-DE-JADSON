import type { Metadata } from "next";
import { Suspense } from "react";

import { StockTable } from "@/components/admin/stock-table";
import { listVariantsStock } from "@/modules/inventory/queries/inventory.queries";

export const metadata: Metadata = {
  title: "Estoque",
};

export default async function AdminEstoquePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; lowStock?: string; page?: string }>;
}) {
  const params = await searchParams;
  const result = await listVariantsStock({
    query: params.q,
    lowStockOnly: params.lowStock === "1",
    page: params.page ? Number(params.page) : 1,
  });

  return (
    <Suspense fallback={null}>
      <StockTable result={result} />
    </Suspense>
  );
}
