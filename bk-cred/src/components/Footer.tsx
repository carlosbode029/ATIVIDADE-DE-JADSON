import { Clock, MapPin, MessageCircle } from "lucide-react";
import { Container } from "./Container";
import { InstagramIcon } from "./icons/InstagramIcon";
import { getWhatsAppUrl } from "@/lib/whatsapp";

export function Footer() {
  return (
    <footer className="border-t border-border-subtle py-10">
      <Container className="flex flex-col items-center gap-5 text-center">
        <span className="font-display text-lg font-bold text-gold">
          BK CRÉD
        </span>

        <div className="flex flex-col items-center gap-2 text-sm text-muted">
          <a
            href={getWhatsAppUrl("Olá! Vim pelo site da BK CRÉD.")}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 transition-colors hover:text-foreground"
          >
            <MessageCircle className="h-4 w-4" />
            WhatsApp
          </a>
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 transition-colors hover:text-foreground"
          >
            <InstagramIcon className="h-4 w-4" />
            Instagram
          </a>
          <span className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            São Paulo, SP
          </span>
          <span className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Seg a Sáb · 9h às 19h
          </span>
        </div>

        <p className="text-xs text-muted/70">
          © {new Date().getFullYear()} BK CRÉD. Todos os direitos reservados.
        </p>
      </Container>
    </footer>
  );
}
