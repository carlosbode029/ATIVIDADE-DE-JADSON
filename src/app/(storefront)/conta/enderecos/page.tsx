import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { AddressCard } from "@/components/storefront/account/address-card";
import { AddressFormDialog } from "@/components/storefront/account/address-form-dialog";
import { getCurrentUser } from "@/modules/auth/queries/get-current-user";
import { getAddressesByUserId } from "@/modules/customers/queries/get-addresses";

export const metadata: Metadata = {
  title: "Meus endereços",
};

export default async function EnderecosPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?redirectTo=/conta/enderecos");
  }

  const addresses = await getAddressesByUserId(user.id);

  return (
    <section>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Endereços</h2>
        <AddressFormDialog
          trigger={
            <Button variant="gold" size="sm">
              <Plus className="size-4" />
              Adicionar endereço
            </Button>
          }
        />
      </div>

      {addresses.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Você ainda não cadastrou nenhum endereço.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {addresses.map((address) => (
            <AddressCard key={address.id} address={address} />
          ))}
        </div>
      )}
    </section>
  );
}
