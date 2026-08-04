import type { Metadata } from "next";

import { BulkPhotoUploadZone } from "@/components/admin/bulk-photo-upload-zone";
import { listTeams } from "@/modules/catalog/queries/reference-data.queries";

export const metadata: Metadata = {
  title: "Fotos em massa",
};

export default async function FotosEmMassaPage() {
  const teams = await listTeams();

  return (
    <div>
      <h1 className="mb-2 font-display text-2xl font-bold">
        Fotos em massa
      </h1>
      <p className="mb-6 max-w-2xl text-sm text-muted-foreground">
        Arraste (ou selecione) quantas fotos quiser, direto de onde elas
        estiverem — não precisa renomear nada. Pra cada foto, escolha o time
        na lista (o sistema já tenta adivinhar pelo nome do arquivo, mas
        você pode trocar). Depois clica em <strong>Enviar tudo</strong> e o
        sistema sobe cada uma e anexa ao produto certo, sem precisar abrir
        um por um.
      </p>
      <BulkPhotoUploadZone
        teams={teams.map((t) => ({ id: t.id, name: t.name, slug: t.slug }))}
      />
    </div>
  );
}
