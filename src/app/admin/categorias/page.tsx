import type { Metadata } from "next";

import { CategoryManager } from "@/components/admin/category-manager";
import { listCategoryTree } from "@/modules/catalog/queries/category.queries";

export const metadata: Metadata = {
  title: "Categorias",
};

export default async function AdminCategoriasPage() {
  const categories = await listCategoryTree();
  return <CategoryManager categories={categories} />;
}
