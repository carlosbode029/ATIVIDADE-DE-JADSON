import type { Metadata } from "next";

import { SeasonManager } from "@/components/admin/season-manager";
import { listSeasons } from "@/modules/catalog/queries/reference-data.queries";

export const metadata: Metadata = {
  title: "Temporadas",
};

export default async function AdminTemporadasPage() {
  const seasons = await listSeasons();
  return <SeasonManager seasons={seasons} />;
}
