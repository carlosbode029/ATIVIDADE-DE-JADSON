function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : null;
}

function asString(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

export type PixDisplayData = {
  qrCode: string | null;
  qrCodeBase64: string | null;
  ticketUrl: string | null;
};

export type BoletoDisplayData = {
  barcodeContent: string | null;
  digitableLine: string | null;
  externalResourceUrl: string | null;
};

/**
 * Lê os campos de exibição do Pix (QR code) tanto de uma resposta fresca do
 * SDK do Mercado Pago quanto do `rawPayload` (JSON) salvo no banco — as duas
 * fontes têm o mesmo formato, então a mesma extração serve para exibição
 * imediata após gerar a cobrança e para reconstrução ao recarregar a página.
 */
export function extractPixDisplayData(rawPayload: unknown): PixDisplayData {
  const pointOfInteraction = asRecord(asRecord(rawPayload)?.point_of_interaction);
  const transactionData = asRecord(pointOfInteraction?.transaction_data);
  return {
    qrCode: asString(transactionData?.qr_code),
    qrCodeBase64: asString(transactionData?.qr_code_base64),
    ticketUrl: asString(transactionData?.ticket_url),
  };
}

export function extractBoletoDisplayData(rawPayload: unknown): BoletoDisplayData {
  const transactionDetails = asRecord(asRecord(rawPayload)?.transaction_details);
  const barcode = asRecord(transactionDetails?.barcode);
  return {
    barcodeContent: asString(barcode?.content),
    digitableLine: asString(transactionDetails?.digitable_line),
    externalResourceUrl: asString(transactionDetails?.external_resource_url),
  };
}
