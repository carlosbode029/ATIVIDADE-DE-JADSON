import type { Metadata } from "next";

import { CarrierManager } from "@/components/admin/carrier-manager";
import { listCarriers } from "@/modules/shipping/queries/shipping.queries";

export const metadata: Metadata = {
  title: "Transportadoras",
};

export default async function AdminTransportadorasPage() {
  const carriers = await listCarriers();
  return <CarrierManager carriers={carriers} />;
}
