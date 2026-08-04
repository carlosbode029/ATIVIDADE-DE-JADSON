"use client";

import { useState } from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { bulkCreateProducts } from "@/modules/catalog/actions/product.actions";
import type { listTopLevelCategories } from "@/modules/catalog/queries/category.queries";
import type { listSeasons } from "@/modules/catalog/queries/reference-data.queries";
import {
  productModelValues,
  sleeveTypeValues,
  type BulkProductImportResult,
} from "@/modules/catalog/schemas/product.schema";

const formSchema = z.object({
  categoryId: z.string().trim().min(1, "Selecione a categoria"),
  seasonId: z.string().trim().optional().or(z.literal("")),
  model: z.enum(productModelValues),
  sleeveType: z.enum(sleeveTypeValues),
  teamNamesRaw: z
    .string()
    .trim()
    .min(1, "Informe ao menos um time, um por linha"),
});

type FormValues = z.infer<typeof formSchema>;

const EMPTY_VALUES: FormValues = {
  categoryId: "",
  seasonId: "",
  model: "TORCEDOR",
  sleeveType: "CURTA",
  teamNamesRaw: "",
};

export function BulkProductImportForm({
  categories,
  seasons,
}: {
  categories: Awaited<ReturnType<typeof listTopLevelCategories>>;
  seasons: Awaited<ReturnType<typeof listSeasons>>;
}) {
  const [formError, setFormError] = useState<string | null>(null);
  const [result, setResult] = useState<BulkProductImportResult | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: EMPTY_VALUES,
  });

  async function onSubmit(values: FormValues) {
    setFormError(null);
    setResult(null);

    const teamNames = values.teamNamesRaw
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    if (teamNames.length === 0) {
      setFormError("Informe ao menos um time, um por linha.");
      return;
    }

    const response = await bulkCreateProducts({
      categoryId: values.categoryId,
      seasonId: values.seasonId,
      model: values.model,
      sleeveType: values.sleeveType,
      teamNames,
    });

    if (response.error) {
      setFormError(response.error);
      return;
    }

    const createdNames = response.created ?? [];
    setResult({ created: createdNames, skipped: response.skipped ?? [] });
    if (createdNames.length > 0) {
      toast.success(`${createdNames.length} rascunho(s) criado(s).`);
      form.setValue("teamNamesRaw", "");
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" noValidate>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoria</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a categoria" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
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
              name="seasonId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Temporada (opcional)</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sem temporada" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {seasons.map((season) => (
                        <SelectItem key={season.id} value={season.id}>
                          {season.label}
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
              name="model"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Modelo</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {productModelValues.map((value) => (
                        <SelectItem key={value} value={value}>
                          {value === "TORCEDOR" ? "Torcedor" : "Jogador"}
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
              name="sleeveType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de manga</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {sleeveTypeValues.map((value) => (
                        <SelectItem key={value} value={value}>
                          {value === "CURTA" ? "Curta" : "Longa"}
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
            name="teamNamesRaw"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Times (um por linha)</FormLabel>
                <FormControl>
                  <Textarea
                    rows={10}
                    placeholder={"Flamengo\nPalmeiras\nReal Madrid\n..."}
                    {...field}
                  />
                </FormControl>
                <p className="text-xs text-muted-foreground">
                  Cada time precisa já estar cadastrado em{" "}
                  <Link href="/admin/times" className="underline">
                    Times
                  </Link>{" "}
                  — o nome precisa bater (ex.: &quot;Real Madrid&quot;).
                </p>
                <FormMessage />
              </FormItem>
            )}
          />

          {formError && <p className="text-sm text-destructive">{formError}</p>}

          <Button type="submit" variant="gold" disabled={form.formState.isSubmitting}>
            Criar rascunhos
          </Button>
        </form>
      </Form>

      {result && (
        <div className="space-y-4 rounded-md border border-border p-4">
          {result.created.length > 0 && (
            <div>
              <p className="mb-2 text-sm font-medium">
                Criados ({result.created.length}):
              </p>
              <ul className="list-inside list-disc text-sm text-muted-foreground">
                {result.created.map((name, index) => (
                  <li key={`${name}-${index}`}>{name}</li>
                ))}
              </ul>
            </div>
          )}
          {result.skipped.length > 0 && (
            <div>
              <p className="mb-2 text-sm font-medium text-destructive">
                Não criados ({result.skipped.length}):
              </p>
              <ul className="list-inside list-disc text-sm text-muted-foreground">
                {result.skipped.map((item, index) => (
                  <li key={`${item.line}-${index}`}>
                    {item.line} — {item.reason}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
