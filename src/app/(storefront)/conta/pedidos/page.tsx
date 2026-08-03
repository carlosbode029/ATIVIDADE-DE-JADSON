import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/modules/auth/queries/get-current-user";
import { getOrdersByUserId } from "@/modules/orders/queries/get-orders";

export const metadata: Metadata = {
  title: "Meus pedidos",
};

export default async function PedidosPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?redirectTo=/conta/pedidos");
  }

  const orders = await getOrdersByUserId(user.id);

  if (orders.length === 0) {
    return (
      <section className="rounded-xl border border-dashed border-border p-10 text-center">
        <p className="font-medium">Você ainda não fez nenhum pedido.</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Explore o catálogo e vista a camisa do seu time.
        </p>
        <Button variant="gold" className="mt-6" asChild>
          <Link href="/produtos">Ver camisas</Link>
        </Button>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      {orders.map((order) => (
        <div
          key={order.id}
          className="flex items-center justify-between rounded-xl border border-border bg-card p-4"
        >
          <div>
            <p className="font-medium">Pedido #{order.orderNumber}</p>
            <p className="text-sm text-muted-foreground">{order.status}</p>
          </div>
          <p className="font-semibold">
            {new Intl.NumberFormat("pt-BR", {
              style: "currency",
              currency: "BRL",
            }).format(Number(order.total))}
          </p>
        </div>
      ))}
    </section>
  );
}
