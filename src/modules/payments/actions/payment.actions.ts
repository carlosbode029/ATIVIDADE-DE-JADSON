"use server";

import { revalidatePath } from "next/cache";
import { Payment as MercadoPagoPayment } from "mercadopago";

import { mercadoPagoConfig } from "@/lib/mercado-pago";
import { prisma } from "@/lib/prisma";
import { siteUrl } from "@/lib/site-url";
import type { Prisma } from "@/generated/prisma/client";
import { getCurrentUser } from "@/modules/auth/queries/get-current-user";
import {
  extractBoletoDisplayData,
  extractPixDisplayData,
} from "@/modules/payments/services/extract-payment-display-data";
import { mapMercadoPagoStatus } from "@/modules/payments/services/mercado-pago-status";
import { processPaymentUpdate } from "@/modules/payments/services/process-payment-update";
import {
  boletoChargeSchema,
  cardChargeSchema,
  pixChargeSchema,
  type BoletoChargeInput,
  type CardChargeInput,
  type PixChargeInput,
} from "@/modules/payments/schemas/payment.schema";

type ActionResult = { error?: string };

function splitName(fullName: string) {
  const [firstName, ...rest] = fullName.trim().split(/\s+/);
  return { firstName, lastName: rest.join(" ") || firstName };
}

async function loadOrderForCharge(orderId: string) {
  const user = await getCurrentUser();
  if (!user) return { error: "Você precisa estar autenticado." } as const;

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { payments: { orderBy: { createdAt: "desc" } } },
  });

  if (!order || order.userId !== user.id) {
    return { error: "Pedido não encontrado." } as const;
  }
  if (order.status !== "PENDING") {
    return { error: "Este pedido já não está mais aguardando pagamento." } as const;
  }

  const payment = order.payments[0];
  if (!payment) {
    return { error: "Nenhuma cobrança pendente para este pedido." } as const;
  }

  return { user, order, payment } as const;
}

type PixChargeResult = ActionResult & {
  qrCode?: string | null;
  qrCodeBase64?: string | null;
  ticketUrl?: string | null;
};

export async function createPixCharge(input: PixChargeInput): Promise<PixChargeResult> {
  const parsed = pixChargeSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const context = await loadOrderForCharge(parsed.data.orderId);
  if ("error" in context) return { error: context.error };
  const { user, order, payment } = context;

  if (payment.method !== "PIX") {
    return { error: "Este pedido não está configurado para pagamento via Pix." };
  }

  const { firstName, lastName } = splitName(user.name);
  const mpPaymentClient = new MercadoPagoPayment(mercadoPagoConfig);

  let response;
  try {
    response = await mpPaymentClient.create({
      body: {
        transaction_amount: Number(order.total),
        description: `Pedido ${order.orderNumber} — BK IMPORTS`,
        payment_method_id: "pix",
        external_reference: order.id,
        notification_url: `${siteUrl()}/api/webhooks/mercado-pago`,
        payer: {
          email: user.email,
          first_name: firstName,
          last_name: lastName,
          identification: { type: "CPF", number: parsed.data.cpf },
        },
      },
    });
  } catch {
    return { error: "Não foi possível gerar o Pix. Tente novamente." };
  }

  const display = extractPixDisplayData(response);

  await prisma.$transaction([
    prisma.payment.update({
      where: { id: payment.id },
      data: {
        mpPaymentId: String(response.id),
        status: mapMercadoPagoStatus(response.status),
        rawPayload: response as unknown as Prisma.InputJsonValue,
        receiptUrl: display.ticketUrl,
      },
    }),
    prisma.user.update({ where: { id: user.id }, data: { document: parsed.data.cpf } }),
  ]);

  revalidatePath(`/pedido/${order.id}`);
  return display;
}

type BoletoChargeResult = ActionResult & {
  barcodeContent?: string | null;
  digitableLine?: string | null;
  externalResourceUrl?: string | null;
};

