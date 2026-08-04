import { describe, expect, it } from "vitest";

import {
  extractBoletoDisplayData,
  extractPixDisplayData,
} from "@/modules/payments/services/extract-payment-display-data";

describe("extractPixDisplayData", () => {
  it("extracts qr_code, qr_code_base64 and ticket_url from the payload", () => {
    const result = extractPixDisplayData({
      point_of_interaction: {
        transaction_data: {
          qr_code: "00020126...",
          qr_code_base64: "aGVsbG8=",
          ticket_url: "https://mercadopago.com/ticket/123",
        },
      },
    });

    expect(result).toEqual({
      qrCode: "00020126...",
      qrCodeBase64: "aGVsbG8=",
      ticketUrl: "https://mercadopago.com/ticket/123",
    });
  });

  it.each([null, undefined, {}, "string", 42, { point_of_interaction: null }])(
    "returns all-null fields for malformed payload %p instead of throwing",
    (payload) => {
      expect(extractPixDisplayData(payload)).toEqual({
        qrCode: null,
        qrCodeBase64: null,
        ticketUrl: null,
      });
    },
  );

  it("ignores empty strings (treats them as absent)", () => {
    const result = extractPixDisplayData({
      point_of_interaction: { transaction_data: { qr_code: "" } },
    });
    expect(result.qrCode).toBeNull();
  });
});

describe("extractBoletoDisplayData", () => {
  it("extracts barcode content, digitable line and external resource url", () => {
    const result = extractBoletoDisplayData({
      transaction_details: {
        barcode: { content: "34191..." },
        digitable_line: "34191.09008 61234.567804",
        external_resource_url: "https://mercadopago.com/boleto/456.pdf",
      },
    });

    expect(result).toEqual({
      barcodeContent: "34191...",
      digitableLine: "34191.09008 61234.567804",
      externalResourceUrl: "https://mercadopago.com/boleto/456.pdf",
    });
  });

  it.each([null, undefined, {}, "string", 42])(
    "returns all-null fields for malformed payload %p instead of throwing",
    (payload) => {
      expect(extractBoletoDisplayData(payload)).toEqual({
        barcodeContent: null,
        digitableLine: null,
        externalResourceUrl: null,
      });
    },
  );
});
