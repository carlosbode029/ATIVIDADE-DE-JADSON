import type { Metadata } from "next";

import { BannerManager } from "@/components/admin/banner-manager";
import { listBannersAdmin } from "@/modules/marketing/queries/banner.queries";

export const metadata: Metadata = {
  title: "Banners",
};

export default async function AdminBannersPage() {
  const banners = await listBannersAdmin();
  return <BannerManager banners={banners} />;
}
