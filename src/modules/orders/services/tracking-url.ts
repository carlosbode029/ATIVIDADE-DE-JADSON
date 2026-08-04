/**
 * Monta a URL de rastreio a partir do template cadastrado na transportadora
 * (ex.: `https://rastreio.com/{codigo}`) — convenção usada no formulário de
 * transportadoras (`CarrierManager`).
 */
export function buildTrackingUrl(
  template: string | null | undefined,
  trackingCode: string | null | undefined,
): string | null {
  if (!template || !trackingCode) return null;
  return template.replace("{codigo}", encodeURIComponent(trackingCode));
}
