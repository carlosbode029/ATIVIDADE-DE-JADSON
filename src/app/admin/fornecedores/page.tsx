import type { Metadata } from "next";

import { SupplierManager } from "@/components/admin/supplier-manager";
import { listSuppliers } from "@/modules/suppliers/queries/supplier.queries";

export const metadata: Metadata = {
  title: "Fornecedores",
};

export default async function AdminFornecedoresPage() {
  const suppliers = await listSuppliers();
  return <SupplierManager suppliers={suppliers} />;
}
