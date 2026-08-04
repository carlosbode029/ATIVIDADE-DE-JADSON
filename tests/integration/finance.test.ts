import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";

import { prisma } from "@/lib/prisma";
import { getFinanceSummary, listFinanceEntries } from "@/modules/finance/queries/finance.queries";
import {
  createTestAddress,
  createTestUser,
  deleteTestOrder,
  deleteTestUser,
  getSeedVariant,
} from "./helpers";

describe("financeiro (Fase 9)", () => {
  const now = new Date();
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 15);
  const dateFrom = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
  const createdEntryIds: string[] = [];

  afterEach(async () => {
    for (const id of createdEntryIds.splice(0)) {
      await prisma.financeEntry.deleteMany({ where: { id } });
    }
  });

  it("soma receita e despesa só do período filtrado, ignorando lançamentos de outros meses", async () => {
    const before = await getFinanceSummary({ dateFrom });

    const income = await prisma.financeEntry.create({
      data: { type: "INCOME", category: "Vendas", description: "Venda teste", amount: 1000 },
    });
    createdEntryIds.push(income.id);

    const expense = await prisma.financeEntry.create({
      data: { type: "EXPENSE", category: "Fornecedores", description: "Compra teste", amount: 300 },
    });
    createdEntryIds.push(expense.id);

    const outOfRange = await prisma.financeEntry.create({
      data: {
        type: "INCOME",
        category: "Vendas",
        description: "Fora do período",
        amount: 5000,
        date: lastMonth,
      },
    });
    createdEntryIds.push(outOfRange.id);

    const after = await getFinanceSummary({ dateFrom });
    expect(after.income - before.income).toBe(1000);
    expect(after.expense - before.expense).toBe(300);
    expect(after.net - before.net).toBe(700);
  });

  it("filtra por tipo e exclui lançamentos fora do intervalo de datas", async () => {
    const income = await prisma.financeEntry.create({
      data: { type: "INCOME", category: "Vendas", description: "Dentro do período", amount: 50 },
    });
    createdEntryIds.push(income.id);

    const outOfRange = await prisma.financeEntry.create({
      data: {
        type: "INCOME",
        category: "Vendas",
        description: "Fora do período",
        amount: 50,
        date: lastMonth,
      },
    });
    createdEntryIds.push(outOfRange.id);

    const result = await listFinanceEntries({ type: "INCOME", dateFrom });
    expect(result.items.every((e) => e.type === "INCOME")).toBe(true);
    expect(result.items.some((e) => e.id === income.id)).toBe(true);
    expect(result.items.some((e) => e.id === outOfRange.id)).toBe(false);
  });

  it("filtra por categoria de forma parcial e sem diferenciar maiúsculas/minúsculas", async () => {
    const expense = await prisma.financeEntry.create({
      data: { type: "EXPENSE", category: "Fornecedores", description: "Teste", amount: 10 },
    });
    createdEntryIds.push(expense.id);

    const result = await listFinanceEntries({ category: "forn" });
    expect(result.items.some((e) => e.id === expense.id)).toBe(true);
  });

  describe("lançamento vinculado a pedido", () => {
    let variant: Awaited<ReturnType<typeof getSeedVariant>>;
    let user: Awaited<ReturnType<typeof createTestUser>>;
    let address: Awaited<ReturnType<typeof createTestAddress>>;
    let orderId: string;

    beforeAll(async () => {
      variant = await getSeedVariant();
      user = await createTestUser("finance");
      address = await createTestAddress(user.id);
    });

    afterAll(async () => {
      await deleteTestUser(user.id);
    });

    it("inclui o número do pedido relacionado", async () => {
      const price = Number(variant.priceOverride ?? variant.product.price);
      const order = await prisma.order.create({
        data: {
          orderNumber: `TEST-FIN-${Date.now()}`,
          userId: user.id,
          status: "PAID",
          subtotal: price,
          total: price,
          shippingAddressId: address.id,
        },
      });
      orderId = order.id;

      const entry = await prisma.financeEntry.create({
        data: {
          type: "INCOME",
          category: "Vendas",
          description: `Pedido ${order.orderNumber}`,
          amount: price,
          orderId: order.id,
        },
      });

      const result = await listFinanceEntries({ dateFrom });
      const found = result.items.find((e) => e.id === entry.id);
      expect(found?.order?.orderNumber).toBe(order.orderNumber);

      await prisma.financeEntry.delete({ where: { id: entry.id } });
      await deleteTestOrder(orderId);
    });
  });
});
