"use client";

import { useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import type { UseFormReturn } from "react-hook-form";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Textarea } from "@/components/ui/textarea";
import {
  applyPromotion,
  createPromotion,
  deletePromotion,
  removePromotionDiscount,
  updatePromotion,
} from "@/modules/marketing/actions/promotion.actions";
import {
  promotionDiscountTypeValues,
  promotionSchema,
  type PromotionInput,
} from "@/modules/marketing/schemas/promotion.schema";
import type { listPromotions } from "@/modules/marketing/queries/promotion.queries";

type RawPromotion = Awaited<ReturnType<typeof listPromotions>>[number];
export type SerializedPromotion = Omit<RawPromotion, "discountValue"> & {
  discountValue: number;
};
type Promotion = SerializedPromotion;
type ProductOption = { id: string; name: string };
type CategoryOption = { id: string; name: string; parentId: string | null };

const TYPE_LABELS: Record<(typeof promotionDiscountTypeValues)[number], string> = {
  PERCENTAGE: "Percentual",
  FIXED: "Valor fixo",
};

function toDateInputValue(date: Date | null): string {
  if (!date) return "";
  return date.toISOString().slice(0, 10);
}

function EMPTY_VALUES(): PromotionInput {
  return {
    name: "",
    description: "",
    discountType: "PERCENTAGE",
    discountValue: 10,
    startsAt: "",
    expiresAt: "",
    isActive: true,
    productIds: [],
    categoryIds: [],
  };
}

function toFormValues(promotion: Promotion): PromotionInput {
  return {
    name: promotion.name,
    description: promotion.description ?? "",
    discountType: promotion.discountType,
    discountValue: Number(promotion.discountValue),
    startsAt: toDateInputValue(promotion.startsAt),
    expiresAt: toDateInputValue(promotion.expiresAt),
    isActive: promotion.isActive,
    productIds: promotion.products.map((p) => p.productId),
    categoryIds: promotion.categories.map((c) => c.categoryId),
  };
}

function CheckboxList<T extends { id: string; name: string }>({
  options,
  selected,
  onChange,
}: {
  options: T[];
  selected: string[];
  onChange: (ids: string[]) => void;
}) {
  function toggle(id: string) {
    onChange(
      selected.includes(id) ? selected.filter((v) => v !== id) : [...selected, id],
    );
  }

  return (
    <div className="max-h-40 space-y-1 overflow-y-auto rounded-md border border-input p-2">
      {options.length === 0 ? (
        <p className="p-1 text-xs text-muted-foreground">Nada cadastrado.</p>
      ) : (
        options.map((option) => (
          <label
            key={option.id}
            className="flex cursor-pointer items-center gap-2 rounded px-1 py-1 text-sm hover:bg-accent"
          >
            <Checkbox
              checked={selected.includes(option.id)}
              onCheckedChange={() => toggle(option.id)}
            />
            {option.name}
          </label>
        ))
      )}
    </div>
  );
}

function PromotionFields({
  form,
  products,
  categories,
}: {
  form: UseFormReturn<PromotionInput>;
  products: ProductOption[];
  categories: CategoryOption[];
}) {
  const productIds = form.watch("productIds");
  const categoryIds = form.watch("categoryIds");

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
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Descrição (opcional)</FormLabel>
            <FormControl>
              <Textarea rows={2} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="discountType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo de desconto</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {promotionDiscountTypeValues.map((value) => (
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
          name="discountValue"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Valor {form.watch("discountType") === "PERCENTAGE" ? "(%)" : "(R$)"}
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
              <FormLabel>Fim (opcional)</FormLabel>
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
          <FormItem className="flex items-center gap-2">
            <FormControl>
              <Switch checked={field.value} onCheckedChange={field.onChange} />
            </FormControl>
            <FormLabel className="!mt-0">Ativa (visível para gestão)</FormLabel>
          </FormItem>
        )}
      />

      <FormItem>
        <FormLabel>Categorias</FormLabel>
        <CheckboxList
          options={categories}
          selected={categoryIds}
          onChange={(ids) => form.setValue("categoryIds", ids, { shouldValidate: true })}
        />
      </FormItem>

      <FormItem>
        <FormLabel>Produtos específicos</FormLabel>
        <CheckboxList
          options={products}
          selected={productIds}
          onChange={(ids) => form.setValue("productIds", ids, { shouldValidate: true })}
        />
        {form.formState.errors.productIds && (
          <p className="text-sm font-medium text-destructive">
            {form.formState.errors.productIds.message}
          </p>
        )}
      </FormItem>
    </>
  );
}

