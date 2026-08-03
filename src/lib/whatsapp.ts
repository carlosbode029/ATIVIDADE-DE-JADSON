const DIGITS_ONLY = /\D/g;

/**
 * Monta um link `wa.me` com mensagem pré-preenchida.
 * A automação via WhatsApp Business API é um upgrade de fase futura;
 * aqui cobrimos o fluxo padrão (botão flutuante e "comprar pelo WhatsApp").
 */
export function buildWhatsAppLink(message: string, phone?: string) {
  const target = (phone ?? process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "").replace(
    DIGITS_ONLY,
    "",
  );

  const params = new URLSearchParams({ text: message });
  return target ? `https://wa.me/${target}?${params}` : `https://wa.me/?${params}`;
}

export function buildProductInquiryMessage(productName: string, productUrl: string) {
  return `Olá! Tenho interesse na camisa "${productName}". ${productUrl}`;
}
