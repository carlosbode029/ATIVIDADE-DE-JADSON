import type { Metadata } from "next";

import { LeagueManager } from "@/components/admin/league-manager";
import {
  listCountries,
  listLeagues,
} from "@/modules/catalog/queries/reference-data.queries";

export const metadata: Metadata = {
  title: "Ligas",
};

export default async function AdminLigasPage() {
  const [leagues, countries] = await Promise.all([
    listLeagues(),
    listCountries(),
  ]);

  return <LeagueManager leagues={leagues} countries={countries} />;
}
