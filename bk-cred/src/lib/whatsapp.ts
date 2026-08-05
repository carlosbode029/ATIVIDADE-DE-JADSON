export const WHATSAPP_NUMBER = "5511999999999";

interface SimulationMessageInput {
  value: number;
  installments: number;
  installmentValue: number;
  name?: string;
  city?: string;
}

export function buildSimulationMessage({
  value,
  installments,
  installmentValue,
  name,
  city,
}: SimulationMessageInput) {
  const formattedValue = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);

  const formattedInstallment = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(installmentValue);

  const lines = [
    "Olá! Gostaria de solicitar uma simulação na BK CRÉD. 👋",
    "",
    `💰 Valor: ${formattedValue}`,
    `📆 Parcelas: ${installments}x de ${formattedInstallment}`,
  ];

  if (name) lines.push(`🙋 Nome: ${name}`);
  if (city) lines.push(`📍 Cidade: ${city}`);

  return lines.join("\n");
}

export function getWhatsAppUrl(message: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
