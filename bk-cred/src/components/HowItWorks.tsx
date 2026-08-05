"use client";

import { motion } from "framer-motion";
import { CreditCard, BarChart3, MessageCircle, Zap } from "lucide-react";
import { Container } from "./Container";
import { fadeInUp, staggerContainer } from "@/lib/motion";

const steps = [
  {
    icon: CreditCard,
    title: "Informe o valor",
    description: "Escolha quanto você precisa direto no simulador.",
  },
  {
    icon: BarChart3,
    title: "Veja sua simulação",
    description: "Parcelas e valores calculados na hora, sem burocracia.",
  },
  {
    icon: MessageCircle,
    title: "Converse pelo WhatsApp",
    description: "Fale com um especialista e confirme sua solicitação.",
  },
  {
    icon: Zap,
    title: "Receba no PIX",
    description: "Dinheiro na sua conta com aprovação rápida.",
  },
];

export function HowItWorks() {
  return (
    <section id="como-funciona" className="py-16 sm:py-24">
      <Container>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={fadeInUp}
          className="mb-10 text-center"
        >
          <h2 className="font-display text-2xl font-bold text-foreground sm:text-3xl">
            Como funciona
          </h2>
          <p className="mt-2 text-sm text-muted sm:text-base">
            Do pedido ao PIX em quatro passos simples.
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={staggerContainer}
          className="flex flex-col gap-4"
        >
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              variants={fadeInUp}
              className="glass-card group relative flex items-center gap-4 rounded-2xl p-5 transition-colors sm:hover:border-gold/30"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gold-dim text-gold">
                <step.icon className="h-6 w-6" strokeWidth={2} />
              </div>
              <div className="min-w-0">
                <h3 className="font-display text-base font-bold text-foreground">
                  {step.title}
                </h3>
                <p className="mt-0.5 text-sm leading-snug text-muted">
                  {step.description}
                </p>
              </div>
              <span className="absolute -top-2.5 -right-2.5 flex h-7 w-7 items-center justify-center rounded-full bg-background-elevated text-xs font-bold text-gold ring-1 ring-border-subtle">
                {index + 1}
              </span>
            </motion.div>
          ))}
        </motion.div>
      </Container>
    </section>
  );
}
