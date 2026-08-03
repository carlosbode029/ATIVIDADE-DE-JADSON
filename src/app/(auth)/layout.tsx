import Link from "next/link";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-background px-4 py-16">
      <Link
        href="/"
        className="font-display text-2xl font-bold tracking-wide text-foreground"
      >
        BK <span className="text-gold">IMPORTS</span>
      </Link>
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}
