import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { StaffManager } from "@/components/admin/staff-manager";
import { getCurrentUser } from "@/modules/auth/queries/get-current-user";
import { listStaffUsers } from "@/modules/team/queries/team.queries";

export const metadata: Metadata = {
  title: "Equipe",
};

export default async function AdminEquipePage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    redirect("/admin");
  }

  const staff = await listStaffUsers();

  return <StaffManager staff={staff} currentUserId={user.id} />;
}
