"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import type { UseFormReturn } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { DeleteEntityButton } from "@/components/admin/delete-entity-button";
import { EntityFormDialog } from "@/components/admin/entity-form-dialog";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  createCarrier,
  deleteCarrier,
  updateCarrier,
} from "@/modules/shipping/actions/shipping.actions";
import {
  carrierSchema,
  type CarrierInput,
} from "@/modules/shipping/schemas/shipping.schema";
import type { Carrier } from "@/generated/prisma/client";

const EMPTY_VALUES: CarrierInput = { name: "", trackingUrlTemplate: "" };

function CarrierFields({ form }: { form: UseFormReturn<CarrierInput> }) {
  return (
    <>
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nome</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="trackingUrlTemplate"
        render={({ field }) => (
          <FormItem>
            <FormLabel>URL de rastreio (opcional)</FormLabel>
            <FormControl>
              <Input placeholder="https://rastreio.com/{codigo}" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}

export function CarrierManager({ carriers }: { carriers: Carrier[] }) {
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Transportadoras</h2>
        <EntityFormDialog<CarrierInput>
          title="Nova transportadora"
          resolver={zodResolver(carrierSchema)}
          defaultValues={EMPTY_VALUES}
          renderFields={(form) => <CarrierFields form={form} />}
          onSubmit={createCarrier}
          trigger={
            <Button variant="gold" size="sm">
              <Plus className="size-4" />
              Adicionar transportadora
            </Button>
          }
        />
      </div>

      {carriers.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Nenhuma transportadora cadastrada.
        </p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead className="w-24 text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {carriers.map((carrier) => (
              <TableRow key={carrier.id}>
                <TableCell className="font-medium">{carrier.name}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <EntityFormDialog<CarrierInput>
                      title="Editar transportadora"
                      resolver={zodResolver(carrierSchema)}
                      defaultValues={{
                        name: carrier.name,
                        trackingUrlTemplate: carrier.trackingUrlTemplate ?? "",
                      }}
                      renderFields={(form) => <CarrierFields form={form} />}
                      onSubmit={(values) => updateCarrier(carrier.id, values)}
                      trigger={
                        <Button variant="ghost" size="sm">
                          Editar
                        </Button>
                      }
                    />
                    <DeleteEntityButton
                      name={carrier.name}
                      onDelete={() => deleteCarrier(carrier.id)}
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
