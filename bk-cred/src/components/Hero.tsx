"use client";

import { motion } from "framer-motion";
import { ArrowDown, Shield, Zap } from "lucide-react";
import { Container } from "./Container";
import { fadeInUp, staggerContainer } from "@/lib/motion";

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-8 pb-16 sm:pt-14 sm:pb-24">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-gold/15 blur-[110px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-40 -right-24 h-72 w-72 rounded-full bg-green/10 blur-[100px]"
      />

      <Container className="relative flex flex-col items-center text-center">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="flex flex-col items-center"
        >
          <motion.div
            variants={fadeInUp}
            className="mb-8 flex items-center gap-2 rounded-full border border-border-subtle bg-surface/60 px-4 py-2"
          >
            <span className="font-display text-sm font-bold tracking-wide text-gold">
              BK CRÉD
            </span>
            <span className="h-1 w-1 rounded-full bg-muted" />
            <span className="text-xs text-muted">Crédito via PIX</span>
          </motion.div>

          <motion.h1
            variants={fadeInUp}
            className="text-balance font-display text-[2.1rem] font-bold leading-[1.15] tracking-tight text-foreground sm:text-5xl"
          >
            Transforme o limite do seu cartão em{" "}
            <span className="text-gold">dinheiro via PIX</span>
          </motion.h1>

          <motion.p
            variants={fadeInUp}
            className="mt-5 max-w-sm text-balance text-base leading-relaxed text-muted sm:text-lg"
          >
            Simule gratuitamente. Resposta rápida. Parcelamento em até 12x.
          </motion.p>

          <motion.div variants={fadeInUp} className="mt-9 w-full max-w-xs">
            <a
              href="#simulador"
              className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-green px-8 py-5 text-base font-bold text-black shadow-[0_8px_30px_rgba(34,197,94,0.35)] transition-transform duration-200 active:scale-95 sm:hover:scale-[1.02]"
            >
              <Zap className="h-5 w-5 fill-black" strokeWidth={0} />
              SIMULAR AGORA
            </a>
            <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-muted">
              <Shield className="h-3.5 w-3.5" />
              100% seguro e sem compromisso
            </div>
          </motion.div>

          <motion.div variants={fadeInUp} className="mt-14 text-muted">
            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            >
              <ArrowDown className="h-5 w-5" />
            </motion.div>
          </motion.div>
        </motion.div>
      </Container>
    </section>
  );
}
