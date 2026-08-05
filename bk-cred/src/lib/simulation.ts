export const MIN_VALUE = 300;
export const MAX_VALUE = 15000;
export const VALUE_STEP = 100;

export const MIN_INSTALLMENTS = 1;
export const MAX_INSTALLMENTS = 12;

const MONTHLY_RATE = 0.0899;

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 2,
  }).format(value);
}

export function calculateInstallment(value: number, installments: number) {
  if (installments <= 1) {
    return value * (1 + MONTHLY_RATE);
  }
  const factor =
    (MONTHLY_RATE * Math.pow(1 + MONTHLY_RATE, installments)) /
    (Math.pow(1 + MONTHLY_RATE, installments) - 1);
  return value * factor;
}

export function calculateTotal(value: number, installments: number) {
  return calculateInstallment(value, installments) * installments;
}

export type SimulationMood = "low" | "medium" | "high";

export function getSimulationMood(value: number): SimulationMood {
  if (value < 2000) return "low";
  if (value < 7000) return "medium";
  return "high";
}

export const SIMULATION_MESSAGES: Record<
  SimulationMood,
  { emoji: string; text: string }
> = {
  low: { emoji: "💰", text: "Ideal para pequenas despesas." },
  medium: { emoji: "🏠", text: "Excelente para organizar suas finanças." },
  high: { emoji: "🚀", text: "Transforme seus planos em realidade." },
};
