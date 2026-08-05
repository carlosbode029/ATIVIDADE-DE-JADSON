"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MessageCircle } from "lucide-react";
import { Container } from "./Container";
import { fadeInUp } from "@/lib/motion";
import {
  MAX_INSTALLMENTS,
  MAX_VALUE,
  MIN_INSTALLMENTS,
  MIN_VALUE,
  VALUE_STEP,
  calculateInstallment,
  calculateTotal,
  formatCurrency,
  getSimulationMood,
  SIMULATION_MESSAGES,
} from "@/lib/simulation";
import { buildSimulationMessage, getWhatsAppUrl } from "@/lib/whatsapp";

export function Simulator() {
  const [value, setValue] = useState(3000);
  const [installments, setInstallments] = useState(6);
  const [name, setName] = useState("");
  const [city, setCity] = useState("");

  const installmentValue = useMemo(
    () => calculateInstallment(value, installments),
    [value, installments],
  );
  const total = useMemo(
    () => calculateTotal(value, installments),
    [value, installments],
  );
  const mood = getSimulationMood(value);
  const moodMessage = SIMULATION_MESSAGES[mood];

  const valuePercent = ((value - MIN_VALUE) / (MAX_VALUE - MIN_VALUE)) * 100;
  const installmentsPercent =
    ((installments - MIN_INSTALLMENTS) /
      (MAX_INSTALLMENTS - MIN_INSTALLMENTS)) *
    100;

  const whatsappUrl = getWhatsAppUrl(
    buildSimulationMessage({
      value,
      installments,
      installmentValue,
      name: name.trim() || undefined,
      city: city.trim() || undefined,
    }),
  );

  return (
    <section id="simulador" className="py-16 sm:py-24">
      <Container>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={fadeInUp}
          className="mb-8 text-center"
        >
          <h2 className="font-display text-2xl font-bold text-foreground sm:text-3xl">
            Quanto você precisa hoje?
          </h2>
          <p className="mt-2 text-sm text-muted sm:text-base">
            Movimente os controles e veja sua simulação em tempo real.
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={fadeInUp}
          className="glass-card rounded-3xl p-6 sm:p-8"
        >
          <div className="text-center">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted">
              Valor desejado
            </span>
            <AnimatePresence mode="popLayout">
              <motion.div
                key={value}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
                className="font-display text-4xl font-extrabold text-gold sm:text-5xl"
              >
                {formatCurrency(value)}
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="mt-6">
            <input
              type="range"
              min={MIN_VALUE}
              max={MAX_VALUE}
              step={VALUE_STEP}
              value={value}
              onChange={(e) => setValue(Number(e.target.value))}
              style={{ "--slider-fill": `${valuePercent}%` } as React.CSSProperties}
              aria-label="Valor desejado"
            />
            <div className="mt-2 flex justify-between text-xs text-muted">
              <span>{formatCurrency(MIN_VALUE)}</span>
              <span>{formatCurrency(MAX_VALUE)}</span>
            </div>
          </div>

          <div className="mt-3 flex justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={mood}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.25 }}
                className="flex items-center gap-1.5 rounded-full bg-gold-dim px-3.5 py-1.5 text-xs font-medium text-gold-soft sm:text-sm"
              >
                <span>{moodMessage.emoji}</span>
                <span>{moodMessage.text}</span>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="mt-8 border-t border-border-subtle pt-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted">
                Parcelas
              </span>
              <span className="font-display text-lg font-bold text-foreground">
                {installments}x
              </span>
            </div>
            <div className="mt-3">
              <input
                type="range"
                min={MIN_INSTALLMENTS}
                max={MAX_INSTALLMENTS}
                step={1}
                value={installments}
                onChange={(e) => setInstallments(Number(e.target.value))}
                style={
                  { "--slider-fill": `${installmentsPercent}%` } as React.CSSProperties
                }
                aria-label="Número de parcelas"
              />
              <div className="mt-2 flex justify-between text-xs text-muted">
                <span>1x</span>
                <span>12x</span>
              </div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-surface p-4 text-center">
              <span className="text-[11px] font-medium uppercase tracking-wide text-muted">
                Valor da parcela
              </span>
              <div className="mt-1 font-display text-lg font-bold text-foreground sm:text-xl">
                {formatCurrency(installmentValue)}
              </div>
            </div>
            <div className="rounded-2xl bg-surface p-4 text-center">
              <span className="text-[11px] font-medium uppercase tracking-wide text-muted">
                Valor total
              </span>
              <div className="mt-1 font-display text-lg font-bold text-foreground sm:text-xl">
                {formatCurrency(total)}
              </div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Nome (opcional)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded-xl border border-border-subtle bg-surface px-4 py-3 text-sm text-foreground placeholder:text-muted focus:border-gold/50 focus:outline-none"
            />
            <input
              type="text"
              placeholder="Cidade (opcional)"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="rounded-xl border border-border-subtle bg-surface px-4 py-3 text-sm text-foreground placeholder:text-muted focus:border-gold/50 focus:outline-none"
            />
          </div>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-green px-8 py-5 text-base font-bold text-black shadow-[0_8px_30px_rgba(34,197,94,0.35)] transition-transform duration-200 active:scale-95 sm:hover:scale-[1.02]"
          >
            <MessageCircle className="h-5 w-5" strokeWidth={2.5} />
            CONTINUAR NO WHATSAPP
          </a>
        </motion.div>
      </Container>
    </section>
  );
}
