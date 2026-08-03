import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { syncUserFromSupabase } from "@/modules/auth/services/user-sync.service";
import { mergeGuestCartIntoUser } from "@/modules/cart/services/merge-guest-cart";

/**
 * Destino dos links de e-mail (confirmação de cadastro e recuperação de
 * senha). O template de e-mail no Supabase deve apontar para
 * `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type={{ .Type }}&next={{ .RedirectTo }}`.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") ?? "/";

  if (tokenHash && type) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.verifyOtp({
      type,
      token_hash: tokenHash,
    });

    if (!error) {
      if (data.user) {
        const user = await syncUserFromSupabase(data.user);
        await mergeGuestCartIntoUser(user.id);
      }
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=link_invalido`);
}
