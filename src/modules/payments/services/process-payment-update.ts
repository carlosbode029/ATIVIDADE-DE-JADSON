import type { PaymentResponse } from "mercadopago/dist/clients/payment/commonTypes";

import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";
import { mapMercadoPagoStatus } from "@/modules/payments/services/mercado-pago-status";

function extractReceiptUrl(mpPayment: PaymentResponse): string | null {
  return (
    mpPayment.point_of_interaction?.transaction_data?.ticket_url ??
    mpPayment.transaction_details?.external_resource_url ??
    null
  );
}

/**
 * Aplica o status mais recente de um pagamento do Mercado Pago ao nosso
 * banco. Chamado tanto pelo webhook quanto pela verificação manual — precisa
 * ser idempotente, já que o Mercado Pago pode reenviar a mesma notificação.
 */
export async function processPaymentUpdate(mpPayment: PaymentResponse) {
  if (!mpPayment.id) return;

  const payment = await prisma.payment.findUnique({
    where: { mpPaymentId: String(mpPayment.id) },
    include: { order: { include: { items: true } } },
  });

  if (!payment) return;

  const newStatus = mapMercadoPagoStatus(mpPayment.status);
  if (payment.status === newStatus) return;

  await prisma.$transaction(async (tx) => {
    await tx.payment.update({
      where: { id: payment.id },
      data: {
        status: newStatus,
        rawPayload: mpPayment as unknown as Prisma.InputJsonValue,
        receiptUrl: extractReceiptUrl(mpPayment),
      },
    });

    if (newStatus === "APPROVED" && payment.order.status === "PENDING") {
      await tx.order.update({
        where: { id: payment.order.id },
        data: { status: "PAID" },
      });

      for (const item of payment.order.items) {
        await tx.productVariant.update({
          where: { id: item.productVariantId },
          data: { stockQuantity: { decrement: item.quantity } },
        });

        await tx.stockMovement.create({
          data: {
            productVariantId: item.productVariantId,
            type: "OUT",
            quantity: item.quantity,
            reason: `Venda — pedido ${payment.order.orderNumber}`,
            referenceOrderId: payment.order.id,
          },
        });
      }

      await tx.financeEntry.create({
        data: {
          type: "INCOME",
          category: "Vendas",
          description: `Pedido ${payment.order.orderNumber}`,
          amount: payment.order.total,
          orderId: payment.order.id,
        },
      });
    }

    if (
      (newStatus === "REJECTED" || newStatus === "CANCELLED") &&
      payment.order.status === "PENDING"
    ) {
      await tx.order.update({
        where: { id: payment.order.id },
        data: { status: "CANCELLED" },
      });
    }
  });
}
