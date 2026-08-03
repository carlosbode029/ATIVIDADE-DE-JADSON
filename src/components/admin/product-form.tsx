"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";

import { MediaUploadButton } from "@/components/admin/media-upload-button";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  createProduct,
  updateProduct,
} from "@/modules/catalog/actions/product.actions";
import type {
  getProductById,
  listProductOptions,
} from "@/modules/catalog/queries/product.queries";
import type { listCategoryTree } from "@/modules/catalog/queries/category.queries";
import type {
  listBrands,
  listCountries,
  listLeagues,
  listSeasons,
  listTeams,
} from "@/modules/catalog/queries/reference-data.queries";
import {
  productModelValues,
  productSchema,
  sleeveTypeValues,
  type ProductInput,
} from "@/modules/catalog/schemas/product.schema";

type CategoryTree = Awaited<ReturnType<typeof listCategoryTree>>;
type Product = NonNullable<Awaited<ReturnType<typeof getProductById>>>;
type ProductOption = Awaited<ReturnType<typeof listProductOptions>>[number];

type ProductFormProps = {
  categories: CategoryTree;
  brands: Awaited<ReturnType<typeof listBrands>>;
  seasons: Awaited<ReturnType<typeof listSeasons>>;
  leagues: Awaited<ReturnType<typeof listLeagues>>;
  countries: Awaited<ReturnType<typeof listCountries>>;
  teams: Awaited<ReturnType<typeof listTeams>>;
  relatedOptions: ProductOption[];
  product?: Product;
};

function buildDefaultValues(product?: Product): ProductInput {
  if (!product) {
    return {
      name: "",
      description: "",
      sku: "",
      internalCode: "",
      model: "TORCEDOR",
      sleeveType: "CURTA",
      price: 0,
      promoPrice: undefined,
      weightGrams: 200,
      isPreOrder: false,
      leadTimeDays: undefined,
      allowsCustomName: true,
      allowsCustomNumber: true,
      allowsPatch: true,
      isActive: true,
      isFeatured: false,
      metaTitle: "",
      metaDescription: "",
      categoryId: "",
      subcategoryId: "",
      brandId: "",
      seasonId: "",
      leagueId: "",
      countryId: "",
      teamId: "",
      images: [],
      videos: [],
      variants: [],
      patches: [],
      relatedProductIds: [],
    };
  }

  return {
    name: product.name,
    description: product.description,
    sku: product.sku,
    internalCode: product.internalCode,
    model: product.model,
    sleeveType: product.sleeveType,
    price: Number(product.price),
    promoPrice: product.promoPrice ? Number(product.promoPrice) : undefined,
    weightGrams: product.weightGrams,
    isPreOrder: product.isPreOrder,
    leadTimeDays: product.leadTimeDays ?? undefined,
    allowsCustomName: product.allowsCustomName,
    allowsCustomNumber: product.allowsCustomNumber,
    allowsPatch: product.allowsPatch,
    isActive: product.isActive,
    isFeatured: product.isFeatured,
    metaTitle: product.metaTitle ?? "",
    metaDescription: product.metaDescription ?? "",
    categoryId: product.categoryId,
    subcategoryId: product.subcategoryId ?? "",
    brandId: product.brandId ?? "",
    seasonId: product.seasonId ?? "",
    leagueId: product.leagueId ?? "",
    countryId: product.countryId ?? "",
    teamId: product.teamId ?? "",
    images: product.images.map((image) => ({ url: image.url })),
    videos: product.videos.map((video) => ({ url: video.url })),
    variants: product.variants.map((variant) => ({
      id: variant.id,
      size: variant.size,
      sku: variant.sku,
      stockQuantity: variant.stockQuantity,
      lowStockThreshold: variant.lowStockThreshold,
      priceOverride: variant.priceOverride
        ? Number(variant.priceOverride)
        : undefined,
    })),
    patches: product.patches.map((patch) => ({
      id: patch.id,
      name: patch.name,
      price: Number(patch.price),
    })),
    relatedProductIds: product.relatedFrom.map((rel) => rel.relatedProductId),
  };
}

