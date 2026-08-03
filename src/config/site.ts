export const siteConfig = {
  name: "BK IMPORTS",
  tagline: "Camisas de futebol premium",
  description:
    "BK IMPORTS — loja premium de camisas de futebol. Times brasileiros, europeus, seleções e edições retrô, com modelo torcedor e jogador.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://bkimports.com.br",
  ogImage: "/og-image.jpg",
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "",
  links: {
    instagram: "https://instagram.com/bkimports",
  },
} as const;

export const mainCategories = [
  { name: "Times Brasileiros", slug: "times-brasileiros" },
  { name: "Times Europeus", slug: "times-europeus" },
  { name: "Seleções", slug: "selecoes" },
  { name: "Camisas Retrô", slug: "camisas-retro" },
  { name: "Modelo Torcedor", slug: "modelo-torcedor" },
  { name: "Modelo Jogador", slug: "modelo-jogador" },
  { name: "Infantil", slug: "infantil" },
  { name: "Baby Look", slug: "baby-look" },
  { name: "Shorts", slug: "shorts" },
  { name: "Jaquetas", slug: "jaquetas" },
  { name: "Treino", slug: "treino" },
  { name: "Agasalhos", slug: "agasalhos" },
  { name: "Acessórios", slug: "acessorios" },
  { name: "Promoções", slug: "promocoes" },
  { name: "Lançamentos", slug: "lancamentos" },
] as const;
