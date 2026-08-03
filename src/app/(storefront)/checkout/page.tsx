import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { CheckoutForm } from "@/components/storefront/checkout-form";
import { getCurrentUser } from "@/modules/auth/queries/get-current-user";
import { getCart } from "@/modules/cart/queries/get-cart";
import { calculateShippingCost } from "@/modules/checkout/services/calculate-shipping";
import { computeCartTotals } from "@/modules/checkout/services/compute-cart-totals";
import { getAddressesByUserId } from "@/modules/customers/queries/get-addresses";
import { listActiveShippingMethods } from "@/modules/shipping/queries/shipping.queries";

export const metadata: Metadata = {
  title: "Checkout",
};

export default async function CheckoutPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login?redirectTo=/checkout");
  }

  const cart = await getCart();
  if (!cart || cart.items.length === 0) {
    redirect("/carrinho");
  }

  const [addresses, shippingMethods] = await Promise.all([
    getAddressesByUserId(user.id),
    listActiveShippingMethods(),
  ]);

  const { subtotal, totalWeightGrams } = computeCartTotals(cart.items);

  const shippingOptions = shippingMethods.map((method) => ({
    id: method.id,
    name: method.name,
    carrierName: method.carrier.name,
    cost: calculateShippingCost(
      { basePrice: Number(method.basePrice), pricePerKg: Number(method.pricePerKg) },
      totalWeightGrams,
    ),
    estimatedDaysMin: method.estimatedDaysMin,
    estimatedDaysMax: method.estimatedDaysMax,
  }));

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="mb-8 font-display text-2xl font-bold sm:text-3xl">
        Checkout
      </h1>
      <CheckoutForm
        addresses={addresses}
        shippingOptions={shippingOptions}
        subtotal={subtotal}
      />
    </div>
  );
}
