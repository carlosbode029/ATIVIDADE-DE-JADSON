import type { Metadata } from "next";

import { CountryManager } from "@/components/admin/country-manager";
import { listCountries } from "@/modules/catalog/queries/reference-data.queries";

export const metadata: Metadata = {
  title: "Países",
};

export default async function AdminPaisesPage() {
  const countries = await listCountries();
  return <CountryManager countries={countries} />;
}
