"use server";

import { revalidatePath } from "next/cache";
import { PaymentRefund as MercadoPagoPaymentRefund } from "mercadopago";

import { recordAuditLog } from "@/lib/audit-log";
import { mercadoPagoConfig } from "@/lib/mercado-pago";
import { prisma } from "@/lib/prisma";
import { requireAdminUser } from "@/modules/auth/services/require-admin";
import type { OrderStatus } from "@/generated/prisma/client";
import {
  updateOrderStatusSchema,
  updateOrderTrackingSchema,
  type UpdateOrderStatusInput,
  type UpdateOrderTrackingInput,
} from "@/modules/orders/schemas/order-management.schema";

type ActionResult = { error?: string };

// Transições permitidas por ação manual do admin. PENDING → PAID/CANCELLED
// acontece automaticamente via webhook/verificação de pagamento (Fase 5) e
// não passa por aqui.
const ALLOWED_MANUAL_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: [],
  PAID: ["PROCESSING", "SHIPPED"],
  PROCESSING: ["SHIPPED", "DELIVERED"],
  SHIPPED: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: [],
  REFUNDED: [],
};

const REFUNDABLE_STATUSES: OrderStatus[] = [
  "PAID",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
];

function revalidateOrder(orderId: string) {
  revalidatePath(`/admin/pedidos/${orderId}`);
  revalidatePath("/admin/pedidos");
  revalidatePath(`/pedido/${orderId}`);
  revalidatePath("/conta/pedidos");
}

export async function updateOrderStatus(
  input: UpdateOrderStatusInput,
): Promise<ActionResult> {
  const parsed = updateOrderStatusSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const admin = await requireAdminUser();

  const order = await prisma.order.findUnique({
    where: { id: parsed.data.orderId },
  });
  if (!order) return { error: "Pedido não encontrado." };

  if (!ALLOWED_MANUAL_TRANSITIONS[order.status].includes(parsed.data.status)) {
    return {
      error: `Não é possível mudar de "${order.status}" para "${parsed.data.status}".`,
    };
  }

  await prisma.order.update({
    where: { id: order.id },
    data: { status: parsed.data.status },
  });

  await recordAuditLog({
    userId: admin.id,
    action: "UPDATE",
    entity: "Order",
    entityId: order.id,
    metadata: { from: order.status, to: parsed.data.status },
  });

  revalidateOrder(order.id);
  return {};
}

export async function updateOrderTracking(
  input: UpdateOrderTrackingInput,
): Promise<ActionResult> {
  const parsed = updateOrderTrackingSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const admin = await requireAdminUser();

  const order = await prisma.order.findUnique({
    where: { id: parsed.data.orderId },
  });
  if (!order) return { error: "Pedido não encontrado." };

  if (!ALLOWED_MANUAL_TRANSITIONS[order.status].includes("SHIPPED")) {
    return { error: `Não é possível despachar um pedido em "${order.status}".` };
  }

  const carrier = await prisma.carrier.findUnique({
    where: { id: parsed.data.carrierId },
  });
  if (!carrier) return { error: "Transportadora não encontrada." };

  await prisma.order.update({
    where: { id: order.id },
    data: {
      status: "SHIPPED",
      carrierId: carrier.id,
      trackingCode: parsed.data.trackingCode,
    },
  });

  await recordAuditLog({
    userId: admin.id,
    action: "UPDATE",
    entity: "Order",
    entityId: order.id,
    metadata: {
      from: order.status,
      to: "SHIPPED",
      carrierId: carrier.id,
      trackingCode: parsed.data.trackingCode,
    },
  });

  revalidateOrder(order.id);
  return {};
}

export async function refundOrder(orderId: string): Promise<ActionResult> {
  const admin = await requireAdminUser();

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: true,
      payments: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!order) return { error: "Pedido não encontrado." };

  if (!REFUNDABLE_STATUSES.includes(order.status)) {
    return { error: `Não é possível reembolsar um pedido em "${order.status}".` };
  }

  const payment = order.payments.find((p) => p.status === "APPROVED");
  if (!payment?.mpPaymentId) {
    return { error: "Nenhum pagamento aprovado encontrado para este pedido." };
  }

  try {
    const refundClient = new MercadoPagoPaymentRefund(mercadoPagoConfig);
    await refundClient.total({ payment_id: payment.mpPaymentId });
  } catch {
    return { error: "Não foi possível processar o reembolso no Mercado Pago." };
  }

  await prisma.$transaction(async (tx) => {
    await tx.order.update({
      where: { id: order.id },
      data: { status: "REFUNDED" },
    });

    await tx.payment.update({
      where: { id: payment.id },
      data: { status: "REFUNDED" },
    });

    for (const item of order.items) {
      await tx.productVariant.update({
        where: { id: item.productVariantId },
        data: { stockQuantity: { increment: item.quantity } },
      });

      await tx.stockMovement.create({
        data: {
          productVariantId: item.productVariantId,
          type: "IN",
          quantity: item.quantity,
          reason: `Estorno — pedido ${order.orderNumber}`,
          referenceOrderId: order.id,
          createdById: admin.id,
        },
      });
    }

    await tx.financeEntry.create({
      data: {
        type: "EXPENSE",
        category: "Reembolsos",
        description: `Reembolso — pedido ${order.orderNumber}`,
        amount: order.total,
        orderId: order.id,
      },
    });
  });

  await recordAuditLog({
    userId: admin.id,
    action: "UPDATE",
    entity: "Order",
    entityId: order.id,
    metadata: { from: order.status, to: "REFUNDED" },
  });

  revalidateOrder(order.id);
  return {};
}
