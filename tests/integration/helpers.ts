import { prisma } from "@/lib/prisma";

/**
 * Fixtures compartilhadas pelos testes de integração. Cada teste roda
 * contra um Postgres real (a mesma lógica dos scripts descartáveis
 * `prisma/_validate-*.ts` usados durante o desenvolvimento de cada fase,
 * agora permanente) — os dados criados aqui são sempre limpos no
 * `afterEach`/`afterAll` do próprio teste, nunca deixados no banco.
 */

export async function getSeedVariant() {
  const variant = await prisma.productVariant.findFirst({
    include: { product: true },
  });
  if (!variant) {
    throw new Error(
      "Nenhuma ProductVariant encontrada. Rode `npm run db:seed` antes dos testes de integração.",
    );
  }
  return variant;
}

export async function createTestUser(prefix: string) {
  return prisma.user.create({
    data: {
      supabaseUserId: `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: "Cliente Teste",
      email: `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.com`,
    },
  });
}

export async function createTestAddress(userId: string) {
  return prisma.address.create({
    data: {
      userId,
      label: "Casa",
      recipient: "Cliente Teste",
      street: "Rua Teste",
      number: "123",
      neighborhood: "Centro",
      city: "São Paulo",
      state: "SP",
      zipCode: "01000-000",
    },
  });
}

export async function deleteTestUser(userId: string) {
  await prisma.address.deleteMany({ where: { userId } });
  await prisma.user.delete({ where: { id: userId } });
}

export async function deleteTestOrder(orderId: string) {
  await prisma.stockMovement.deleteMany({ where: { referenceOrderId: orderId } });
  await prisma.financeEntry.deleteMany({ where: { orderId } });
  await prisma.payment.deleteMany({ where: { orderId } });
  await prisma.orderItem.deleteMany({ where: { orderId } });
  await prisma.order.delete({ where: { id: orderId } });
}