function PromotionActions({ promotion }: { promotion: Promotion }) {
  const [isPending, startTransition] = useTransition();

  function handleApply() {
    startTransition(async () => {
      const result = await applyPromotion(promotion.id);
      if (result.error) toast.error(result.error);
      else toast.success("Desconto aplicado aos produtos.");
    });
  }

  function handleRemove() {
    if (!window.confirm("Remover o desconto desta promoção dos produtos vinculados?")) {
      return;
    }
    startTransition(async () => {
      const result = await removePromotionDiscount(promotion.id);
      if (result.error) toast.error(result.error);
      else toast.success("Desconto removido.");
    });
  }

  return (
    <div className="flex gap-1">
      <Button variant="outline" size="sm" disabled={isPending} onClick={handleApply}>
        {isPending && <Loader2 className="size-3.5 animate-spin" />}
        Aplicar desconto
      </Button>
      <Button variant="ghost" size="sm" disabled={isPending} onClick={handleRemove}>
        Remover desconto
      </Button>
    </div>
  );
}

export function PromotionManager({
  promotions,
  products,
  categories,
}: {
  promotions: Promotion[];
  products: ProductOption[];
  categories: CategoryOption[];
}) {
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Promoções</h1>
          <p className="text-sm text-muted-foreground">
            &quot;Aplicar desconto&quot; grava o preço promocional nos produtos
            vinculados; a promoção em si é só o plano/registro.
          </p>
        </div>
        <EntityFormDialog<PromotionInput>
          title="Nova promoção"
          resolver={zodResolver(promotionSchema)}
          defaultValues={EMPTY_VALUES()}
          renderFields={(form) => (
            <PromotionFields form={form} products={products} categories={categories} />
          )}
          onSubmit={createPromotion}
          trigger={
            <Button variant="gold" size="sm">
              <Plus className="size-4" />
              Nova promoção
            </Button>
          }
        />
      </div>

      {promotions.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nenhuma promoção cadastrada.</p>
      ) : (
        <div className="space-y-3">
          {promotions.map((promotion) => (
            <div
              key={promotion.id}
              className="rounded-xl border border-border bg-card p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{promotion.name}</p>
                    {!promotion.isActive && <Badge variant="secondary">Inativa</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {promotion.discountType === "PERCENTAGE"
                      ? `${Number(promotion.discountValue)}% off`
                      : `R$ ${Number(promotion.discountValue).toFixed(2)} off`}
                    {" · "}
                    {promotion.products.length} produto(s), {promotion.categories.length}{" "}
                    categoria(s)
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-1">
                  <PromotionActions promotion={promotion} />
                  <EntityFormDialog<PromotionInput>
                    title="Editar promoção"
                    resolver={zodResolver(promotionSchema)}
                    defaultValues={toFormValues(promotion)}
                    renderFields={(form) => (
                      <PromotionFields
                        form={form}
                        products={products}
                        categories={categories}
                      />
                    )}
                    onSubmit={(values) => updatePromotion(promotion.id, values)}
                    trigger={
                      <Button variant="ghost" size="sm">
                        Editar
                      </Button>
                    }
                  />
                  <DeleteEntityButton
                    name={promotion.name}
                    onDelete={() => deletePromotion(promotion.id)}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
