import type { Metadata } from "next";

import { TeamManager } from "@/components/admin/team-manager";
import {
  listCountries,
  listLeagues,
  listTeams,
} from "@/modules/catalog/queries/reference-data.queries";

export const metadata: Metadata = {
  title: "Times",
};

export default async function AdminTimesPage() {
  const [teams, countries, leagues] = await Promise.all([
    listTeams(),
    listCountries(),
    listLeagues(),
  ]);

  return <TeamManager teams={teams} countries={countries} leagues={leagues} />;
}
