"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { Container } from "./Container";
import { fadeInUp } from "@/lib/motion";

const faqs = [
  {
    question: "Como funciona a simulação?",
    answer:
      "Você escolhe o valor e o número de parcelas no simulador e vê na hora quanto ficaria cada parcela, sem compromisso.",
  },
  {
    question: "O dinheiro cai mesmo via PIX?",
    answer:
      "Sim. Após a confirmação com nosso time pelo WhatsApp, o valor é transferido direto para sua chave PIX.",
  },
  {
    question: "Quais cartões são aceitos?",
    answer:
      "Trabalhamos com as principais bandeiras do mercado: Visa, Mastercard, Elo e American Express.",
  },
  {
    question: "Simular tem algum custo?",
    answer:
      "Não. A simulação é 100% gratuita e não compromete o seu limite disponível.",
  },
];

export function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-16 sm:py-24">
      <Container>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={fadeInUp}
          className="mb-8 text-center"
        >
          <h2 className="font-display text-2xl font-bold text-foreground sm:text-3xl">
            Perguntas frequentes
          </h2>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={fadeInUp}
          className="flex flex-col gap-3"
        >
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={faq.question}
                className="glass-card overflow-hidden rounded-2xl"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                  aria-expanded={isOpen}
                >
                  <span className="text-sm font-semibold text-foreground sm:text-base">
                    {faq.question}
                  </span>
                  <motion.span
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.25 }}
                    className="shrink-0 text-gold"
                  >
                    <ChevronDown className="h-5 w-5" />
                  </motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <p className="px-5 pb-4 text-sm leading-relaxed text-muted">
                        {faq.answer}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </motion.div>
      </Container>
    </section>
  );
}
