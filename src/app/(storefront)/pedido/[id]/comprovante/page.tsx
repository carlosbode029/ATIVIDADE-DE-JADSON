import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { PrintReceiptButton } from "@/components/storefront/print-receipt-button";
import { getCurrentUser } from "@/modules/auth/queries/get-current-user";
import {
  ORDER_STATUS_LABELS,
  PAYMENT_METHOD_LABELS,
  PAYMENT_STATUS_LABELS,
} from "@/modules/orders/constants";
import { getOrderById } from "@/modules/orders/queries/get-order-by-id";

export const metadata: Metadata = {
  title: "Comprovante do pedido",
};

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "short",
  timeStyle: "short",
});

export default async function ComprovantePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const user = await getCurrentUser();
  if (!user) {
    redirect(`/login?redirectTo=/pedido/${id}/comprovante`);
  }

  const order = await getOrderById(id);
  if (!order || order.userId !== user.id) {
    notFound();
  }

  const payment = order.payments[0];

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8 print:max-w-full print:py-0">
      <div className="mb-6 flex items-center justify-between print:hidden">
        <h1 className="font-display text-2xl font-bold">Comprovante</h1>
        <PrintReceiptButton />
      </div>

      <div className="rounded-xl border border-border bg-card p-6 text-sm print:border-none print:p-0 print:shadow-none">
        <div className="mb-6 flex items-center justify-between border-b border-border pb-4">
          <span className="font-display text-lg font-bold tracking-wide text-gold">
            BK IMPORTS
          </span>
          <div className="text-right">
            <p className="font-semibold">Pedido #{order.orderNumber}</p>
            <p className="text-muted-foreground">
              {dateFormatter.format(order.createdAt)}
            </p>
          </div>
        </div>

        <div className="mb-6 grid gap-4 sm:grid-cols-2">
          <div>
            <h2 className="mb-1 font-semibold">Cliente</h2>
            <p className="text-muted-foreground">{user.name}</p>
            <p className="text-muted-foreground">{user.email}</p>
            {user.document && (
              <p className="text-muted-foreground">CPF: {user.document}</p>
            )}
          </div>
          <div>
            <h2 className="mb-1 font-semibold">Entrega</h2>
            <p className="text-muted-foreground">
              {order.shippingAddress.street}, {order.shippingAddress.number}
              {order.shippingAddress.complement
                ? ` — ${order.shippingAddress.complement}`
                : ""}
              <br />
              {order.shippingAddress.neighborhood} —{" "}
              {order.shippingAddress.city}/{order.shippingAddress.state}
              <br />
              CEP {order.shippingAddress.zipCode}
            </p>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="mb-2 font-semibold">Itens</h2>
          <div className="space-y-2">
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between gap-4">
                <div>
                  <p>{item.nameSnapshot}</p>
                  <p className="text-xs text-muted-foreground">
                    Tamanho: {item.sizeSnapshot} · Qtd: {item.quantity}
                    {item.patch && ` · Patch: ${item.patch.name}`}
                    {item.customName && ` · Nome: ${item.customName}`}
                    {item.customNumber && ` · Número: ${item.customNumber}`}
                  </p>
                </div>
                <span className="whitespace-nowrap font-medium">
                  {currencyFormatter.format(
                    (Number(item.unitPrice) + Number(item.patchPriceSnapshot ?? 0)) *
                      item.quantity,
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-6 space-y-1 border-t border-border pt-4">
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
          <div className="flex justify-between border-t border-border pt-2 text-base font-semibold">
            <span>Total</span>
            <span>{currencyFormatter.format(Number(order.total))}</span>
          </div>
        </div>

        <div className="flex justify-between border-t border-border pt-4 text-xs text-muted-foreground">
          <span>Status do pedido: {ORDER_STATUS_LABELS[order.status]}</span>
          {payment && (
            <span>
              Pagamento: {PAYMENT_METHOD_LABELS[payment.method]} —{" "}
              {PAYMENT_STATUS_LABELS[payment.status]}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
