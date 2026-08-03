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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  createShippingMethod,
  deleteShippingMethod,
  updateShippingMethod,
} from "@/modules/shipping/actions/shipping.actions";
import type { listShippingMethods } from "@/modules/shipping/queries/shipping.queries";
import {
  shippingMethodSchema,
  type ShippingMethodInput,
} from "@/modules/shipping/schemas/shipping.schema";
import type { Carrier } from "@/generated/prisma/client";

type ShippingMethod = Awaited<ReturnType<typeof listShippingMethods>>[number];
export type SerializedShippingMethod = Omit<
  ShippingMethod,
  "basePrice" | "pricePerKg"
> & {
  basePrice: number;
  pricePerKg: number;
};

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

function buildEmptyValues(carrierId = ""): ShippingMethodInput {
  return {
    name: "",
    carrierId,
    basePrice: 0,
    pricePerKg: 0,
    estimatedDaysMin: 3,
    estimatedDaysMax: 7,
    isActive: true,
  };
}

function ShippingMethodFields({
  form,
  carriers,
}: {
  form: UseFormReturn<ShippingMethodInput>;
  carriers: Carrier[];
}) {
  return (
    <>
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nome</FormLabel>
            <FormControl>
              <Input placeholder="PAC, SEDEX, Motoboy..." {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="carrierId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Transportadora</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a transportadora" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {carriers.map((carrier) => (
                  <SelectItem key={carrier.id} value={carrier.id}>
                    {carrier.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="basePrice"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Preço base (R$)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  {...field}
                  onChange={(e) => field.onChange(e.target.valueAsNumber)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="pricePerKg"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Preço por kg (R$)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  {...field}
                  onChange={(e) => field.onChange(e.target.valueAsNumber)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="estimatedDaysMin"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Prazo mínimo (dias)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  onChange={(e) => field.onChange(e.target.valueAsNumber)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="estimatedDaysMax"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Prazo máximo (dias)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  onChange={(e) => field.onChange(e.target.valueAsNumber)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <FormField
        control={form.control}
        name="isActive"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-lg border border-border p-3">
            <FormLabel>Ativo</FormLabel>
            <FormControl>
              <Switch checked={field.value} onCheckedChange={field.onChange} />
            </FormControl>
          </FormItem>
        )}
      />
    </>
  );
}

export function ShippingMethodManager({
  methods,
  carriers,
}: {
  methods: SerializedShippingMethod[];
  carriers: Carrier[];
}) {
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Fretes</h2>
        <EntityFormDialog<ShippingMethodInput>
          title="Novo frete"
          resolver={zodResolver(shippingMethodSchema)}
          defaultValues={buildEmptyValues(carriers[0]?.id)}
          renderFields={(form) => (
            <ShippingMethodFields form={form} carriers={carriers} />
          )}
          onSubmit={createShippingMethod}
          trigger={
            <Button variant="gold" size="sm" disabled={carriers.length === 0}>
              <Plus className="size-4" />
              Adicionar frete
            </Button>
          }
        />
      </div>

      {carriers.length === 0 && (
        <p className="mb-4 text-sm text-muted-foreground">
          Cadastre uma transportadora antes de criar um frete.
        </p>
      )}

      {methods.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Nenhum frete cadastrado.
        </p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Transportadora</TableHead>
              <TableHead>Preço base</TableHead>
              <TableHead>Prazo</TableHead>
              <TableHead className="w-24 text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {methods.map((method) => (
              <TableRow key={method.id}>
                <TableCell className="font-medium">{method.name}</TableCell>
                <TableCell className="text-muted-foreground">
                  {method.carrier.name}
                </TableCell>
                <TableCell>
                  {currencyFormatter.format(Number(method.basePrice))}
                </TableCell>
                <TableCell>
                  {method.estimatedDaysMin}-{method.estimatedDaysMax} dias
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <EntityFormDialog<ShippingMethodInput>
                      title="Editar frete"
                      resolver={zodResolver(shippingMethodSchema)}
                      defaultValues={{
                        name: method.name,
                        carrierId: method.carrierId,
                        basePrice: Number(method.basePrice),
                        pricePerKg: Number(method.pricePerKg),
                        estimatedDaysMin: method.estimatedDaysMin,
                        estimatedDaysMax: method.estimatedDaysMax,
                        isActive: method.isActive,
                      }}
                      renderFields={(form) => (
                        <ShippingMethodFields form={form} carriers={carriers} />
                      )}
                      onSubmit={(values) =>
                        updateShippingMethod(method.id, values)
                      }
                      trigger={
                        <Button variant="ghost" size="sm">
                          Editar
                        </Button>
                      }
                    />
                    <DeleteEntityButton
                      name={method.name}
                      onDelete={() => deleteShippingMethod(method.id)}
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
