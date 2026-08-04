import type { Metadata } from "next";

import { BulkPhotoUploadZone } from "@/components/admin/bulk-photo-upload-zone";

export const metadata: Metadata = {
  title: "Fotos em massa",
};

export default function FotosEmMassaPage() {
  return (
    <div>
      <h1 className="mb-2 font-display text-2xl font-bold">
        Fotos em massa
      </h1>
      <p className="mb-6 max-w-2xl text-sm text-muted-foreground">
        Arraste várias fotos de uma vez. O sistema identifica o produto pelo{" "}
        <strong>nome do arquivo</strong> — ele precisa ser o nome do time
        (sem acento tanto faz, mas o nome tem que bater, ex.:{" "}
        <code className="rounded bg-muted px-1">real-madrid.jpg</code> ou{" "}
        <code className="rounded bg-muted px-1">Real Madrid.png</code> pro
        time Real Madrid). Cada foto é enviada e anexada automaticamente ao
        rascunho daquele time, sem precisar abrir o produto um por um.
      </p>
      <BulkPhotoUploadZone />
    </div>
  );
}
