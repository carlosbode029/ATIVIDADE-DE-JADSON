import type { MetadataRoute } from "next";

import { siteConfig } from "@/config/site";
import { prisma } from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, categories, teams] = await Promise.all([
    prisma.product.findMany({
      where: { isActive: true },
      select: { slug: true, updatedAt: true },
    }),
    prisma.category.findMany({
      where: { isActive: true },
      select: { slug: true },
    }),
    prisma.team.findMany({ select: { slug: true } }),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: siteConfig.url, changeFrequency: "daily", priority: 1 },
    { url: `${siteConfig.url}/produtos`, changeFrequency: "daily", priority: 0.9 },
    { url: `${siteConfig.url}/busca`, changeFrequency: "weekly", priority: 0.3 },
  ];

  const categoryRoutes: MetadataRoute.Sitemap = categories.map((category) => ({
    url: `${siteConfig.url}/categorias/${category.slug}`,
    changeFrequency: "daily",
    priority: 0.7,
  }));

  const teamRoutes: MetadataRoute.Sitemap = teams.map((team) => ({
    url: `${siteConfig.url}/times/${team.slug}`,
    changeFrequency: "daily",
    priority: 0.6,
  }));

  const productRoutes: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${siteConfig.url}/produtos/${product.slug}`,
    lastModified: product.updatedAt,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticRoutes, ...categoryRoutes, ...teamRoutes, ...productRoutes];
}
