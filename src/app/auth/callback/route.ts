import { NextResponse, type NextRequest } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { syncUserFromSupabase } from "@/modules/auth/services/user-sync.service";

/**
 * Destino do OAuth (Google) via fluxo PKCE: troca o `code` por uma sessão
 * e sincroniza `public.User` antes de redirecionar.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      if (data.user) {
        await syncUserFromSupabase(data.user);
      }
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=oauth_falhou`);
}
