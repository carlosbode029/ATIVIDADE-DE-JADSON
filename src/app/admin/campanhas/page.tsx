import type { Metadata } from "next";

import { CampaignManager } from "@/components/admin/campaign-manager";
import { listCampaigns } from "@/modules/marketing/queries/campaign.queries";

export const metadata: Metadata = {
  title: "Campanhas",
};

export default async function AdminCampanhasPage() {
  const campaigns = await listCampaigns();

  const serialized = campaigns.map((campaign) => ({
    ...campaign,
    budget: campaign.budget ? Number(campaign.budget) : null,
  }));

  return <CampaignManager campaigns={serialized} />;
}
