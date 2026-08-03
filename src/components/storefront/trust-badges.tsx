import { CreditCard, ShieldCheck, Sparkles, Truck } from "lucide-react";

const BADGES = [
  {
    icon: ShieldCheck,
    title: "Qualidade premium",
    description: "Tecido de alta performance e acabamento profissional.",
  },
  {
    icon: CreditCard,
    title: "Pagamento seguro",
    description: "Pix, cartão e boleto via Mercado Pago.",
  },
  {
    icon: Truck,
    title: "Pronta entrega e sob encomenda",
    description: "Acompanhe seu pedido com código de rastreio.",
  },
  {
    icon: Sparkles,
    title: "Personalização",
    description: "Nome, número e patch oficial nas camisas elegíveis.",
  },
] as const;

export function TrustBadges() {
  return (
    <section className="border-y border-border/60 bg-card">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
        {BADGES.map(({ icon: Icon, title, description }) => (
          <div key={title} className="flex items-start gap-4">
            <Icon className="size-8 shrink-0 text-gold" />
            <div>
              <h3 className="text-sm font-semibold">{title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
