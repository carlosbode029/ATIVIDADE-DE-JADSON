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
  createCampaign,
  deleteCampaign,
  updateCampaign,
} from "@/modules/marketing/actions/campaign.actions";
import {
  campaignSchema,
  type CampaignInput,
} from "@/modules/marketing/schemas/campaign.schema";
import type { Campaign } from "@/generated/prisma/client";

export type SerializedCampaign = Omit<Campaign, "budget"> & {
  budget: number | null;
};

const EMPTY_VALUES: CampaignInput = {
  name: "",
  description: "",
  channel: "",
  startsAt: "",
  endsAt: "",
  budget: undefined,
};

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

function toDateInputValue(date: Date | null): string {
  if (!date) return "";
  return date.toISOString().slice(0, 10);
}

function toFormValues(campaign: SerializedCampaign): CampaignInput {
  return {
    name: campaign.name,
    description: campaign.description ?? "",
    channel: campaign.channel,
    startsAt: toDateInputValue(campaign.startsAt),
    endsAt: toDateInputValue(campaign.endsAt),
    budget: campaign.budget ?? undefined,
  };
}

function CampaignFields({ form }: { form: UseFormReturn<CampaignInput> }) {
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
              <Textarea rows={3} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="channel"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Canal</FormLabel>
              <FormControl>
                <Input placeholder="Instagram, Google Ads, WhatsApp..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="budget"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Orçamento (opcional)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  value={field.value ?? ""}
                  onChange={(e) =>
                    field.onChange(e.target.value === "" ? undefined : e.target.valueAsNumber)
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
          name="endsAt"
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
    </>
  );
}

export function CampaignManager({ campaigns }: { campaigns: SerializedCampaign[] }) {
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">Campanhas</h1>
        <EntityFormDialog<CampaignInput>
          title="Nova campanha"
          resolver={zodResolver(campaignSchema)}
          defaultValues={EMPTY_VALUES}
          renderFields={(form) => <CampaignFields form={form} />}
          onSubmit={createCampaign}
          trigger={
            <Button variant="gold" size="sm">
              <Plus className="size-4" />
              Nova campanha
            </Button>
          }
        />
      </div>

      {campaigns.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nenhuma campanha cadastrada.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Canal</TableHead>
              <TableHead>Período</TableHead>
              <TableHead>Orçamento</TableHead>
              <TableHead className="w-24 text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {campaigns.map((campaign) => (
              <TableRow key={campaign.id}>
                <TableCell className="font-medium">{campaign.name}</TableCell>
                <TableCell className="text-muted-foreground">{campaign.channel}</TableCell>
                <TableCell className="text-muted-foreground">
                  {campaign.startsAt ? toDateInputValue(campaign.startsAt) : "—"}
                  {" – "}
                  {campaign.endsAt ? toDateInputValue(campaign.endsAt) : "—"}
                </TableCell>
                <TableCell>
                  {campaign.budget != null ? currencyFormatter.format(campaign.budget) : "—"}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <EntityFormDialog<CampaignInput>
                      title="Editar campanha"
                      resolver={zodResolver(campaignSchema)}
                      defaultValues={toFormValues(campaign)}
                      renderFields={(form) => <CampaignFields form={form} />}
                      onSubmit={(values) => updateCampaign(campaign.id, values)}
                      trigger={
                        <Button variant="ghost" size="sm">
                          Editar
                        </Button>
                      }
                    />
                    <DeleteEntityButton
                      name={campaign.name}
                      onDelete={() => deleteCampaign(campaign.id)}
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
