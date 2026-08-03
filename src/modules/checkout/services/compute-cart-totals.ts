import type { getCart } from "@/modules/cart/queries/get-cart";

type CartItems = NonNullable<Awaited<ReturnType<typeof getCart>>>["items"];

export function computeCartTotals(items: CartItems) {
  let subtotal = 0;
  let totalWeightGrams = 0;

  for (const item of items) {
    const unitPrice =
      Number(
        item.productVariant.priceOverride ??
          item.product.promoPrice ??
          item.product.price,
      ) + Number(item.patch?.price ?? 0);

    subtotal += unitPrice * item.quantity;
    totalWeightGrams += item.product.weightGrams * item.quantity;
  }

  return { subtotal, totalWeightGrams };
}
