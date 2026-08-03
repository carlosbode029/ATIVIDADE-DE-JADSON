import type { Metadata } from "next";

import { BrandManager } from "@/components/admin/brand-manager";
import { listBrands } from "@/modules/catalog/queries/reference-data.queries";

export const metadata: Metadata = {
  title: "Marcas",
};

export default async function AdminMarcasPage() {
  const brands = await listBrands();
  return <BrandManager brands={brands} />;
}
