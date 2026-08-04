import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { CheckCircle2, FileText } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PaymentPanel } from "@/components/storefront/payment-panel";
import { getCurrentUser } from "@/modules/auth/queries/get-current-user";
import {
  ORDER_STATUS_LABELS,
  PAYMENT_METHOD_LABELS,
} from "@/modules/orders/constants";
import { getOrderById } from "@/modules/orders/queries/get-order-by-id";
import { buildTrackingUrl } from "@/modules/orders/services/tracking-url";
import {
  extractBoletoDisplayData,
  extractPixDisplayData,
} from "@/modules/payments/services/extract-payment-display-data";

export const metadata: Metadata = {
  title: "Pedido",
};

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export default async function PedidoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const user = await getCurrentUser();
  if (!user) {
    redirect(`/login?redirectTo=/pedido/${id}`);
  }

  const order = await getOrderById(id);
  if (!order || order.userId !== user.id) {
    notFound();
  }

  const payment = order.payments[0];
  const trackingUrl = buildTrackingUrl(
    order.carrier?.trackingUrlTemplate,
    order.trackingCode,
  );

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center gap-3">
        <CheckCircle2 className="size-8 text-gold" />
        <div>
          <h1 className="font-display text-2xl font-bold">
            Pedido #{order.orderNumber}
          </h1>
          <p className="text-sm text-muted-foreground">
            Recebemos seu pedido! Assim que o pagamento for confirmado, você
            será notificado.
          </p>
        </div>
      </div>

      <div className="mb-6 rounded-xl border border-border bg-card p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Badge variant="gold">{ORDER_STATUS_LABELS[order.status]}</Badge>
          {payment && (
            <span className="text-sm text-muted-foreground">
              Pagamento via {PAYMENT_METHOD_LABELS[payment.method]}
            </span>
          )}
        </div>
      </div>

      <div className="mb-6 space-y-3">
        <h2 className="text-sm font-semibold">Itens</h2>
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
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-border p-3 text-sm">
          <h3 className="mb-1 font-semibold">Endereço de entrega</h3>
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
        <div className="rounded-lg border border-border p-3 text-sm">
          <h3 className="mb-1 font-semibold">Envio</h3>
          <p className="text-muted-foreground">
            {order.shippingMethod
              ? `${order.shippingMethod.carrier.name} — ${order.shippingMethod.name}`
              : "A definir"}
          </p>
          {order.trackingCode && (
            <p className="mt-1 text-muted-foreground">
              Rastreio ({order.carrier?.name}):{" "}
              {trackingUrl ? (
                <a
                  href={trackingUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-gold underline underline-offset-2"
                >
                  {order.trackingCode}
                </a>
              ) : (
                order.trackingCode
              )}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-1 rounded-xl border border-border bg-card p-4 text-sm">
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

      {order.status === "PENDING" && payment && (
        <div className="mt-6">
          <PaymentPanel
            orderId={order.id}
            orderTotal={Number(order.total)}
            paymentMethod={payment.method}
            paymentStatus={payment.status}
            userEmail={user.email}
            userDocument={user.document}
            publicKey={process.env.NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY ?? null}
            initialPixDisplay={extractPixDisplayData(payment.rawPayload)}
            initialBoletoDisplay={extractBoletoDisplayData(payment.rawPayload)}
          />
        </div>
      )}

      {order.status !== "PENDING" && order.status !== "CANCELLED" && (
        <div className="mt-6 text-center">
          <Button asChild variant="outline">
            <Link href={`/pedido/${order.id}/comprovante`}>
              <FileText className="size-4" />
              Ver / baixar comprovante
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
