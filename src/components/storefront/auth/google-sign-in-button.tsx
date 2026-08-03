"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export function GoogleSignInButton() {
  const [isLoading, setIsLoading] = useState(false);

  async function handleClick() {
    setIsLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      toast.error("Não foi possível conectar com o Google.");
      setIsLoading(false);
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      className="w-full"
      disabled={isLoading}
      onClick={handleClick}
    >
      <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
        <path
          fill="#4285F4"
          d="M23.52 12.27c0-.82-.07-1.42-.22-2.05H12v3.72h6.6c-.13 1.1-.85 2.75-2.45 3.86l-.02.15 3.56 2.76.25.02c2.26-2.09 3.58-5.17 3.58-8.46"
        />
        <path
          fill="#34A853"
          d="M12 24c3.24 0 5.95-1.07 7.93-2.9l-3.78-2.93c-1.01.7-2.37 1.19-4.15 1.19-3.17 0-5.86-2.09-6.82-4.98l-.14.01-3.7 2.87-.05.13C3.25 21.3 7.28 24 12 24"
        />
        <path
          fill="#FBBC05"
          d="M5.18 14.38A7.4 7.4 0 0 1 4.77 12c0-.83.15-1.63.4-2.38l-.01-.16-3.75-2.91-.12.06A12 12 0 0 0 0 12c0 1.93.47 3.76 1.29 5.38z"
        />
        <path
          fill="#EA4335"
          d="M12 4.75c2.26 0 3.79.97 4.66 1.79l3.4-3.32C17.94 1.19 15.24 0 12 0 7.28 0 3.25 2.7 1.29 6.62l3.88 3.01C6.14 6.84 8.83 4.75 12 4.75"
        />
      </svg>
      Entrar com Google
    </Button>
  );
}
