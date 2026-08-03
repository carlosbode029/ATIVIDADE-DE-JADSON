import { createClient } from "@supabase/supabase-js";

/**
 * Cliente com service role — ignora RLS. Uso restrito a Server Actions e
 * route handlers que já validaram a autorização do chamador (ex.: promover
 * um usuário a STAFF/ADMIN). Nunca importar em código que roda no browser.
 */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}
