import { describe, expect, it } from "vitest";

import { computeCartTotals } from "@/modules/checkout/services/compute-cart-totals";

// Fixture mínima com só os campos lidos por computeCartTotals — o tipo real
// (derivado da query getCart, que importa next/headers) não pode ser
// instanciado fora de um request do Next.js, então tipamos aqui como
// Parameters<typeof computeCartTotals>[0] e usamos um cast.
type CartItemsInput = Parameters<typeof computeCartTotals>[0];

function makeItem(overrides: {
  quantity: number;
  weightGrams: number;
  price: number;
  promoPrice?: number | null;
  priceOverride?: number | null;
  patchPrice?: number | null;
}) {
  return {
    quantity: overrides.quantity,
    productVariant: { priceOverride: overrides.priceOverride ?? null },
    product: {
      price: overrides.price,
      promoPrice: overrides.promoPrice ?? null,
      weightGrams: overrides.weightGrams,
    },
    patch: overrides.patchPrice != null ? { price: overrides.patchPrice } : null,
  };
}

describe("computeCartTotals", () => {
  it("uses the base price when there is no promo price or variant override", () => {
    const items = [
      makeItem({ quantity: 2, weightGrams: 200, price: 150 }),
    ] as unknown as CartItemsInput;

    const { subtotal, totalWeightGrams } = computeCartTotals(items);
    expect(subtotal).toBe(300);
    expect(totalWeightGrams).toBe(400);
  });

  it("prefers promoPrice over the base price", () => {
    const items = [
      makeItem({ quantity: 1, weightGrams: 200, price: 150, promoPrice: 100 }),
    ] as unknown as CartItemsInput;

    expect(computeCartTotals(items).subtotal).toBe(100);
  });

  it("prefers the variant's priceOverride over promoPrice and price", () => {
    const items = [
      makeItem({
        quantity: 1,
        weightGrams: 200,
        price: 150,
        promoPrice: 100,
        priceOverride: 80,
      }),
    ] as unknown as CartItemsInput;

    expect(computeCartTotals(items).subtotal).toBe(80);
  });

  it("adds the patch price on top of the unit price", () => {
    const items = [
      makeItem({ quantity: 3, weightGrams: 200, price: 150, patchPrice: 25 }),
    ] as unknown as CartItemsInput;

    // (150 + 25) * 3
    expect(computeCartTotals(items).subtotal).toBe(525);
  });

  it("sums subtotal and weight across multiple items", () => {
    const items = [
      makeItem({ quantity: 1, weightGrams: 200, price: 150 }),
      makeItem({ quantity: 2, weightGrams: 300, price: 90, promoPrice: 70 }),
    ] as unknown as CartItemsInput;

    const { subtotal, totalWeightGrams } = computeCartTotals(items);
    expect(subtotal).toBe(150 + 70 * 2);
    expect(totalWeightGrams).toBe(200 + 300 * 2);
  });

  it("returns zero totals for an empty cart", () => {
    expect(computeCartTotals([] as unknown as CartItemsInput)).toEqual({
      subtotal: 0,
      totalWeightGrams: 0,
    });
  });
});
