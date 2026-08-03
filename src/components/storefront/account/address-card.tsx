"use client";

import { useTransition } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { AddressFormDialog } from "@/components/storefront/account/address-form-dialog";
import { deleteAddress } from "@/modules/customers/actions/customer.actions";
import type { Address } from "@/generated/prisma/client";

export function AddressCard({ address }: { address: Address }) {
  const [isDeleting, startTransition] = useTransition();

  function handleDelete() {
    if (!window.confirm(`Excluir o endereço "${address.label}"?`)) {
      return;
    }

    startTransition(async () => {
      const result = await deleteAddress(address.id);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Endereço removido.");
      }
    });
  }

  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between space-y-0">
        <div className="flex items-center gap-2">
          <span className="font-medium">{address.label}</span>
          {address.isDefault && <Badge variant="gold">Padrão</Badge>}
        </div>
        <div className="flex gap-1">
          <AddressFormDialog
            addressId={address.id}
            defaultValues={{
              label: address.label,
              recipient: address.recipient,
              phone: address.phone ?? "",
              zipCode: address.zipCode,
              street: address.street,
              number: address.number,
              complement: address.complement ?? "",
              neighborhood: address.neighborhood,
              city: address.city,
              state: address.state,
              isDefault: address.isDefault,
            }}
            trigger={
              <Button variant="ghost" size="icon" aria-label="Editar endereço">
                <Pencil className="size-4" />
              </Button>
            }
          />
          <Button
            variant="ghost"
            size="icon"
            aria-label="Excluir endereço"
            disabled={isDeleting}
            onClick={handleDelete}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        <p>{address.recipient}</p>
        <p>
          {address.street}, {address.number}
          {address.complement ? ` — ${address.complement}` : ""}
        </p>
        <p>
          {address.neighborhood} — {address.city}/{address.state}
        </p>
        <p>CEP {address.zipCode}</p>
      </CardContent>
    </Card>
  );
}
