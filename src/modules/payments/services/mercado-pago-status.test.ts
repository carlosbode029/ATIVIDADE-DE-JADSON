import { describe, expect, it } from "vitest";

import { mapMercadoPagoStatus } from "@/modules/payments/services/mercado-pago-status";

describe("mapMercadoPagoStatus", () => {
  it("maps approved", () => {
    expect(mapMercadoPagoStatus("approved")).toBe("APPROVED");
  });

  it("maps rejected", () => {
    expect(mapMercadoPagoStatus("rejected")).toBe("REJECTED");
  });

  it("maps cancelled", () => {
    expect(mapMercadoPagoStatus("cancelled")).toBe("CANCELLED");
  });

  it("maps refunded and charged_back to REFUNDED", () => {
    expect(mapMercadoPagoStatus("refunded")).toBe("REFUNDED");
    expect(mapMercadoPagoStatus("charged_back")).toBe("REFUNDED");
  });

  it("maps in_process, authorized and in_mediation to IN_PROCESS", () => {
    expect(mapMercadoPagoStatus("in_process")).toBe("IN_PROCESS");
    expect(mapMercadoPagoStatus("authorized")).toBe("IN_PROCESS");
    expect(mapMercadoPagoStatus("in_mediation")).toBe("IN_PROCESS");
  });

  it("maps pending and unknown/undefined values to PENDING", () => {
    expect(mapMercadoPagoStatus("pending")).toBe("PENDING");
    expect(mapMercadoPagoStatus(undefined)).toBe("PENDING");
    expect(mapMercadoPagoStatus("algo-inesperado")).toBe("PENDING");
  });
});
