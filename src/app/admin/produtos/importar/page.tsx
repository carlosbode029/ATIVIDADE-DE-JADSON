import type { Metadata } from "next";

import { BulkProductImportForm } from "@/components/admin/bulk-product-import-form";
import { listTopLevelCategories } from "@/modules/catalog/queries/category.queries";
import { listSeasons } from "@/modules/catalog/queries/reference-data.queries";

export const metadata: Metadata = {
  title: "Importar produtos em massa",
};

export default async function ImportarProdutosPage() {
  const [categories, seasons] = await Promise.all([
    listTopLevelCategories(),
    listSeasons(),
  ]);

  return (
    <div>
      <h1 className="mb-2 font-display text-2xl font-bold">
        Importar produtos em massa
      </h1>
      <p className="mb-6 max-w-2xl text-sm text-muted-foreground">
        Cola uma lista de times (um por linha, precisam já estar cadastrados
        em <strong>Times</strong>) e o sistema cria um rascunho de produto
        pra cada um — nome, categoria, temporada e time já preenchidos, mas
        inativo (não aparece na loja). Depois é só abrir cada rascunho em{" "}
        <strong>Produtos</strong> pra adicionar foto real, preço e tamanhos
        e ativar.
      </p>
      <BulkProductImportForm categories={categories} seasons={seasons} />
    </div>
  );
}