export async function createBoletoCharge(
  input: BoletoChargeInput,
): Promise<BoletoChargeResult> {
  const parsed = boletoChargeSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const context = await loadOrderForCharge(parsed.data.orderId);
  if ("error" in context) return { error: context.error };
  const { user, order, payment } = context;

  if (payment.method !== "BOLETO") {
    return { error: "Este pedido não está configurado para pagamento via boleto." };
  }

  const address = await prisma.address.findUnique({
    where: { id: order.shippingAddressId },
  });
  const { firstName, lastName } = splitName(user.name);
  const mpPaymentClient = new MercadoPagoPayment(mercadoPagoConfig);

  let response;
  try {
    response = await mpPaymentClient.create({
      body: {
        transaction_amount: Number(order.total),
        description: `Pedido ${order.orderNumber} — BK IMPORTS`,
        payment_method_id: "bolbradesco",
        external_reference: order.id,
        notification_url: `${siteUrl()}/api/webhooks/mercado-pago`,
        payer: {
          email: user.email,
          first_name: firstName,
          last_name: lastName,
          identification: { type: "CPF", number: parsed.data.cpf },
          address: address
            ? {
                zip_code: address.zipCode,
                street_name: address.street,
                street_number: address.number,
                neighborhood: address.neighborhood,
                city: address.city,
                federal_unit: address.state,
              }
            : undefined,
        },
      },
    });
  } catch {
    return { error: "Não foi possível gerar o boleto. Tente novamente." };
  }

  const display = extractBoletoDisplayData(response);

  await prisma.$transaction([
    prisma.payment.update({
      where: { id: payment.id },
      data: {
        mpPaymentId: String(response.id),
        status: mapMercadoPagoStatus(response.status),
        rawPayload: response as unknown as Prisma.InputJsonValue,
        receiptUrl: display.externalResourceUrl,
      },
    }),
    prisma.user.update({ where: { id: user.id }, data: { document: parsed.data.cpf } }),
  ]);

  revalidatePath(`/pedido/${order.id}`);
  return display;
}

export async function createCardCharge(input: CardChargeInput): Promise<ActionResult> {
  const parsed = cardChargeSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const context = await loadOrderForCharge(parsed.data.orderId);
  if ("error" in context) return { error: context.error };
  const { user, order, payment } = context;

  if (payment.method !== "CREDIT_CARD") {
    return { error: "Este pedido não está configurado para pagamento via cartão." };
  }

  const mpPaymentClient = new MercadoPagoPayment(mercadoPagoConfig);

  let response;
  try {
    response = await mpPaymentClient.create({
      body: {
        transaction_amount: Number(order.total),
        description: `Pedido ${order.orderNumber} — BK IMPORTS`,
        token: parsed.data.token,
        installments: parsed.data.installments,
        payment_method_id: parsed.data.paymentMethodId,
        issuer_id: parsed.data.issuerId ? Number(parsed.data.issuerId) : undefined,
        external_reference: order.id,
        notification_url: `${siteUrl()}/api/webhooks/mercado-pago`,
        payer: {
          email: user.email,
          identification: { type: "CPF", number: parsed.data.cpf },
        },
      },
    });
  } catch {
    return { error: "Pagamento recusado. Verifique os dados do cartão." };
  }

  await prisma.$transaction([
    prisma.payment.update({
      where: { id: payment.id },
      data: {
        mpPaymentId: String(response.id),
        installments: response.installments,
        rawPayload: response as unknown as Prisma.InputJsonValue,
      },
    }),
    prisma.user.update({ where: { id: user.id }, data: { document: parsed.data.cpf } }),
  ]);

  // A transição de status (e os efeitos colaterais de pedido pago — baixa de
  // estoque, lançamento financeiro) fica a cargo de processPaymentUpdate, que
  // só age se o status realmente mudou. Por isso o update acima não grava o
  // status: gravá-lo aqui faria a comparação de idempotência abaixo achar que
  // nada mudou e pular a transação inteira.
  await processPaymentUpdate(response);

  revalidatePath(`/pedido/${order.id}`);
  return response.status === "rejected"
    ? { error: "Pagamento recusado pela operadora do cartão." }
    : {};
}

export async function checkPaymentStatus(
  orderId: string,
): Promise<{ error?: string; status?: string }> {
  const user = await getCurrentUser();
  if (!user) return { error: "Você precisa estar autenticado." };

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { payments: { orderBy: { createdAt: "desc" } } },
  });
  if (!order || order.userId !== user.id) {
    return { error: "Pedido não encontrado." };
  }

  const payment = order.payments[0];
  if (!payment?.mpPaymentId) {
    return { error: "Nenhuma cobrança gerada ainda." };
  }

  const mpPaymentClient = new MercadoPagoPayment(mercadoPagoConfig);
  const response = await mpPaymentClient.get({ id: payment.mpPaymentId });
  await processPaymentUpdate(response);

  revalidatePath(`/pedido/${orderId}`);
  return { status: response.status };
}
