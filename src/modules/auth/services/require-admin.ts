import { getCurrentUser } from "@/modules/auth/queries/get-current-user";

/**
 * Guarda de autorização para Server Actions administrativas. O middleware já
 * bloqueia o acesso às rotas de `/admin`, mas Server Actions são endpoints
 * próprios — cada mutação sensível revalida a role aqui também.
 */
export async function requireAdminUser() {
  const user = await getCurrentUser();

  if (!user || (user.role !== "ADMIN" && user.role !== "STAFF")) {
    throw new Error("Acesso restrito a administradores.");
  }

  return user;
}
