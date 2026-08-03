"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import type { UseFormReturn } from "react-hook-form";

import { Badge } from "@/components/ui/badge";
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
  createCoupon,
  deleteCoupon,
  updateCoupon,
} from "@/modules/marketing/actions/coupon.actions";
import {
  couponSchema,
  discountTypeValues,
  type CouponInput,
} from "@/modules/marketing/schemas/coupon.schema";
import type { Coupon } from "@/generated/prisma/client";

export type SerializedCoupon = Omit<Coupon, "value" | "minOrderValue"> & {
  value: number;
  minOrderValue: number | null;
};

const EMPTY_VALUES: CouponInput = {
  code: "",
  type: "PERCENTAGE",
  value: 10,
  minOrderValue: undefined,
  maxUses: undefined,
  startsAt: "",
  expiresAt: "",
  isActive: true,
};

function toDateInputValue(date: Date | null): string {
  if (!date) return "";
  return date.toISOString().slice(0, 10);
}

function CouponFields({ form }: { form: UseFormReturn<CouponInput> }) {
  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Código</FormLabel>
              <FormControl>
                <Input placeholder="BEMVINDO10" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
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
                  {discountTypeValues.map((value) => (
                    <SelectItem key={value} value={value}>
                      {value === "PERCENTAGE" ? "Percentual" : "Valor fixo"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="value"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              {form.watch("type") === "PERCENTAGE"
                ? "Percentual de desconto (%)"
                : "Valor do desconto (R$)"}
            </FormLabel>
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

      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="minOrderValue"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Pedido mínimo (opcional)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  value={field.value ?? ""}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value === "" ? undefined : e.target.valueAsNumber,
                    )
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="maxUses"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Limite de usos (opcional)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  value={field.value ?? ""}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value === "" ? undefined : e.target.valueAsNumber,
                    )
                  }
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
          name="startsAt"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Início (opcional)</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="expiresAt"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Validade (opcional)</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
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

export function CouponManager({ coupons }: { coupons: SerializedCoupon[] }) {
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Cupons</h2>
        <EntityFormDialog<CouponInput>
          title="Novo cupom"
          resolver={zodResolver(couponSchema)}
          defaultValues={EMPTY_VALUES}
          renderFields={(form) => <CouponFields form={form} />}
          onSubmit={createCoupon}
          trigger={
            <Button variant="gold" size="sm">
              <Plus className="size-4" />
              Adicionar cupom
            </Button>
          }
        />
      </div>

      {coupons.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Nenhum cupom cadastrado.
        </p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Código</TableHead>
              <TableHead>Desconto</TableHead>
              <TableHead>Usos</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-24 text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {coupons.map((coupon) => (
              <TableRow key={coupon.id}>
                <TableCell className="font-medium">{coupon.code}</TableCell>
                <TableCell>
                  {coupon.type === "PERCENTAGE"
                    ? `${Number(coupon.value)}%`
                    : `R$ ${Number(coupon.value).toFixed(2)}`}
                </TableCell>
                <TableCell>
                  {coupon.usedCount}
                  {coupon.maxUses ? ` / ${coupon.maxUses}` : ""}
                </TableCell>
                <TableCell>
                  <Badge variant={coupon.isActive ? "gold" : "secondary"}>
                    {coupon.isActive ? "Ativo" : "Inativo"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <EntityFormDialog<CouponInput>
                      title="Editar cupom"
                      resolver={zodResolver(couponSchema)}
                      defaultValues={{
                        code: coupon.code,
                        type: coupon.type,
                        value: Number(coupon.value),
                        minOrderValue: coupon.minOrderValue
                          ? Number(coupon.minOrderValue)
                          : undefined,
                        maxUses: coupon.maxUses ?? undefined,
                        startsAt: toDateInputValue(coupon.startsAt),
                        expiresAt: toDateInputValue(coupon.expiresAt),
                        isActive: coupon.isActive,
                      }}
                      renderFields={(form) => <CouponFields form={form} />}
                      onSubmit={(values) => updateCoupon(coupon.id, values)}
                      trigger={
                        <Button variant="ghost" size="sm">
                          Editar
                        </Button>
                      }
                    />
                    <DeleteEntityButton
                      name={coupon.code}
                      onDelete={() => deleteCoupon(coupon.id)}
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
