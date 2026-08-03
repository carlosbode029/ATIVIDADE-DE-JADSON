import { cache } from "react";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

/**
 * Sessão + linha correspondente em `public.User`. `cache()` evita repetir a
 * consulta quando vários componentes da mesma árvore de Server Components
 * precisam do usuário atual na mesma requisição.
 */
export const getCurrentUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user: supabaseUser },
  } = await supabase.auth.getUser();

  if (!supabaseUser) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { supabaseUserId: supabaseUser.id },
  });

  return user;
});
