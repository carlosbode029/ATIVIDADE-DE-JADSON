import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OrderManagementPanel } from "@/components/admin/order-management-panel";
import {
  ORDER_STATUS_LABELS,
  PAYMENT_METHOD_LABELS,
  PAYMENT_STATUS_LABELS,
} from "@/modules/orders/constants";
import { getOrderById } from "@/modules/orders/queries/get-order-by-id";
import { listCarriers } from "@/modules/shipping/queries/shipping.queries";

export const metadata: Metadata = {
  title: "Detalhe do pedido",
};

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "short",
  timeStyle: "short",
});

export default async function AdminPedidoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [order, carriers] = await Promise.all([getOrderById(id), listCarriers()]);
  if (!order) notFound();

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold">
            Pedido #{order.orderNumber}
          </h1>
          <p className="text-sm text-muted-foreground">
            {dateFormatter.format(order.createdAt)}
          </p>
        </div>
        <Badge variant="outline">{ORDER_STATUS_LABELS[order.status]}</Badge>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Cliente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <p>{order.user.name}</p>
            <p className="text-muted-foreground">{order.user.email}</p>
            {order.user.document && (
              <p className="text-muted-foreground">CPF: {order.user.document}</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Entrega</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <p className="text-muted-foreground">
              {order.shippingAddress.street}, {order.shippingAddress.number}
              {order.shippingAddress.complement
                ? ` — ${order.shippingAddress.complement}`
                : ""}
              <br />
              {order.shippingAddress.neighborhood} — {order.shippingAddress.city}/
              {order.shippingAddress.state}
              <br />
              CEP {order.shippingAddress.zipCode}
            </p>
            {order.carrier && order.trackingCode && (
              <p className="pt-2">
                <span className="text-muted-foreground">Rastreio: </span>
                {order.carrier.name} — {order.trackingCode}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Itens</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {order.items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between rounded-lg border border-border p-3 text-sm"
            >
              <div>
                <p className="font-medium">{item.nameSnapshot}</p>
                <p className="text-muted-foreground">
                  Tamanho: {item.sizeSnapshot} · Qtd: {item.quantity}
                  {item.patch && ` · Patch: ${item.patch.name}`}
                  {item.customName && ` · Nome: ${item.customName}`}
                  {item.customNumber && ` · Número: ${item.customNumber}`}
                </p>
              </div>
              <span className="font-semibold">
                {currencyFormatter.format(
                  (Number(item.unitPrice) + Number(item.patchPriceSnapshot ?? 0)) *
                    item.quantity,
                )}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pagamento</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 text-sm">
          {order.payments[0] ? (
            <p>
              {PAYMENT_METHOD_LABELS[order.payments[0].method]} —{" "}
              {PAYMENT_STATUS_LABELS[order.payments[0].status]}
            </p>
          ) : (
            <p className="text-muted-foreground">Nenhuma cobrança gerada.</p>
          )}
          <div className="space-y-1 border-t border-border pt-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{currencyFormatter.format(Number(order.subtotal))}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Frete</span>
              <span>{currencyFormatter.format(Number(order.shippingCost))}</span>
            </div>
            {Number(order.discount) > 0 && (
              <div className="flex justify-between text-gold">
                <span>Desconto{order.coupon ? ` (${order.coupon.code})` : ""}</span>
                <span>-{currencyFormatter.format(Number(order.discount))}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-border pt-2 font-semibold">
              <span>Total</span>
              <span>{currencyFormatter.format(Number(order.total))}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <OrderManagementPanel
        orderId={order.id}
        status={order.status}
        carrierId={order.carrierId}
        trackingCode={order.trackingCode}
        carriers={carriers}
      />
    </div>
  );
}
