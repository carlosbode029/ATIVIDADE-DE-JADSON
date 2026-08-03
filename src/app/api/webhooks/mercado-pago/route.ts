import { NextResponse, type NextRequest } from "next/server";
import {
  Payment as MercadoPagoPayment,
  InvalidWebhookSignatureError,
  WebhookSignatureValidator,
} from "mercadopago";

import { mercadoPagoConfig } from "@/lib/mercado-pago";
import { processPaymentUpdate } from "@/modules/payments/services/process-payment-update";

/**
 * Notificação do Mercado Pago (webhook). A assinatura é validada com o
 * segredo configurado no painel de integrações antes de qualquer efeito
 * colateral — sem isso, qualquer request forjada poderia marcar pedidos
 * como pagos.
 */
export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const dataId = searchParams.get("data.id") ?? searchParams.get("id");
  const topic = searchParams.get("type") ?? searchParams.get("topic");

  const secret = process.env.MERCADO_PAGO_WEBHOOK_SECRET;
  if (!secret) {
    console.error("MERCADO_PAGO_WEBHOOK_SECRET não configurado.");
    return NextResponse.json({ error: "webhook não configurado" }, { status: 500 });
  }

  try {
    // Sem `toleranceSeconds`: a checagem de janela de tempo do SDK compara
    // `Date.now()` (ms) contra o `ts` do cabeçalho, que o Mercado Pago envia
    // em segundos — isso faz a checagem rejeitar toda notificação legítima.
    // A verificação de assinatura (HMAC) abaixo continua ativa normalmente;
    // `processPaymentUpdate` já é idempotente, então reprocessar uma
    // notificação antiga não tem efeito colateral.
    WebhookSignatureValidator.validate({
      xSignature: request.headers.get("x-signature"),
      xRequestId: request.headers.get("x-request-id"),
      dataId,
      secret,
    });
  } catch (error) {
    if (error instanceof InvalidWebhookSignatureError) {
      console.error("Assinatura de webhook inválida:", error.reason);
      return NextResponse.json({ error: "assinatura inválida" }, { status: 401 });
    }
    throw error;
  }

  if (topic !== "payment" || !dataId) {
    return NextResponse.json({ received: true });
  }

  try {
    const mpPaymentClient = new MercadoPagoPayment(mercadoPagoConfig);
    const payment = await mpPaymentClient.get({ id: dataId });
    await processPaymentUpdate(payment);
  } catch (error) {
    console.error("Falha ao processar notificação de pagamento:", error);
    return NextResponse.json({ error: "falha ao processar" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
