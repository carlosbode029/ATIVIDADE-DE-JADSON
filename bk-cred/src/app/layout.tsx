import type { Metadata, Viewport } from "next";
import { Sora, Manrope } from "next/font/google";
import "./globals.css";

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "BK CRÉD | Transforme o limite do seu cartão em PIX",
  description:
    "Simule gratuitamente e transforme o limite do seu cartão de crédito em dinheiro via PIX. Resposta rápida, parcelamento em até 12x e atendimento humanizado pelo WhatsApp.",
  keywords: [
    "BK CRÉD",
    "empréstimo cartão de crédito",
    "dinheiro no PIX",
    "simulação de crédito",
    "limite do cartão",
  ],
  openGraph: {
    title: "BK CRÉD | Transforme o limite do seu cartão em PIX",
    description:
      "Simule gratuitamente e receba o valor via PIX em minutos. Parcelamento em até 12x.",
    locale: "pt_BR",
    type: "website",
    siteName: "BK CRÉD",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0c",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${sora.variable} ${manrope.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
