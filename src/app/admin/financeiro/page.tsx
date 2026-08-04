import type { Metadata } from "next";
import { Suspense } from "react";

import { FinanceTable } from "@/components/admin/finance-table";
import type { FinanceType } from "@/generated/prisma/client";
import {
  getFinanceSummary,
  listFinanceEntries,
} from "@/modules/finance/queries/finance.queries";

export const metadata: Metadata = {
  title: "Financeiro",
};

export default async function AdminFinanceiroPage({
  searchParams,
}: {
  searchParams: Promise<{
    type?: string;
    category?: string;
    dateFrom?: string;
    dateTo?: string;
    page?: string;
  }>;
}) {
  const params = await searchParams;
  const filters = {
    type: params.type ? (params.type as FinanceType) : undefined,
    category: params.category,
    dateFrom: params.dateFrom,
    dateTo: params.dateTo,
  };

  const [result, summary] = await Promise.all([
    listFinanceEntries({ ...filters, page: params.page ? Number(params.page) : 1 }),
    getFinanceSummary(filters),
  ]);

  const serializedResult = {
    ...result,
    items: result.items.map((entry) => ({
      ...entry,
      amount: Number(entry.amount),
    })),
  };

  return (
    <Suspense fallback={null}>
      <FinanceTable result={serializedResult} summary={summary} />
    </Suspense>
  );
}
