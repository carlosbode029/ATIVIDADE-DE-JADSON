import type { Metadata } from "next";
import { Suspense } from "react";

import { OrdersTable } from "@/components/admin/orders-table";
import type { OrderStatus } from "@/generated/prisma/client";
import { listOrdersAdmin } from "@/modules/orders/queries/list-orders-admin";

export const metadata: Metadata = {
  title: "Pedidos",
};

export default async function AdminPedidosPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; page?: string }>;
}) {
  const params = await searchParams;
  const result = await listOrdersAdmin({
    query: params.q,
    status: params.status ? (params.status as OrderStatus) : undefined,
    page: params.page ? Number(params.page) : 1,
  });

  const serializedResult = {
    ...result,
    items: result.items.map((order) => ({
      ...order,
      total: Number(order.total),
    })),
  };

  return (
    <Suspense fallback={null}>
      <OrdersTable result={serializedResult} />
    </Suspense>
  );
}
