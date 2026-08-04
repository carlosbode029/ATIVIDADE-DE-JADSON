"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus, Upload } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DeleteEntityButton } from "@/components/admin/delete-entity-button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { deleteProduct } from "@/modules/catalog/actions/product.actions";
import type { listProductsAdmin } from "@/modules/catalog/queries/product.queries";

type ProductsResult = Awaited<ReturnType<typeof listProductsAdmin>>;
type SerializedProductItem = Omit<
  ProductsResult["items"][number],
  "price" | "promoPrice"
> & {
  price: number;
  promoPrice: number | null;
};
export type SerializedProductsResult = Omit<ProductsResult, "items"> & {
  items: SerializedProductItem[];
};

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export function ProductsTable({ result }: { result: SerializedProductsResult }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleSearch(value: string) {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set("q", value);
    } else {
      params.delete("q");
    }
    params.delete("page");
    router.push(`/admin/produtos?${params.toString()}`);
  }

  function goToPage(page: number) {
    const params = new URLSearchParams(searchParams);
    params.set("page", String(page));
    router.push(`/admin/produtos?${params.toString()}`);
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-bold">Produtos</h1>
        <div className="flex gap-3">
          <Input
            placeholder="Buscar por nome, SKU ou código..."
            defaultValue={searchParams.get("q") ?? ""}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-64"
          />
          <Button variant="outline" asChild>
            <Link href="/admin/produtos/importar">
              <Upload className="size-4" />
              Importar em massa
            </Link>
          </Button>
          <Button variant="gold" asChild>
            <Link href="/admin/produtos/novo">
              <Plus className="size-4" />
              Novo produto
            </Link>
          </Button>
        </div>
      </div>

      {result.items.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Nenhum produto encontrado.
        </p>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produto</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Preço</TableHead>
                <TableHead>Estoque</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-24 text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {result.items.map((product) => {
                const stock = product.variants.reduce(
                  (sum, v) => sum + v.stockQuantity,
                  0,
                );

                return (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="font-medium">{product.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {product.sku}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {product.category.name}
                    </TableCell>
                    <TableCell>
                      {currencyFormatter.format(
                        Number(product.promoPrice ?? product.price),
                      )}
                    </TableCell>
                    <TableCell>{stock}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {product.isActive ? (
                          <Badge variant="gold">Ativo</Badge>
                        ) : (
                          <Badge variant="secondary">Inativo</Badge>
                        )}
                        {product.isFeatured && (
                          <Badge variant="outline">Destaque</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/admin/produtos/${product.id}`}>
                            Editar
                          </Link>
                        </Button>
                        <DeleteEntityButton
                          name={product.name}
                          onDelete={() => deleteProduct(product.id)}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {result.totalPages > 1 && (
            <div className="mt-4 flex items-center justify-center gap-2">
              {Array.from({ length: result.totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <Button
                    key={page}
                    variant={page === result.page ? "gold" : "outline"}
                    size="sm"
                    onClick={() => goToPage(page)}
                  >
                    {page}
                  </Button>
                ),
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
