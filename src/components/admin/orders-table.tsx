"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ORDER_STATUS_LABELS,
  PAYMENT_METHOD_LABELS,
} from "@/modules/orders/constants";
import type { listOrdersAdmin } from "@/modules/orders/queries/list-orders-admin";

type OrdersResult = Awaited<ReturnType<typeof listOrdersAdmin>>;
type SerializedOrderItem = Omit<OrdersResult["items"][number], "total"> & {
  total: number;
};
export type SerializedOrdersResult = Omit<OrdersResult, "items"> & {
  items: SerializedOrderItem[];
};

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const dateFormatter = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" });

const STATUS_OPTIONS = Object.keys(ORDER_STATUS_LABELS);

export function OrdersTable({ result }: { result: SerializedOrdersResult }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("page");
    router.push(`/admin/pedidos?${params.toString()}`);
  }

  function goToPage(page: number) {
    const params = new URLSearchParams(searchParams);
    params.set("page", String(page));
    router.push(`/admin/pedidos?${params.toString()}`);
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-bold">Pedidos</h1>
        <div className="flex gap-3">
          <Input
            placeholder="Buscar por número, nome ou e-mail..."
            defaultValue={searchParams.get("q") ?? ""}
            onChange={(e) => updateParam("q", e.target.value)}
            className="w-64"
          />
          <Select
            value={searchParams.get("status") ?? "all"}
            onValueChange={(value) => updateParam("status", value === "all" ? "" : value)}
          >
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              {STATUS_OPTIONS.map((status) => (
                <SelectItem key={status} value={status}>
                  {ORDER_STATUS_LABELS[status]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {result.items.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nenhum pedido encontrado.</p>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pedido</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Pagamento</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-24 text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {result.items.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">
                    #{order.orderNumber}
                  </TableCell>
                  <TableCell>
                    <div>{order.user.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {order.user.email}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {dateFormatter.format(order.createdAt)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {order.payments[0]
                      ? PAYMENT_METHOD_LABELS[order.payments[0].method]
                      : "—"}
                  </TableCell>
                  <TableCell>{currencyFormatter.format(order.total)}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {ORDER_STATUS_LABELS[order.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/admin/pedidos/${order.id}`}>Ver</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {result.totalPages > 1 && (
            <div className="mt-4 flex items-center justify-center gap-2">
              {Array.from({ length: result.totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <Button
                    key={page}
                    variant={page === result.page ? "gold" : "outline"}
                    size="sm"
                    onClick={() => goToPage(page)}
                  >
                    {page}
                  </Button>
                ),
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
