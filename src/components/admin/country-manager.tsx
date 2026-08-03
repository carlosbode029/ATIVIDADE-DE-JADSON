"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import type { UseFormReturn } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { EntityFormDialog } from "@/components/admin/entity-form-dialog";
import { DeleteEntityButton } from "@/components/admin/delete-entity-button";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
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
  createCountry,
  deleteCountry,
  updateCountry,
} from "@/modules/catalog/actions/reference-data.actions";
import {
  countrySchema,
  type CountryInput,
} from "@/modules/catalog/schemas/reference-data.schema";
import type { Country } from "@/generated/prisma/client";

const EMPTY_VALUES: CountryInput = { name: "", code: "", flagUrl: "" };

function CountryFields({ form }: { form: UseFormReturn<CountryInput> }) {
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
        name="code"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Código (ISO, ex.: BR)</FormLabel>
            <FormControl>
              <Input maxLength={2} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="flagUrl"
        render={({ field }) => (
          <FormItem>
            <FormLabel>URL da bandeira (opcional)</FormLabel>
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

export function CountryManager({ countries }: { countries: Country[] }) {
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Países</h2>
        <EntityFormDialog<CountryInput>
          title="Novo país"
          resolver={zodResolver(countrySchema)}
          defaultValues={EMPTY_VALUES}
          renderFields={(form) => <CountryFields form={form} />}
          onSubmit={createCountry}
          trigger={
            <Button variant="gold" size="sm">
              <Plus className="size-4" />
              Adicionar país
            </Button>
          }
        />
      </div>

      {countries.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nenhum país cadastrado.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Código</TableHead>
              <TableHead className="w-24 text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {countries.map((country) => (
              <TableRow key={country.id}>
                <TableCell className="font-medium">{country.name}</TableCell>
                <TableCell>{country.code}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <EntityFormDialog<CountryInput>
                      title="Editar país"
                      resolver={zodResolver(countrySchema)}
                      defaultValues={{
                        name: country.name,
                        code: country.code,
                        flagUrl: country.flagUrl ?? "",
                      }}
                      renderFields={(form) => <CountryFields form={form} />}
                      onSubmit={(values) => updateCountry(country.id, values)}
                      trigger={
                        <Button variant="ghost" size="sm">
                          Editar
                        </Button>
                      }
                    />
                    <DeleteEntityButton
                      name={country.name}
                      onDelete={() => deleteCountry(country.id)}
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
