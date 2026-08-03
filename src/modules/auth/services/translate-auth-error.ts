const KNOWN_MESSAGES: Record<string, string> = {
  "Invalid login credentials": "E-mail ou senha inválidos.",
  "Email not confirmed": "Confirme seu e-mail antes de entrar.",
  "User already registered": "Já existe uma conta com este e-mail.",
  "Password should be at least 6 characters":
    "A senha precisa ter no mínimo 6 caracteres.",
};

export function translateAuthError(message: string): string {
  if (KNOWN_MESSAGES[message]) {
    return KNOWN_MESSAGES[message];
  }

  if (message.toLowerCase().includes("rate limit")) {
    return "Muitas tentativas em pouco tempo. Aguarde alguns instantes.";
  }

  return "Não foi possível concluir a operação. Tente novamente.";
}
