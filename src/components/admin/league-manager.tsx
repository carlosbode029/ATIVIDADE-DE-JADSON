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
  createLeague,
  deleteLeague,
  updateLeague,
} from "@/modules/catalog/actions/reference-data.actions";
import type { listLeagues } from "@/modules/catalog/queries/reference-data.queries";
import {
  leagueSchema,
  type LeagueInput,
} from "@/modules/catalog/schemas/reference-data.schema";
import type { Country } from "@/generated/prisma/client";

type League = Awaited<ReturnType<typeof listLeagues>>[number];

const EMPTY_VALUES: LeagueInput = { name: "", countryId: "", logoUrl: "" };

function LeagueFields({
  form,
  countries,
}: {
  form: UseFormReturn<LeagueInput>;
  countries: Country[];
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
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="countryId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>País (opcional)</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o país" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {countries.map((country) => (
                  <SelectItem key={country.id} value={country.id}>
                    {country.name}
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

export function LeagueManager({
  leagues,
  countries,
}: {
  leagues: League[];
  countries: Country[];
}) {
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Ligas / Competições</h2>
        <EntityFormDialog<LeagueInput>
          title="Nova liga"
          resolver={zodResolver(leagueSchema)}
          defaultValues={EMPTY_VALUES}
          renderFields={(form) => (
            <LeagueFields form={form} countries={countries} />
          )}
          onSubmit={createLeague}
          trigger={
            <Button variant="gold" size="sm">
              <Plus className="size-4" />
              Adicionar liga
            </Button>
          }
        />
      </div>

      {leagues.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Nenhuma liga cadastrada.
        </p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>País</TableHead>
              <TableHead className="w-24 text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leagues.map((league) => (
              <TableRow key={league.id}>
                <TableCell className="font-medium">{league.name}</TableCell>
                <TableCell className="text-muted-foreground">
                  {league.country?.name ?? "—"}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <EntityFormDialog<LeagueInput>
                      title="Editar liga"
                      resolver={zodResolver(leagueSchema)}
                      defaultValues={{
                        name: league.name,
                        countryId: league.countryId ?? "",
                        logoUrl: league.logoUrl ?? "",
                      }}
                      renderFields={(form) => (
                        <LeagueFields form={form} countries={countries} />
                      )}
                      onSubmit={(values) => updateLeague(league.id, values)}
                      trigger={
                        <Button variant="ghost" size="sm">
                          Editar
                        </Button>
                      }
                    />
                    <DeleteEntityButton
                      name={league.name}
                      onDelete={() => deleteLeague(league.id)}
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
