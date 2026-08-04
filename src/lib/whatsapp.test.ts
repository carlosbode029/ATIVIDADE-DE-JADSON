import { afterEach, describe, expect, it, vi } from "vitest";

import { buildProductInquiryMessage, buildWhatsAppLink } from "@/lib/whatsapp";

describe("buildWhatsAppLink", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("builds a wa.me link with the explicit phone, stripping non-digit characters", () => {
    const link = buildWhatsAppLink("Olá!", "+55 (11) 99999-8888");
    expect(link).toBe("https://wa.me/5511999998888?text=Ol%C3%A1%21");
  });

  it("falls back to NEXT_PUBLIC_WHATSAPP_NUMBER when no phone is given", () => {
    vi.stubEnv("NEXT_PUBLIC_WHATSAPP_NUMBER", "5511988887777");
    const link = buildWhatsAppLink("Oi");
    expect(link).toBe("https://wa.me/5511988887777?text=Oi");
  });

  it("omits the phone segment when neither an explicit phone nor the env var is set", () => {
    vi.stubEnv("NEXT_PUBLIC_WHATSAPP_NUMBER", "");
    const link = buildWhatsAppLink("Oi");
    expect(link).toBe("https://wa.me/?text=Oi");
  });

  it("URL-encodes the message text", () => {
    const link = buildWhatsAppLink("Pedido #123 & dúvida", "5511999998888");
    expect(link).toContain("text=Pedido+%23123+%26+d%C3%BAvida");
  });
});

describe("buildProductInquiryMessage", () => {
  it("mentions the product name and includes the product URL", () => {
    const message = buildProductInquiryMessage(
      "Camisa Flamengo I 2024",
      "https://bkimports.com.br/produtos/camisa-flamengo-i-2024",
    );
    expect(message).toContain("Camisa Flamengo I 2024");
    expect(message).toContain("https://bkimports.com.br/produtos/camisa-flamengo-i-2024");
  });
});
