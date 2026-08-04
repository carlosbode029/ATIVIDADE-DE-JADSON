import { prisma } from "@/lib/prisma";
import type { FinanceType, Prisma } from "@/generated/prisma/client";

const PAGE_SIZE = 20;

function buildDateRangeFilter(dateFrom?: string, dateTo?: string) {
  if (!dateFrom && !dateTo) return undefined;
  return {
    ...(dateFrom ? { gte: new Date(dateFrom) } : {}),
    ...(dateTo ? { lte: new Date(`${dateTo}T23:59:59.999`) } : {}),
  };
}

export async function listFinanceEntries({
  type,
  category,
  dateFrom,
  dateTo,
  page = 1,
}: {
  type?: FinanceType;
  category?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
}) {
  const dateFilter = buildDateRangeFilter(dateFrom, dateTo);

  const where: Prisma.FinanceEntryWhereInput = {
    ...(type ? { type } : {}),
    ...(category ? { category: { contains: category, mode: "insensitive" } } : {}),
    ...(dateFilter ? { date: dateFilter } : {}),
  };

  const [items, total] = await Promise.all([
    prisma.financeEntry.findMany({
      where,
      orderBy: { date: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { order: { select: { orderNumber: true } } },
    }),
    prisma.financeEntry.count({ where }),
  ]);

  return {
    items,
    total,
    page,
    pageSize: PAGE_SIZE,
    totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  };
}

export async function getFinanceSummary({
  dateFrom,
  dateTo,
}: {
  dateFrom?: string;
  dateTo?: string;
}) {
  const dateFilter = buildDateRangeFilter(dateFrom, dateTo);

  const entries = await prisma.financeEntry.findMany({
    where: dateFilter ? { date: dateFilter } : undefined,
    select: { type: true, amount: true },
  });

  const income = entries
    .filter((e) => e.type === "INCOME")
    .reduce((sum, e) => sum + Number(e.amount), 0);
  const expense = entries
    .filter((e) => e.type === "EXPENSE")
    .reduce((sum, e) => sum + Number(e.amount), 0);

  return { income, expense, net: income - expense };
}
