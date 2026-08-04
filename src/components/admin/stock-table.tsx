"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { PackagePlus } from "lucide-react";
import type { UseFormReturn } from "react-hook-form";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { StockMovementHistoryDialog } from "@/components/admin/stock-movement-history-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { createStockMovement } from "@/modules/inventory/actions/inventory.actions";
import {
  stockMovementSchema,
  stockMovementTypeValues,
  type StockMovementInput,
} from "@/modules/inventory/schemas/inventory.schema";
import type { listVariantsStock } from "@/modules/inventory/queries/inventory.queries";

type StockResult = Awaited<ReturnType<typeof listVariantsStock>>;

const TYPE_LABELS: Record<(typeof stockMovementTypeValues)[number], string> = {
  IN: "Entrada",
  OUT: "Saída",
  ADJUSTMENT: "Ajuste (definir valor)",
};

function MovementFields({ form }: { form: UseFormReturn<StockMovementInput> }) {
  const type = form.watch("type");
  const quantityLabel =
    type === "IN"
      ? "Quantidade a adicionar"
      : type === "OUT"
        ? "Quantidade a remover"
        : "Novo valor de estoque";

  return (
    <>
      <FormField
        control={form.control}
        name="type"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Tipo de movimentação</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {stockMovementTypeValues.map((value) => (
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
        name="quantity"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{quantityLabel}</FormLabel>
            <FormControl>
              <Input
                type="number"
                min={0}
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
        name="reason"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Motivo (opcional)</FormLabel>
            <FormControl>
              <Input placeholder="Ex.: reposição do fornecedor, avaria, contagem..." {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}

export function StockTable({ result }: { result: StockResult }) {
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
    router.push(`/admin/estoque?${params.toString()}`);
  }

  function goToPage(page: number) {
    const params = new URLSearchParams(searchParams);
    params.set("page", String(page));
    router.push(`/admin/estoque?${params.toString()}`);
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-bold">Estoque</h1>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <Checkbox
              checked={searchParams.get("lowStock") === "1"}
              onCheckedChange={(checked) =>
                updateParam("lowStock", checked ? "1" : "")
              }
            />
            Só estoque baixo
          </label>
          <Input
            placeholder="Buscar por produto ou SKU..."
            defaultValue={searchParams.get("q") ?? ""}
            onChange={(e) => updateParam("q", e.target.value)}
            className="w-64"
          />
        </div>
      </div>

      {result.items.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nenhuma variante encontrada.</p>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produto</TableHead>
                <TableHead>Tamanho</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Estoque</TableHead>
                <TableHead className="w-56 text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {result.items.map((variant) => {
                const isLow = variant.stockQuantity <= variant.lowStockThreshold;

                return (
                  <TableRow key={variant.id}>
                    <TableCell className="font-medium">{variant.productName}</TableCell>
                    <TableCell>{variant.size}</TableCell>
                    <TableCell className="text-muted-foreground">{variant.sku}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {variant.stockQuantity}
                        {isLow && <Badge variant="destructive">Baixo</Badge>}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <EntityFormDialog<StockMovementInput>
                          title={`Movimentar — ${variant.productName} (${variant.size})`}
                          resolver={zodResolver(stockMovementSchema)}
                          defaultValues={{
                            variantId: variant.id,
                            type: "IN",
                            quantity: 0,
                            reason: "",
                          }}
                          renderFields={(form) => <MovementFields form={form} />}
                          onSubmit={createStockMovement}
                          trigger={
                            <Button variant="ghost" size="sm">
                              <PackagePlus className="size-4" />
                              Movimentar
                            </Button>
                          }
                        />
                        <StockMovementHistoryDialog
                          variantId={variant.id}
                          label={`${variant.productName} (${variant.size})`}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
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
