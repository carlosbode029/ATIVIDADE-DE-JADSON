"use client";

import Image from "next/image";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import type { UseFormReturn } from "react-hook-form";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DeleteEntityButton } from "@/components/admin/delete-entity-button";
import { EntityFormDialog } from "@/components/admin/entity-form-dialog";
import { MediaUploadButton } from "@/components/admin/media-upload-button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  createBanner,
  deleteBanner,
  updateBanner,
} from "@/modules/marketing/actions/banner.actions";
import { bannerSchema, type BannerInput } from "@/modules/marketing/schemas/banner.schema";
import type { Banner } from "@/generated/prisma/client";

const EMPTY_VALUES: BannerInput = {
  title: "",
  imageUrl: "",
  linkUrl: "",
  position: "HOME",
  order: 0,
  startsAt: "",
  expiresAt: "",
  isActive: true,
};

function toDateInputValue(date: Date | null): string {
  if (!date) return "";
  return date.toISOString().slice(0, 10);
}

function toFormValues(banner: Banner): BannerInput {
  return {
    title: banner.title,
    imageUrl: banner.imageUrl,
    linkUrl: banner.linkUrl ?? "",
    position: banner.position,
    order: banner.order,
    startsAt: toDateInputValue(banner.startsAt),
    expiresAt: toDateInputValue(banner.expiresAt),
    isActive: banner.isActive,
  };
}

function BannerFields({ form }: { form: UseFormReturn<BannerInput> }) {
  const imageUrl = form.watch("imageUrl");

  return (
    <>
      <FormField
        control={form.control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Título</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="imageUrl"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Imagem</FormLabel>
            <div className="flex items-center gap-3">
              {imageUrl && (
                <Image
                  src={imageUrl}
                  alt=""
                  width={80}
                  height={40}
                  className="h-10 w-20 rounded-md object-cover"
                  unoptimized
                />
              )}
              <MediaUploadButton
                label={imageUrl ? "Trocar imagem" : "Enviar imagem"}
                onUploaded={field.onChange}
              />
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="linkUrl"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Link ao clicar (opcional)</FormLabel>
            <FormControl>
              <Input placeholder="/produtos?categoria=lancamentos" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="position"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Posição</FormLabel>
              <FormControl>
                <Input placeholder="HOME" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="order"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ordem</FormLabel>
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
              <FormLabel>Expira em (opcional)</FormLabel>
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
            <FormLabel className="!mt-0">Ativo</FormLabel>
          </FormItem>
        )}
      />
    </>
  );
}

export function BannerManager({ banners }: { banners: Banner[] }) {
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Banners</h1>
          <p className="text-sm text-muted-foreground">
            Posição &quot;HOME&quot; aparece na página inicial, logo abaixo do topo.
          </p>
        </div>
        <EntityFormDialog<BannerInput>
          title="Novo banner"
          resolver={zodResolver(bannerSchema)}
          defaultValues={EMPTY_VALUES}
          renderFields={(form) => <BannerFields form={form} />}
          onSubmit={createBanner}
          trigger={
            <Button variant="gold" size="sm">
              <Plus className="size-4" />
              Adicionar banner
            </Button>
          }
        />
      </div>

      {banners.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nenhum banner cadastrado.</p>
      ) : (
        <div className="space-y-3">
          {banners.map((banner) => (
            <div
              key={banner.id}
              className="flex items-center justify-between rounded-xl border border-border bg-card p-4"
            >
              <div className="flex items-center gap-3">
                <Image
                  src={banner.imageUrl}
                  alt=""
                  width={80}
                  height={40}
                  className="h-10 w-20 rounded-md object-cover"
                  unoptimized
                />
                <div>
                  <p className="font-medium">{banner.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {banner.position} · ordem {banner.order}
                  </p>
                </div>
                {!banner.isActive && <Badge variant="secondary">Inativo</Badge>}
              </div>

              <div className="flex gap-1">
                <EntityFormDialog<BannerInput>
                  title="Editar banner"
                  resolver={zodResolver(bannerSchema)}
                  defaultValues={toFormValues(banner)}
                  renderFields={(form) => <BannerFields form={form} />}
                  onSubmit={(values) => updateBanner(banner.id, values)}
                  trigger={
                    <Button variant="ghost" size="sm">
                      Editar
                    </Button>
                  }
                />
                <DeleteEntityButton
                  name={banner.title}
                  onDelete={() => deleteBanner(banner.id)}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
