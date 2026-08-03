import type { PaymentStatus } from "@/generated/prisma/client";

/**
 * Mapeia o status textual da API de Pagamentos do Mercado Pago para o enum
 * interno. `authorized`/`in_mediation` contam como "em processamento" — não
 * há garantia de recebimento até virar `approved`.
 */
export function mapMercadoPagoStatus(mpStatus: string | undefined): PaymentStatus {
  switch (mpStatus) {
    case "approved":
      return "APPROVED";
    case "rejected":
      return "REJECTED";
    case "cancelled":
      return "CANCELLED";
    case "refunded":
    case "charged_back":
      return "REFUNDED";
    case "in_process":
    case "authorized":
    case "in_mediation":
      return "IN_PROCESS";
    case "pending":
    default:
      return "PENDING";
  }
}
