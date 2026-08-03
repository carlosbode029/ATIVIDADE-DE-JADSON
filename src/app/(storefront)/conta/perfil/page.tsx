import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { ProfileForm } from "@/components/storefront/account/profile-form";
import { getCurrentUser } from "@/modules/auth/queries/get-current-user";

export const metadata: Metadata = {
  title: "Meu perfil",
};

export default async function PerfilPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?redirectTo=/conta/perfil");
  }

  return (
    <section>
      <h2 className="mb-6 text-lg font-semibold">Dados pessoais</h2>
      <ProfileForm
        defaultValues={{ name: user.name, phone: user.phone ?? "" }}
      />
    </section>
  );
}
