"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import type { UseFormReturn } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { EntityFormDialog } from "@/components/admin/entity-form-dialog";
import { DeleteEntityButton } from "@/components/admin/delete-entity-button";
import { Checkbox } from "@/components/ui/checkbox";
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
  createTeam,
  deleteTeam,
  updateTeam,
} from "@/modules/catalog/actions/reference-data.actions";
import type {
  listLeagues,
  listTeams,
} from "@/modules/catalog/queries/reference-data.queries";
import {
  teamSchema,
  type TeamInput,
} from "@/modules/catalog/schemas/reference-data.schema";
import type { Country } from "@/generated/prisma/client";

type Team = Awaited<ReturnType<typeof listTeams>>[number];
type League = Awaited<ReturnType<typeof listLeagues>>[number];

const EMPTY_VALUES: TeamInput = {
  name: "",
  countryId: "",
  logoUrl: "",
  leagueIds: [],
};

function TeamFields({
  form,
  countries,
  leagues,
}: {
  form: UseFormReturn<TeamInput>;
  countries: Country[];
  leagues: League[];
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
            <FormLabel>URL do escudo (opcional)</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="leagueIds"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Ligas/competições</FormLabel>
            <div className="max-h-40 space-y-2 overflow-y-auto rounded-md border border-input p-3">
              {leagues.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Nenhuma liga cadastrada ainda.
                </p>
              )}
              {leagues.map((league) => {
                const checked = field.value.includes(league.id);
                return (
                  <label
                    key={league.id}
                    className="flex items-center gap-2 text-sm"
                  >
                    <Checkbox
                      checked={checked}
                      onCheckedChange={(value) => {
                        field.onChange(
                          value
                            ? [...field.value, league.id]
                            : field.value.filter((id) => id !== league.id),
                        );
                      }}
                    />
                    {league.name}
                  </label>
                );
              })}
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}

export function TeamManager({
  teams,
  countries,
  leagues,
}: {
  teams: Team[];
  countries: Country[];
  leagues: League[];
}) {
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Times</h2>
        <EntityFormDialog<TeamInput>
          title="Novo time"
          resolver={zodResolver(teamSchema)}
          defaultValues={EMPTY_VALUES}
          renderFields={(form) => (
            <TeamFields form={form} countries={countries} leagues={leagues} />
          )}
          onSubmit={createTeam}
          trigger={
            <Button variant="gold" size="sm">
              <Plus className="size-4" />
              Adicionar time
            </Button>
          }
        />
      </div>

      {teams.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nenhum time cadastrado.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>País</TableHead>
              <TableHead>Ligas</TableHead>
              <TableHead className="w-24 text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {teams.map((team) => (
              <TableRow key={team.id}>
                <TableCell className="font-medium">{team.name}</TableCell>
                <TableCell className="text-muted-foreground">
                  {team.country?.name ?? "—"}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {team.leagues.map((tl) => tl.league.name).join(", ") || "—"}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <EntityFormDialog<TeamInput>
                      title="Editar time"
                      resolver={zodResolver(teamSchema)}
                      defaultValues={{
                        name: team.name,
                        countryId: team.countryId ?? "",
                        logoUrl: team.logoUrl ?? "",
                        leagueIds: team.leagues.map((tl) => tl.leagueId),
                      }}
                      renderFields={(form) => (
                        <TeamFields
                          form={form}
                          countries={countries}
                          leagues={leagues}
                        />
                      )}
                      onSubmit={(values) => updateTeam(team.id, values)}
                      trigger={
                        <Button variant="ghost" size="sm">
                          Editar
                        </Button>
                      }
                    />
                    <DeleteEntityButton
                      name={team.name}
                      onDelete={() => deleteTeam(team.id)}
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
