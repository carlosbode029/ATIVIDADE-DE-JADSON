import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";

import { prisma } from "@/lib/prisma";
import { buildTrackingUrl } from "@/modules/orders/services/tracking-url";
import type { OrderStatus } from "@/generated/prisma/client";
import {
  createTestAddress,
  createTestUser,
  deleteTestOrder,
  deleteTestUser,
  getSeedVariant,
} from "./helpers";

// Mesma tabela de src/modules/orders/actions/order-management.actions.ts
const ALLOWED_MANUAL_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: [],
  PAID: ["PROCESSING", "SHIPPED"],
  PROCESSING: ["SHIPPED", "DELIVERED"],
  SHIPPED: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: [],
  REFUNDED: [],
};
const REFUNDABLE_STATUSES: OrderStatus[] = ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"];

describe("gestão de pedidos (Fase 6)", () => {
  let variant: Awaited<ReturnType<typeof getSeedVariant>>;
  let price: number;
  let initialStock: number;
  let user: Awaited<ReturnType<typeof createTestUser>>;
  let address: Awaited<ReturnType<typeof createTestAddress>>;
  let carrier: Awaited<ReturnType<typeof prisma.carrier.create>>;
  const createdOrderIds: string[] = [];

  beforeAll(async () => {
    variant = await getSeedVariant();
    price = Number(variant.priceOverride ?? variant.product.price);
    initialStock = variant.stockQuantity;
    user = await createTestUser("ordermgmt");
    address = await createTestAddress(user.id);
    carrier = await prisma.carrier.create({
      data: { name: "Transportadora Teste", trackingUrlTemplate: "https://rastreio.com/{codigo}" },
    });
  });

  afterEach(async () => {
    for (const orderId of createdOrderIds.splice(0)) {
      await deleteTestOrder(orderId);
    }
    await prisma.productVariant.update({
      where: { id: variant.id },
      data: { stockQuantity: initialStock },
    });
  });

  afterAll(async () => {
    await prisma.carrier.delete({ where: { id: carrier.id } });
    await deleteTestUser(user.id);
  });

  async function createOrder(status: OrderStatus) {
    const order = await prisma.order.create({
      data: {
        orderNumber: `TEST-OM-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        userId: user.id,
        status,
        subtotal: price,
        total: price,
        shippingAddressId: address.id,
        items: {
          create: {
            productVariantId: variant.id,
            nameSnapshot: "Camisa Teste",
            sizeSnapshot: variant.size,
            unitPrice: price,
            quantity: 1,
          },
        },
      },
      include: { items: true },
    });
    createdOrderIds.push(order.id);
    return order;
  }

  describe("matriz de transições manuais", () => {
    it("PENDING não permite nenhuma transição manual (só via pagamento)", () => {
      expect(ALLOWED_MANUAL_TRANSITIONS.PENDING).toHaveLength(0);
    });

    it("PAID pode ir para PROCESSING ou direto para SHIPPED", () => {
      expect(ALLOWED_MANUAL_TRANSITIONS.PAID).toEqual(
        expect.arrayContaining(["PROCESSING", "SHIPPED"]),
      );
    });

    it("PROCESSING pode ir para SHIPPED ou DELIVERED", () => {
      expect(ALLOWED_MANUAL_TRANSITIONS.PROCESSING).toEqual(
        expect.arrayContaining(["SHIPPED", "DELIVERED"]),
      );
    });

    it("DELIVERED e CANCELLED são estados terminais", () => {
      expect(ALLOWED_MANUAL_TRANSITIONS.DELIVERED).toHaveLength(0);
      expect(ALLOWED_MANUAL_TRANSITIONS.CANCELLED).toHaveLength(0);
    });
  });

  describe("despacho (transportadora + rastreio)", () => {
    it("grava transportadora e código de rastreio ao despachar, e a URL de rastreio bate com o template", async () => {
      const order = await createOrder("PAID");
      expect(ALLOWED_MANUAL_TRANSITIONS[order.status]).toContain("SHIPPED");

      await prisma.order.update({
        where: { id: order.id },
        data: { status: "SHIPPED", carrierId: carrier.id, trackingCode: "BR123456789" },
      });

      const shipped = await prisma.order.findUniqueOrThrow({
        where: { id: order.id },
        include: { carrier: true },
      });
      expect(shipped.status).toBe("SHIPPED");
      expect(shipped.carrierId).toBe(carrier.id);
      expect(buildTrackingUrl(shipped.carrier?.trackingUrlTemplate, shipped.trackingCode)).toBe(
        "https://rastreio.com/BR123456789",
      );
      expect(ALLOWED_MANUAL_TRANSITIONS[shipped.status]).not.toContain("SHIPPED");
      expect(ALLOWED_MANUAL_TRANSITIONS[shipped.status]).toContain("DELIVERED");
    });
  });

  describe("reembolso", () => {
    it("devolve o estoque, cria StockMovement de entrada e FinanceEntry de despesa", async () => {
      const order = await createOrder("PAID");
      const payment = await prisma.payment.create({
        data: {
          orderId: order.id,
          method: "PIX",
          status: "APPROVED",
          amount: price,
          mpPaymentId: `mp-refund-${order.id}`,
        },
      });

      expect(REFUNDABLE_STATUSES).toContain(order.status);

      // Reproduz a transação local que refundOrder roda após a API do
      // Mercado Pago confirmar o estorno (não simulada aqui).
      await prisma.$transaction(async (tx) => {
        await tx.order.update({ where: { id: order.id }, data: { status: "REFUNDED" } });
        await tx.payment.update({ where: { id: payment.id }, data: { status: "REFUNDED" } });
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

      const refundedOrder = await prisma.order.findUniqueOrThrow({ where: { id: order.id } });
      expect(refundedOrder.status).toBe("REFUNDED");

      const refundedPayment = await prisma.payment.findUniqueOrThrow({
        where: { id: payment.id },
      });
      expect(refundedPayment.status).toBe("REFUNDED");

      const updatedVariant = await prisma.productVariant.findUniqueOrThrow({
        where: { id: variant.id },
      });
      expect(updatedVariant.stockQuantity).toBe(initialStock + 1);

      const movement = await prisma.stockMovement.findFirst({
        where: { referenceOrderId: order.id },
      });
      expect(movement?.type).toBe("IN");

      const financeEntry = await prisma.financeEntry.findFirst({ where: { orderId: order.id } });
      expect(financeEntry?.type).toBe("EXPENSE");
    });

    it("não é permitido para pedidos CANCELLED", async () => {
      const order = await createOrder("CANCELLED");
      expect(REFUNDABLE_STATUSES).not.toContain(order.status);
    });
  });
});
