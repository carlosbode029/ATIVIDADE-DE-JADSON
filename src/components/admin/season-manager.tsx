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
  createSeason,
  deleteSeason,
  updateSeason,
} from "@/modules/catalog/actions/reference-data.actions";
import {
  seasonSchema,
  type SeasonInput,
} from "@/modules/catalog/schemas/reference-data.schema";
import type { Season } from "@/generated/prisma/client";

const EMPTY_VALUES: SeasonInput = {
  label: "",
  startYear: new Date().getFullYear(),
  endYear: new Date().getFullYear() + 1,
};

function SeasonFields({ form }: { form: UseFormReturn<SeasonInput> }) {
  return (
    <>
      <FormField
        control={form.control}
        name="label"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Rótulo (ex.: 2024/2025)</FormLabel>
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
          name="startYear"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ano inicial</FormLabel>
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
          name="endYear"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ano final</FormLabel>
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
    </>
  );
}

export function SeasonManager({ seasons }: { seasons: Season[] }) {
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Temporadas</h2>
        <EntityFormDialog<SeasonInput>
          title="Nova temporada"
          resolver={zodResolver(seasonSchema)}
          defaultValues={EMPTY_VALUES}
          renderFields={(form) => <SeasonFields form={form} />}
          onSubmit={createSeason}
          trigger={
            <Button variant="gold" size="sm">
              <Plus className="size-4" />
              Adicionar temporada
            </Button>
          }
        />
      </div>

      {seasons.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Nenhuma temporada cadastrada.
        </p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Rótulo</TableHead>
              <TableHead className="w-24 text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {seasons.map((season) => (
              <TableRow key={season.id}>
                <TableCell className="font-medium">{season.label}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <EntityFormDialog<SeasonInput>
                      title="Editar temporada"
                      resolver={zodResolver(seasonSchema)}
                      defaultValues={{
                        label: season.label,
                        startYear: season.startYear,
                        endYear: season.endYear,
                      }}
                      renderFields={(form) => <SeasonFields form={form} />}
                      onSubmit={(values) => updateSeason(season.id, values)}
                      trigger={
                        <Button variant="ghost" size="sm">
                          Editar
                        </Button>
                      }
                    />
                    <DeleteEntityButton
                      name={season.label}
                      onDelete={() => deleteSeason(season.id)}
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
