import type { Metadata } from "next";

import { ShippingMethodManager } from "@/components/admin/shipping-method-manager";
import {
  listCarriers,
  listShippingMethods,
} from "@/modules/shipping/queries/shipping.queries";

export const metadata: Metadata = {
  title: "Fretes",
};

export default async function AdminFretesPage() {
  const [methods, carriers] = await Promise.all([
    listShippingMethods(),
    listCarriers(),
  ]);

  return (
    <ShippingMethodManager
      methods={methods.map((method) => ({
        ...method,
        basePrice: Number(method.basePrice),
        pricePerKg: Number(method.pricePerKg),
      }))}
      carriers={carriers}
    />
  );
}
