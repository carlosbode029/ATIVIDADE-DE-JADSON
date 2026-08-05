"use client";

import { motion } from "framer-motion";
import { Zap, Lock, CreditCard, Smartphone, Wallet } from "lucide-react";
import { Container } from "./Container";
import { fadeInUp, staggerContainer } from "@/lib/motion";

const items = [
  { icon: Zap, title: "Atendimento rápido" },
  { icon: Lock, title: "Segurança" },
  { icon: CreditCard, title: "Diversas bandeiras" },
  { icon: Smartphone, title: "Atendimento humanizado" },
  { icon: Wallet, title: "PIX rápido" },
];

export function Differentials() {
  return (
    <section className="py-16 sm:py-24">
      <Container>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={fadeInUp}
          className="mb-10 text-center"
        >
          <h2 className="font-display text-2xl font-bold text-foreground sm:text-3xl">
            Por que escolher a BK CRÉD?
          </h2>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={staggerContainer}
          className="grid grid-cols-2 gap-3 sm:grid-cols-3"
        >
          {items.map((item) => (
            <motion.div
              key={item.title}
              variants={fadeInUp}
              whileHover={{ y: -3 }}
              className="glass-card flex flex-col items-center gap-3 rounded-2xl p-5 text-center transition-colors sm:hover:border-gold/30"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gold-dim text-gold">
                <item.icon className="h-5 w-5" strokeWidth={2} />
              </div>
              <span className="text-sm font-semibold leading-snug text-foreground">
                {item.title}
              </span>
            </motion.div>
          ))}
        </motion.div>
      </Container>
    </section>
  );
}
