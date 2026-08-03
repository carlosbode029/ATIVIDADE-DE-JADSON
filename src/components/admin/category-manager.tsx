"use client";

import Image from "next/image";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import type { UseFormReturn } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  createCategory,
  deleteCategory,
  updateCategory,
} from "@/modules/catalog/actions/category.actions";
import {
  categorySchema,
  type CategoryInput,
} from "@/modules/catalog/schemas/category.schema";
import type { Category } from "@/generated/prisma/client";

type CategoryWithChildren = Category & { children: Category[] };

function buildEmptyValues(parentId = ""): CategoryInput {
  return { name: "", parentId, imageUrl: "", order: 0, isActive: true };
}

function CategoryFields({
  form,
  parentOptions,
}: {
  form: UseFormReturn<CategoryInput>;
  parentOptions: Category[];
}) {
  const imageUrl = form.watch("imageUrl");

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
        name="parentId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Categoria pai (deixe vazio para categoria principal)</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Categoria principal" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {parentOptions.map((category) => (
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
        name="imageUrl"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Imagem</FormLabel>
            <div className="flex items-center gap-3">
              {imageUrl && (
                <Image
                  src={imageUrl}
                  alt=""
                  width={48}
                  height={48}
                  className="size-12 rounded-md object-cover"
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

      <div className="grid grid-cols-2 gap-4">
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

        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex flex-col justify-end gap-2">
              <FormLabel>Ativa</FormLabel>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
      </div>
    </>
  );
}

export function CategoryManager({
  categories,
}: {
  categories: CategoryWithChildren[];
}) {
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Categorias</h2>
        <EntityFormDialog<CategoryInput>
          title="Nova categoria"
          resolver={zodResolver(categorySchema)}
          defaultValues={buildEmptyValues()}
          renderFields={(form) => (
            <CategoryFields form={form} parentOptions={categories} />
          )}
          onSubmit={createCategory}
          trigger={
            <Button variant="gold" size="sm">
              <Plus className="size-4" />
              Adicionar categoria
            </Button>
          }
        />
      </div>

      {categories.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Nenhuma categoria cadastrada.
        </p>
      ) : (
        <div className="space-y-4">
          {categories.map((category) => {
            const parentOptions = categories.filter(
              (c) => c.id !== category.id,
            );

            return (
              <div
                key={category.id}
                className="rounded-xl border border-border bg-card p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {category.imageUrl && (
                      <Image
                        src={category.imageUrl}
                        alt=""
                        width={40}
                        height={40}
                        className="size-10 rounded-md object-cover"
                        unoptimized
                      />
                    )}
                    <div>
                      <p className="font-medium">{category.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {category.slug}
                      </p>
                    </div>
                    {!category.isActive && (
                      <Badge variant="secondary">Inativa</Badge>
                    )}
                  </div>

                  <div className="flex gap-1">
                    <EntityFormDialog<CategoryInput>
                      title="Nova subcategoria"
                      resolver={zodResolver(categorySchema)}
                      defaultValues={buildEmptyValues(category.id)}
                      renderFields={(form) => (
                        <CategoryFields
                          form={form}
                          parentOptions={categories}
                        />
                      )}
                      onSubmit={createCategory}
                      trigger={
                        <Button variant="ghost" size="sm">
                          <Plus className="size-4" />
                          Subcategoria
                        </Button>
                      }
                    />
                    <EntityFormDialog<CategoryInput>
                      title="Editar categoria"
                      resolver={zodResolver(categorySchema)}
                      defaultValues={{
                        name: category.name,
                        parentId: category.parentId ?? "",
                        imageUrl: category.imageUrl ?? "",
                        order: category.order,
                        isActive: category.isActive,
                      }}
                      renderFields={(form) => (
                        <CategoryFields
                          form={form}
                          parentOptions={parentOptions}
                        />
                      )}
                      onSubmit={(values) =>
                        updateCategory(category.id, values)
                      }
                      trigger={
                        <Button variant="ghost" size="sm">
                          Editar
                        </Button>
                      }
                    />
                    <DeleteEntityButton
                      name={category.name}
                      onDelete={() => deleteCategory(category.id)}
                    />
                  </div>
                </div>

                {category.children.length > 0 && (
                  <ul className="mt-4 space-y-2 border-l border-border pl-4">
                    {category.children.map((child) => (
                      <li
                        key={child.id}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{child.name}</span>
                          {!child.isActive && (
                            <Badge variant="secondary">Inativa</Badge>
                          )}
                        </div>
                        <div className="flex gap-1">
                          <EntityFormDialog<CategoryInput>
                            title="Editar subcategoria"
                            resolver={zodResolver(categorySchema)}
                            defaultValues={{
                              name: child.name,
                              parentId: child.parentId ?? "",
                              imageUrl: child.imageUrl ?? "",
                              order: child.order,
                              isActive: child.isActive,
                            }}
                            renderFields={(form) => (
                              <CategoryFields
                                form={form}
                                parentOptions={categories}
                              />
                            )}
                            onSubmit={(values) =>
                              updateCategory(child.id, values)
                            }
                            trigger={
                              <Button variant="ghost" size="sm">
                                Editar
                              </Button>
                            }
                          />
                          <DeleteEntityButton
                            name={child.name}
                            onDelete={() => deleteCategory(child.id)}
                          />
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
