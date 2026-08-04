"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Boxes,
  Contact,
  Globe2,
  Image as ImageIcon,
  LayoutDashboard,
  Megaphone,
  Percent,
  ShieldCheck,
  ShoppingCart,
  Shirt,
  Tags,
  Truck,
  Trophy,
  Users,
} from "lucide-react";

import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/pedidos", label: "Pedidos", icon: ShoppingCart },
  { href: "/admin/produtos", label: "Produtos", icon: Shirt },
  { href: "/admin/estoque", label: "Estoque", icon: Boxes },
  { href: "/admin/categorias", label: "Categorias", icon: Tags },
  { href: "/admin/marcas", label: "Marcas", icon: Tags },
  { href: "/admin/times", label: "Times", icon: Users },
  { href: "/admin/ligas", label: "Ligas", icon: Trophy },
  { href: "/admin/paises", label: "Países", icon: Globe2 },
  { href: "/admin/temporadas", label: "Temporadas", icon: Trophy },
  { href: "/admin/transportadoras", label: "Transportadoras", icon: Truck },
  { href: "/admin/fretes", label: "Fretes", icon: Truck },
  { href: "/admin/cupons", label: "Cupons", icon: Percent },
  { href: "/admin/banners", label: "Banners", icon: ImageIcon },
  { href: "/admin/campanhas", label: "Campanhas", icon: Megaphone },
  { href: "/admin/fornecedores", label: "Fornecedores", icon: Contact },
] as const;

export function AdminSidebar({ isAdmin = false }: { isAdmin?: boolean }) {
  const pathname = usePathname();
  const links = isAdmin
    ? [
        ...LINKS,
        {
          href: "/admin/equipe",
          label: "Equipe",
          icon: ShieldCheck,
        } as const,
      ]
    : LINKS;

  return (
    <nav className="flex flex-col gap-1">
      {links.map((link) => {
        const isActive = "exact" in link
          ? pathname === link.href
          : pathname.startsWith(link.href);
        const Icon = link.icon;

        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-secondary text-foreground"
                : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground",
            )}
          >
            <Icon className="size-4" />
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
