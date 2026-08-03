import { redirect } from "next/navigation";

import { AccountNav } from "@/components/storefront/account/account-nav";
import { LogoutButton } from "@/components/storefront/account/logout-button";
import { getCurrentUser } from "@/modules/auth/queries/get-current-user";

export default async function AccountLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?redirectTo=/conta/perfil");
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold sm:text-3xl">
          Olá, {user.name.split(" ")[0]}
        </h1>
        <p className="text-sm text-muted-foreground">{user.email}</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
        <aside className="flex flex-col gap-1 lg:sticky lg:top-24 lg:self-start">
          <AccountNav />
          <LogoutButton />
        </aside>
        <div>{children}</div>
      </div>
    </div>
  );
}
