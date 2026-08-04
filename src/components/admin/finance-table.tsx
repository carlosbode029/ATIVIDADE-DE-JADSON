"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import type { UseFormReturn } from "react-hook-form";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  createFinanceEntry,
  deleteFinanceEntry,
  updateFinanceEntry,
} from "@/modules/finance/actions/finance.actions";
import {
  financeEntrySchema,
  financeTypeValues,
  type FinanceEntryInput,
} from "@/modules/finance/schemas/finance.schema";
import type { listFinanceEntries } from "@/modules/finance/queries/finance.queries";

type FinanceResult = Awaited<ReturnType<typeof listFinanceEntries>>;
type SerializedEntry = Omit<FinanceResult["items"][number], "amount"> & {
  amount: number;
};
export type SerializedFinanceResult = Omit<FinanceResult, "items"> & {
  items: SerializedEntry[];
};

const TYPE_LABELS: Record<(typeof financeTypeValues)[number], string> = {
  INCOME: "Receita",
  EXPENSE: "Despesa",
};

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const dateFormatter = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" });

function toDateInputValue(date: Date): string {
  return date.toISOString().slice(0, 10);
}

const EMPTY_VALUES: FinanceEntryInput = {
  type: "EXPENSE",
  category: "",
  description: "",
  amount: 0,
  date: toDateInputValue(new Date()),
};

function toFormValues(entry: SerializedEntry): FinanceEntryInput {
  return {
    type: entry.type,
    category: entry.category,
    description: entry.description,
    amount: entry.amount,
    date: toDateInputValue(entry.date),
  };
}

function FinanceEntryFields({ form }: { form: UseFormReturn<FinanceEntryInput> }) {
  return (
    <>
      <FormField
        control={form.control}
        name="type"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Tipo</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {financeTypeValues.map((value) => (
                  <SelectItem key={value} value={value}>
                    {TYPE_LABELS[value]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="category"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Categoria</FormLabel>
            <FormControl>
              <Input placeholder="Fornecedores, Marketing, Aluguel..." {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Descrição</FormLabel>
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
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Valor</FormLabel>
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
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Data</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </>
  );
}

export function FinanceTable({
  result,
  summary,
}: {
  result: SerializedFinanceResult;
  summary: { income: number; expense: number; net: number };
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("page");
    router.push(`/admin/financeiro?${params.toString()}`);
  }

  function goToPage(page: number) {
    const params = new URLSearchParams(searchParams);
    params.set("page", String(page));
    router.push(`/admin/financeiro?${params.toString()}`);
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-bold">Financeiro</h1>
        <EntityFormDialog<FinanceEntryInput>
          title="Novo lançamento"
          resolver={zodResolver(financeEntrySchema)}
          defaultValues={EMPTY_VALUES}
          renderFields={(form) => <FinanceEntryFields form={form} />}
          onSubmit={createFinanceEntry}
          trigger={
            <Button variant="gold" size="sm">
              <Plus className="size-4" />
              Novo lançamento
            </Button>
          }
        />
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Receita no período
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-gold">
              {currencyFormatter.format(summary.income)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Despesa no período
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {currencyFormatter.format(summary.expense)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Saldo líquido
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{currencyFormatter.format(summary.net)}</p>
          </CardContent>
        </Card>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Select
          value={searchParams.get("type") ?? "all"}
          onValueChange={(value) => updateParam("type", value === "all" ? "" : value)}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os tipos</SelectItem>
            {financeTypeValues.map((value) => (
              <SelectItem key={value} value={value}>
                {TYPE_LABELS[value]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          placeholder="Categoria..."
          defaultValue={searchParams.get("category") ?? ""}
          onChange={(e) => updateParam("category", e.target.value)}
          className="w-44"
        />
        <Input
          type="date"
          value={searchParams.get("dateFrom") ?? ""}
          onChange={(e) => updateParam("dateFrom", e.target.value)}
          className="w-40"
        />
        <span className="text-sm text-muted-foreground">até</span>
        <Input
          type="date"
          value={searchParams.get("dateTo") ?? ""}
          onChange={(e) => updateParam("dateTo", e.target.value)}
          className="w-40"
        />
      </div>

      {result.items.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nenhum lançamento encontrado.</p>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead className="w-24 text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {result.items.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell className="text-muted-foreground">
                    {dateFormatter.format(entry.date)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={entry.type === "INCOME" ? "gold" : "secondary"}>
                      {TYPE_LABELS[entry.type]}
                    </Badge>
                  </TableCell>
                  <TableCell>{entry.category}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {entry.description}
                    {entry.order && (
                      <Link
                        href={`/admin/pedidos/${entry.orderId}`}
                        className="ml-2 text-xs text-gold underline underline-offset-2"
                      >
                        #{entry.order.orderNumber}
                      </Link>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">
                    {currencyFormatter.format(entry.amount)}
                  </TableCell>
                  <TableCell className="text-right">
                    {entry.orderId ? (
                      <span className="text-xs text-muted-foreground">Automático</span>
                    ) : (
                      <div className="flex justify-end gap-1">
                        <EntityFormDialog<FinanceEntryInput>
                          title="Editar lançamento"
                          resolver={zodResolver(financeEntrySchema)}
                          defaultValues={toFormValues(entry)}
                          renderFields={(form) => <FinanceEntryFields form={form} />}
                          onSubmit={(values) => updateFinanceEntry(entry.id, values)}
                          trigger={
                            <Button variant="ghost" size="sm">
                              Editar
                            </Button>
                          }
                        />
                        <DeleteEntityButton
                          name={entry.description}
                          onDelete={() => deleteFinanceEntry(entry.id)}
                        />
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {result.totalPages > 1 && (
            <div className="mt-4 flex items-center justify-center gap-2">
              {Array.from({ length: result.totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <Button
                    key={page}
                    variant={page === result.page ? "gold" : "outline"}
                    size="sm"
                    onClick={() => goToPage(page)}
                  >
                    {page}
                  </Button>
                ),
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
