import type { User as SupabaseUser } from "@supabase/supabase-js";

import { prisma } from "@/lib/prisma";

/**
 * Garante que exista uma linha em `public.User` para o usuário autenticado
 * no Supabase. Idempotente — chamado após login/cadastro por senha, login
 * social e confirmação de e-mail, já que qualquer um desses fluxos pode ser
 * o primeiro contato do usuário com o banco da aplicação.
 */
export async function syncUserFromSupabase(supabaseUser: SupabaseUser) {
  if (!supabaseUser.email) {
    throw new Error("Usuário Supabase sem e-mail associado.");
  }

  const metadata = supabaseUser.user_metadata as Record<string, unknown>;
  const name =
    (metadata?.name as string | undefined) ??
    (metadata?.full_name as string | undefined) ??
    supabaseUser.email.split("@")[0];

  return prisma.user.upsert({
    where: { supabaseUserId: supabaseUser.id },
    update: {
      email: supabaseUser.email,
    },
    create: {
      supabaseUserId: supabaseUser.id,
      email: supabaseUser.email,
      name,
      avatarUrl: metadata?.avatar_url as string | undefined,
    },
  });
}
