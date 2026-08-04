import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";

import { prisma } from "@/lib/prisma";
import { processPaymentUpdate } from "@/modules/payments/services/process-payment-update";
import {
  createTestAddress,
  createTestUser,
  deleteTestOrder,
  deleteTestUser,
  getSeedVariant,
} from "./helpers";

/**
 * processPaymentUpdate é o único ponto que aplica os efeitos colaterais de
 * aprovação (pedido pago, baixa de estoque, StockMovement, FinanceEntry) ou
 * recusa (pedido cancelado) — chamado tanto pelo webhook quanto pela
 * verificação manual/síncrona do cartão (Fase 5).
 */
describe("processPaymentUpdate", () => {
  let variant: Awaited<ReturnType<typeof getSeedVariant>>;
  let price: number;
  let initialStock: number;
  let user: Awaited<ReturnType<typeof createTestUser>>;
  let address: Awaited<ReturnType<typeof createTestAddress>>;
  const createdOrderIds: string[] = [];

  beforeAll(async () => {
    variant = await getSeedVariant();
    price = Number(variant.priceOverride ?? variant.product.price);
    initialStock = variant.stockQuantity;
    user = await createTestUser("payments");
    address = await createTestAddress(user.id);
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
    await deleteTestUser(user.id);
  });

  async function createPendingOrder(method: "CREDIT_CARD" | "PIX") {
    const order = await prisma.order.create({
      data: {
        orderNumber: `TEST-PAY-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        userId: user.id,
        status: "PENDING",
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
        payments: { create: { method, status: "PENDING", amount: price } },
      },
      include: { payments: true },
    });
    createdOrderIds.push(order.id);
    return order;
  }

  it("approves a pending card payment: pays the order, decrements stock, and logs the movement/finance entry", async () => {
    const order = await createPendingOrder("CREDIT_CARD");
    const payment = order.payments[0];

    // Reproduz o que createCardCharge faz: grava mpPaymentId SEM tocar o
    // status — processPaymentUpdate é quem decide a transição.
    await prisma.payment.update({
      where: { id: payment.id },
      data: { mpPaymentId: `mp-${order.id}` },
    });

    await processPaymentUpdate({ id: `mp-${order.id}`, status: "approved" } as never);

    const updatedOrder = await prisma.order.findUniqueOrThrow({ where: { id: order.id } });
    expect(updatedOrder.status).toBe("PAID");

    const updatedPayment = await prisma.payment.findUniqueOrThrow({ where: { id: payment.id } });
    expect(updatedPayment.status).toBe("APPROVED");

    const updatedVariant = await prisma.productVariant.findUniqueOrThrow({
      where: { id: variant.id },
    });
    expect(updatedVariant.stockQuantity).toBe(initialStock - 1);

    const movement = await prisma.stockMovement.findFirst({
      where: { referenceOrderId: order.id },
    });
    expect(movement?.type).toBe("OUT");

    const financeEntry = await prisma.financeEntry.findFirst({ where: { orderId: order.id } });
    expect(financeEntry?.type).toBe("INCOME");
  });

  it("is idempotent: replaying the same approval notification does not decrement stock twice", async () => {
    const order = await createPendingOrder("CREDIT_CARD");
    const payment = order.payments[0];
    await prisma.payment.update({
      where: { id: payment.id },
      data: { mpPaymentId: `mp-${order.id}` },
    });

    await processPaymentUpdate({ id: `mp-${order.id}`, status: "approved" } as never);
    await processPaymentUpdate({ id: `mp-${order.id}`, status: "approved" } as never);

    const updatedVariant = await prisma.productVariant.findUniqueOrThrow({
      where: { id: variant.id },
    });
    expect(updatedVariant.stockQuantity).toBe(initialStock - 1);
  });

  it("cancels the order on rejection without touching stock", async () => {
    const order = await createPendingOrder("CREDIT_CARD");
    const payment = order.payments[0];
    await prisma.payment.update({
      where: { id: payment.id },
      data: { mpPaymentId: `mp-rej-${order.id}` },
    });

    await processPaymentUpdate({ id: `mp-rej-${order.id}`, status: "rejected" } as never);

    const updatedOrder = await prisma.order.findUniqueOrThrow({ where: { id: order.id } });
    expect(updatedOrder.status).toBe("CANCELLED");

    const updatedVariant = await prisma.productVariant.findUniqueOrThrow({
      where: { id: variant.id },
    });
    expect(updatedVariant.stockQuantity).toBe(initialStock);
  });

  it("does nothing when no Payment matches the given mpPaymentId", async () => {
    await expect(
      processPaymentUpdate({ id: "mp-does-not-exist", status: "approved" } as never),
    ).resolves.toBeUndefined();
  });
});
