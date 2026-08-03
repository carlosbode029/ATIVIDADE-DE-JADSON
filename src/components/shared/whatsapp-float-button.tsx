import { MessageCircle } from "lucide-react";

import { buildWhatsAppLink } from "@/lib/whatsapp";

export function WhatsAppFloatButton() {
  const href = buildWhatsAppLink(
    "Olá! Vim pelo site da BK IMPORTS e gostaria de mais informações.",
  );

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      aria-label="Falar no WhatsApp"
      className="fixed bottom-6 right-6 z-50 flex size-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-black/30 transition-transform hover:scale-105"
    >
      <MessageCircle className="size-7" fill="currentColor" />
    </a>
  );
}
