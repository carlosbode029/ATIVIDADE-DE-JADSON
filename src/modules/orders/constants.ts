export const ORDER_STATUS_LABELS: Record<string, string> = {
  PENDING: "Aguardando pagamento",
  PAID: "Pago",
  PROCESSING: "Em preparação",
  SHIPPED: "Enviado",
  DELIVERED: "Entregue",
  CANCELLED: "Cancelado",
  REFUNDED: "Reembolsado",
};

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  PIX: "Pix",
  CREDIT_CARD: "Cartão de crédito",
  BOLETO: "Boleto",
};

export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  PENDING: "Aguardando pagamento",
  IN_PROCESS: "Em análise",
  APPROVED: "Aprovado",
  REJECTED: "Recusado",
  REFUNDED: "Reembolsado",
  CANCELLED: "Cancelado",
};
