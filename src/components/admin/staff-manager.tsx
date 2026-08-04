"use client";

import { useState, useTransition } from "react";
import { Loader2, Search } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  findUserByEmail,
  updateUserRole,
} from "@/modules/team/actions/team.actions";
import { roleValues } from "@/modules/team/schemas/team.schema";
import type { Role, User } from "@/generated/prisma/client";

const ROLE_LABELS: Record<Role, string> = {
  CUSTOMER: "Cliente",
  STAFF: "Equipe (staff)",
  ADMIN: "Administrador",
};

type StaffUser = Pick<User, "id" | "name" | "email" | "role">;
type FoundUser = { id: string; name: string; email: string; role: Role };

function RoleRow({
  user,
  currentUserId,
  onChanged,
}: {
  user: StaffUser | FoundUser;
  currentUserId: string;
  onChanged: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [role, setRole] = useState<Role>(user.role);
  const isSelf = user.id === currentUserId;

  function handleSave(nextRole: Role) {
    setRole(nextRole);
    startTransition(async () => {
      const result = await updateUserRole({ userId: user.id, role: nextRole });
      if (result.error) {
        toast.error(result.error);
        setRole(user.role);
      } else {
        toast.success("Permissão atualizada.");
        onChanged();
      }
    });
  }

  return (
    <TableRow>
      <TableCell>
        <div className="font-medium">{user.name}</div>
        <div className="text-xs text-muted-foreground">{user.email}</div>
      </TableCell>
      <TableCell>
        {isSelf ? (
          <Badge variant="outline">{ROLE_LABELS[role]} (você)</Badge>
        ) : (
          <Select
            value={role}
            disabled={isPending}
            onValueChange={(value) => handleSave(value as Role)}
          >
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {roleValues.map((value) => (
                <SelectItem key={value} value={value}>
                  {ROLE_LABELS[value]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </TableCell>
      <TableCell className="w-8">
        {isPending && <Loader2 className="size-4 animate-spin" />}
      </TableCell>
    </TableRow>
  );
}

export function StaffManager({
  staff,
  currentUserId,
}: {
  staff: StaffUser[];
  currentUserId: string;
}) {
  const [email, setEmail] = useState("");
  const [foundUser, setFoundUser] = useState<FoundUser | null>(null);
  const [isSearching, startSearch] = useTransition();
  const [refreshKey, setRefreshKey] = useState(0);

  function handleSearch() {
    setFoundUser(null);
    startSearch(async () => {
      const result = await findUserByEmail({ email });
      if (result.error) {
        toast.error(result.error);
        return;
      }
      if (result.user) setFoundUser(result.user);
    });
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold">Equipe</h1>
        <p className="text-sm text-muted-foreground">
          Conceda acesso de administrador ou equipe a quem já tem conta na loja.
          Cada pessoa faz login com o próprio e-mail — não existe login
          compartilhado.
        </p>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold">Buscar pessoa por e-mail</h2>
        <div className="flex gap-2">
          <Input
            type="email"
            placeholder="socio@exemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="max-w-sm"
          />
          <Button onClick={handleSearch} disabled={isSearching}>
            {isSearching ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Search className="size-4" />
            )}
            Buscar
          </Button>
        </div>

        {foundUser && (
          <div className="mt-4 max-w-md">
            <Table>
              <TableBody>
                <RoleRow
                  key={`${foundUser.id}-${refreshKey}`}
                  user={foundUser}
                  currentUserId={currentUserId}
                  onChanged={() => setRefreshKey((k) => k + 1)}
                />
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold">
          Quem já tem acesso ({staff.length})
        </h2>
        {staff.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nenhuma conta com acesso de equipe/admin ainda.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pessoa</TableHead>
                <TableHead>Permissão</TableHead>
                <TableHead className="w-8" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {staff.map((user) => (
                <RoleRow
                  key={`${user.id}-${refreshKey}`}
                  user={user}
                  currentUserId={currentUserId}
                  onChanged={() => setRefreshKey((k) => k + 1)}
                />
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