export function ProductForm({
  categories,
  brands,
  seasons,
  leagues,
  countries,
  teams,
  relatedOptions,
  product,
}: ProductFormProps) {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const isEditing = Boolean(product);

  const form = useForm<ProductInput>({
    resolver: zodResolver(productSchema),
    defaultValues: buildDefaultValues(product),
  });

  const imagesArray = useFieldArray({ control: form.control, name: "images" });
  const videosArray = useFieldArray({ control: form.control, name: "videos" });
  const variantsArray = useFieldArray({
    control: form.control,
    name: "variants",
  });
  const patchesArray = useFieldArray({ control: form.control, name: "patches" });

  const selectedCategoryId = form.watch("categoryId");
  const selectedCategory = categories.find((c) => c.id === selectedCategoryId);
  const subcategoryOptions = selectedCategory?.children ?? [];

  async function onSubmit(values: ProductInput) {
    setFormError(null);
    const result = product
      ? await updateProduct(product.id, values)
      : await createProduct(values);

    if (result?.error) {
      setFormError(result.error);
      return;
    }

    if (product) {
      toast.success("Produto atualizado.");
      router.refresh();
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" noValidate>
        <Tabs defaultValue="informacoes">
          <TabsList>
            <TabsTrigger value="informacoes">Informações</TabsTrigger>
            <TabsTrigger value="midia">Mídia</TabsTrigger>
            <TabsTrigger value="variacoes">Variações e patches</TabsTrigger>
            <TabsTrigger value="seo">SEO e relacionados</TabsTrigger>
          </TabsList>

          <TabsContent value="informacoes" className="space-y-6 pt-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
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
                  <FormItem className="sm:col-span-2">
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Textarea rows={4} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sku"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SKU</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="internalCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Código interno</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
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

              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoria</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        form.setValue("subcategoryId", "");
                      }}
                      value={field.value}
                    >
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
                name="subcategoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subcategoria (opcional)</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={subcategoryOptions.length === 0}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a subcategoria" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {subcategoryOptions.map((sub) => (
                          <SelectItem key={sub.id} value={sub.id}>
                            {sub.name}
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
                name="brandId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Marca (opcional)</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a marca" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {brands.map((brand) => (
                          <SelectItem key={brand.id} value={brand.id}>
                            {brand.name}
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
                          <SelectValue placeholder="Selecione a temporada" />
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
                name="leagueId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Liga/competição (opcional)</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a liga" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {leagues.map((league) => (
                          <SelectItem key={league.id} value={league.id}>
                            {league.name}
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
                name="teamId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Time (opcional)</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o time" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {teams.map((team) => (
                          <SelectItem key={team.id} value={team.id}>
                            {team.name}
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
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preço (R$)</FormLabel>
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

              <FormField
                control={form.control}
                name="promoPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preço promocional (opcional)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        value={field.value ?? ""}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value === ""
                              ? undefined
                              : e.target.valueAsNumber,
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
                name="weightGrams"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Peso (gramas)</FormLabel>
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
                name="isPreOrder"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border border-border p-3">
                    <FormLabel>Sob encomenda (não é pronta entrega)</FormLabel>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {form.watch("isPreOrder") && (
                <FormField
                  control={form.control}
                  name="leadTimeDays"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prazo de entrega (dias)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          value={field.value ?? ""}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value === ""
                                ? undefined
                                : e.target.valueAsNumber,
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {(
                [
                  ["allowsCustomName", "Permite nome personalizado"],
                  ["allowsCustomNumber", "Permite número personalizado"],
                  ["allowsPatch", "Permite patch"],
                  ["isActive", "Ativo na loja"],
                  ["isFeatured", "Produto em destaque"],
                ] as const
              ).map(([name, label]) => (
                <FormField
                  key={name}
                  control={form.control}
                  name={name}
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border border-border p-3">
                      <FormLabel className="font-normal">{label}</FormLabel>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="midia" className="space-y-8 pt-6">
            <div>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold">Fotos</h3>
                <MediaUploadButton
                  resourceType="image"
                  label="Adicionar foto"
                  onUploaded={(url) => imagesArray.append({ url })}
                />
              </div>
              {form.formState.errors.images && (
                <p className="mb-2 text-sm font-medium text-destructive">
                  {form.formState.errors.images.message}
                </p>
              )}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
                {imagesArray.fields.map((item, index) => {
                  const url = form.watch(`images.${index}.url`);
                  return (
                    <div key={item.id} className="group relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={url}
                        alt=""
                        className="aspect-square w-full rounded-md border border-border object-cover"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute right-1 top-1 size-6"
                        onClick={() => imagesArray.remove(index)}
                      >
                        <Trash2 className="size-3" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold">Vídeos</h3>
                <MediaUploadButton
                  resourceType="video"
                  label="Adicionar vídeo"
                  onUploaded={(url) => videosArray.append({ url })}
                />
              </div>
              <div className="space-y-2">
                {videosArray.fields.map((item, index) => {
                  const url = form.watch(`videos.${index}.url`);
                  return (
                    <div
                      key={item.id}
                      className="flex items-center justify-between rounded-md border border-border p-2 text-sm"
                    >
                      <span className="truncate">{url}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => videosArray.remove(index)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="variacoes" className="space-y-8 pt-6">
            <div>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold">Tamanhos e estoque</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    variantsArray.append({
                      size: "",
                      sku: "",
                      stockQuantity: 0,
                      lowStockThreshold: 5,
                    })
                  }
                >
                  <Plus className="size-4" />
                  Adicionar tamanho
                </Button>
              </div>
              {form.formState.errors.variants?.root && (
                <p className="mb-2 text-sm font-medium text-destructive">
                  {form.formState.errors.variants.root.message}
                </p>
              )}
              <div className="space-y-3">
                {variantsArray.fields.map((item, index) => (
                  <div
                    key={item.id}
                    className="grid grid-cols-2 gap-3 rounded-lg border border-border p-3 sm:grid-cols-5"
                  >
                    <FormField
                      control={form.control}
                      name={`variants.${index}.size`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tamanho</FormLabel>
                          <FormControl>
                            <Input placeholder="M" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`variants.${index}.sku`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>SKU da variante</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`variants.${index}.stockQuantity`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Estoque</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              onChange={(e) =>
                                field.onChange(e.target.valueAsNumber)
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`variants.${index}.lowStockThreshold`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Alerta estoque baixo</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              onChange={(e) =>
                                field.onChange(e.target.valueAsNumber)
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex items-end">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => variantsArray.remove(index)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold">Patches</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => patchesArray.append({ name: "", price: 0 })}
                >
                  <Plus className="size-4" />
                  Adicionar patch
                </Button>
              </div>
              <div className="space-y-3">
                {patchesArray.fields.map((item, index) => (
                  <div
                    key={item.id}
                    className="grid grid-cols-2 gap-3 rounded-lg border border-border p-3 sm:grid-cols-3"
                  >
                    <FormField
                      control={form.control}
                      name={`patches.${index}.name`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome do patch</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`patches.${index}.price`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Preço adicional (R$)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              {...field}
                              onChange={(e) =>
                                field.onChange(e.target.valueAsNumber)
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex items-end">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => patchesArray.remove(index)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="seo" className="space-y-6 pt-6">
            <FormField
              control={form.control}
              name="metaTitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meta título (opcional)</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="metaDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meta descrição (opcional)</FormLabel>
                  <FormControl>
                    <Textarea rows={3} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="relatedProductIds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Produtos relacionados</FormLabel>
                  <div className="max-h-56 space-y-2 overflow-y-auto rounded-md border border-input p-3">
                    {relatedOptions.length === 0 && (
                      <p className="text-sm text-muted-foreground">
                        Nenhum outro produto cadastrado ainda.
                      </p>
                    )}
                    {relatedOptions.map((option) => {
                      const checked = field.value.includes(option.id);
                      return (
                        <label
                          key={option.id}
                          className="flex items-center gap-2 text-sm"
                        >
                          <Checkbox
                            checked={checked}
                            onCheckedChange={(value) => {
                              field.onChange(
                                value
                                  ? [...field.value, option.id]
                                  : field.value.filter((id) => id !== option.id),
                              );
                            }}
                          />
                          {option.name}{" "}
                          <span className="text-muted-foreground">
                            ({option.sku})
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </FormItem>
              )}
            />
          </TabsContent>
        </Tabs>

        {formError && (
          <p className="text-sm font-medium text-destructive">{formError}</p>
        )}

        <Button
          type="submit"
          variant="gold"
          size="lg"
          disabled={form.formState.isSubmitting}
        >
          {isEditing ? "Salvar alterações" : "Criar produto"}
        </Button>
      </form>
    </Form>
  );
}
