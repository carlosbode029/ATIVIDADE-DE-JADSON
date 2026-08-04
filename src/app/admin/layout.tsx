import Link from "next/link";
import { redirect } from "next/navigation";

import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { LogoutButton } from "@/components/storefront/account/logout-button";
import { getCurrentUser } from "@/modules/auth/queries/get-current-user";

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();

  if (!user || (user.role !== "ADMIN" && user.role !== "STAFF")) {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden w-64 shrink-0 border-r border-border/60 bg-card p-4 lg:flex lg:flex-col lg:justify-between">
        <div>
          <Link
            href="/admin"
            className="mb-6 block font-display text-lg font-bold tracking-wide"
          >
            BK <span className="text-gold">IMPORTS</span>
            <span className="ml-2 text-xs font-normal text-muted-foreground">
              admin
            </span>
          </Link>
          <AdminSidebar isAdmin={user.role === "ADMIN"} />
        </div>
        <div className="space-y-2">
          <Link
            href="/"
            className="block px-3 text-xs text-muted-foreground hover:text-foreground"
          >
            ← Voltar à loja
          </Link>
          <LogoutButton />
        </div>
      </aside>

      <main className="flex-1 p-6 lg:p-10">{children}</main>
    </div>
  );
}
