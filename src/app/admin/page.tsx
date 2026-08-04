import type { Metadata } from "next";
import Link from "next/link";
import {
  AlertTriangle,
  DollarSign,
  Package,
  ShoppingCart,
  Tags,
  Users,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCatalogStats } from "@/modules/catalog/queries/get-catalog-stats";
import { getCustomerStats } from "@/modules/customers/queries/get-customer-stats";
import { ORDER_STATUS_LABELS } from "@/modules/orders/constants";
import { getOrderStats, getRecentOrders } from "@/modules/orders/queries/get-order-stats";

export const metadata: Metadata = {
  title: "Dashboard",
};

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export default async function AdminDashboardPage() {
  const [catalogStats, orderStats, customerStats, recentOrders] = await Promise.all([
    getCatalogStats(),
    getOrderStats(),
    getCustomerStats(),
    getRecentOrders(),
  ]);

  const cards = [
    {
      label: "Receita do mês",
      value: currencyFormatter.format(orderStats.monthRevenue),
      icon: DollarSign,
    },
    {
      label: "Pedidos pendentes",
      value: `${orderStats.pendingOrders} / ${orderStats.totalOrders}`,
      icon: ShoppingCart,
    },
    {
      label: "Produtos cadastrados",
      value: catalogStats.productCount,
      icon: Package,
    },
    {
      label: "Categorias",
      value: catalogStats.categoryCount,
      icon: Tags,
    },
    {
      label: "Clientes",
      value: customerStats.totalCustomers,
      icon: Users,
    },
  ] as const;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Visão geral da loja BK IMPORTS.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {cards.map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {label}
              </CardTitle>
              <Icon className="size-4 text-gold" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {catalogStats.lowStockCount > 0 && (
        <Card className="border-destructive/40">
          <CardContent className="flex items-center gap-3 pt-6">
            <AlertTriangle className="size-5 text-destructive" />
            <p className="text-sm">
              {catalogStats.lowStockCount} variante(s) de produto com estoque
              baixo.{" "}
              <Link href="/admin/produtos" className="font-medium underline">
                Ver produtos
              </Link>
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Pedidos recentes</CardTitle>
        </CardHeader>
        <CardContent>
          {recentOrders.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum pedido ainda.</p>
          ) : (
            <div className="space-y-2">
              {recentOrders.map((order) => (
                <Link
                  key={order.id}
                  href={`/admin/pedidos/${order.id}`}
                  className="flex items-center justify-between rounded-lg border border-border p-3 text-sm transition-colors hover:border-gold/50"
                >
                  <div>
                    <p className="font-medium">#{order.orderNumber}</p>
                    <p className="text-xs text-muted-foreground">
                      {order.user.name} · {order.user.email}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold">
                      {currencyFormatter.format(Number(order.total))}
                    </span>
                    <Badge variant="outline">{ORDER_STATUS_LABELS[order.status]}</Badge>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
