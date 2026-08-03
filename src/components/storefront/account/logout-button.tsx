"use client";

import { LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import { signOut } from "@/modules/auth/actions/auth.actions";

export function LogoutButton() {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => signOut()}
      className="justify-start text-muted-foreground hover:text-destructive"
    >
      <LogOut />
      Sair
    </Button>
  );
}
