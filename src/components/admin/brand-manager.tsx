"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import type { UseFormReturn } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { EntityFormDialog } from "@/components/admin/entity-form-dialog";
import { DeleteEntityButton } from "@/components/admin/delete-entity-button";
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
  createBrand,
  deleteBrand,
  updateBrand,
} from "@/modules/catalog/actions/reference-data.actions";
import {
  brandSchema,
  type BrandInput,
} from "@/modules/catalog/schemas/reference-data.schema";
import type { Brand } from "@/generated/prisma/client";

const EMPTY_VALUES: BrandInput = { name: "", logoUrl: "" };

function BrandFields({ form }: { form: UseFormReturn<BrandInput> }) {
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
        name="logoUrl"
        render={({ field }) => (
          <FormItem>
            <FormLabel>URL do logo (opcional)</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}

export function BrandManager({ brands }: { brands: Brand[] }) {
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Marcas</h2>
        <EntityFormDialog<BrandInput>
          title="Nova marca"
          resolver={zodResolver(brandSchema)}
          defaultValues={EMPTY_VALUES}
          renderFields={(form) => <BrandFields form={form} />}
          onSubmit={createBrand}
          trigger={
            <Button variant="gold" size="sm">
              <Plus className="size-4" />
              Adicionar marca
            </Button>
          }
        />
      </div>

      {brands.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nenhuma marca cadastrada.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead className="w-24 text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {brands.map((brand) => (
              <TableRow key={brand.id}>
                <TableCell className="font-medium">{brand.name}</TableCell>
                <TableCell className="text-muted-foreground">
                  {brand.slug}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <EntityFormDialog<BrandInput>
                      title="Editar marca"
                      resolver={zodResolver(brandSchema)}
                      defaultValues={{
                        name: brand.name,
                        logoUrl: brand.logoUrl ?? "",
                      }}
                      renderFields={(form) => <BrandFields form={form} />}
                      onSubmit={(values) => updateBrand(brand.id, values)}
                      trigger={
                        <Button variant="ghost" size="sm">
                          Editar
                        </Button>
                      }
                    />
                    <DeleteEntityButton
                      name={brand.name}
                      onDelete={() => deleteBrand(brand.id)}
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
