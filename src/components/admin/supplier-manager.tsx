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
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  createSupplier,
  deleteSupplier,
  updateSupplier,
} from "@/modules/suppliers/actions/supplier.actions";
import {
  supplierSchema,
  type SupplierInput,
} from "@/modules/suppliers/schemas/supplier.schema";
import type { Supplier } from "@/generated/prisma/client";

const EMPTY_VALUES: SupplierInput = {
  name: "",
  cnpj: "",
  email: "",
  phone: "",
  address: "",
  notes: "",
};

function toFormValues(supplier: Supplier): SupplierInput {
  return {
    name: supplier.name,
    cnpj: supplier.cnpj ?? "",
    email: supplier.email ?? "",
    phone: supplier.phone ?? "",
    address: supplier.address ?? "",
    notes: supplier.notes ?? "",
  };
}

function SupplierFields({ form }: { form: UseFormReturn<SupplierInput> }) {
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

      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="cnpj"
          render={({ field }) => (
            <FormItem>
              <FormLabel>CNPJ (opcional)</FormLabel>
              <FormControl>
                <Input placeholder="Somente números" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Telefone (opcional)</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel>E-mail (opcional)</FormLabel>
            <FormControl>
              <Input type="email" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="address"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Endereço (opcional)</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="notes"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Observações (opcional)</FormLabel>
            <FormControl>
              <Textarea rows={3} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}

export function SupplierManager({ suppliers }: { suppliers: Supplier[] }) {
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">Fornecedores</h1>
        <EntityFormDialog<SupplierInput>
          title="Novo fornecedor"
          resolver={zodResolver(supplierSchema)}
          defaultValues={EMPTY_VALUES}
          renderFields={(form) => <SupplierFields form={form} />}
          onSubmit={createSupplier}
          trigger={
            <Button variant="gold" size="sm">
              <Plus className="size-4" />
              Novo fornecedor
            </Button>
          }
        />
      </div>

      {suppliers.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nenhum fornecedor cadastrado.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>CNPJ</TableHead>
              <TableHead>Contato</TableHead>
              <TableHead className="w-24 text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {suppliers.map((supplier) => (
              <TableRow key={supplier.id}>
                <TableCell className="font-medium">{supplier.name}</TableCell>
                <TableCell className="text-muted-foreground">
                  {supplier.cnpj ?? "—"}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {supplier.email ?? supplier.phone ?? "—"}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <EntityFormDialog<SupplierInput>
                      title="Editar fornecedor"
                      resolver={zodResolver(supplierSchema)}
                      defaultValues={toFormValues(supplier)}
                      renderFields={(form) => <SupplierFields form={form} />}
                      onSubmit={(values) => updateSupplier(supplier.id, values)}
                      trigger={
                        <Button variant="ghost" size="sm">
                          Editar
                        </Button>
                      }
                    />
                    <DeleteEntityButton
                      name={supplier.name}
                      onDelete={() => deleteSupplier(supplier.id)}
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
