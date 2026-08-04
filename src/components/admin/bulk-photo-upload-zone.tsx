"use client";

import { useRef, useState } from "react";
import { CheckCircle2, Loader2, Upload, XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { slugify } from "@/lib/slugify";
import { attachDraftProductImage } from "@/modules/catalog/actions/product.actions";
import { uploadMedia } from "@/modules/catalog/actions/media.actions";

type FileResult = {
  fileName: string;
  status: "uploading" | "matched" | "error";
  message: string;
};

function stripExtension(fileName: string) {
  return fileName.replace(/\.[^./]+$/, "");
}

export function BulkPhotoUploadZone() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<FileResult[]>([]);

  async function processFiles(fileList: FileList) {
    const files = Array.from(fileList).filter((f) => f.type.startsWith("image/"));
    if (files.length === 0) return;

    setIsProcessing(true);
    setResults(files.map((f) => ({ fileName: f.name, status: "uploading", message: "Enviando..." })));

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const teamSlug = slugify(stripExtension(file.name));

      const formData = new FormData();
      formData.set("file", file);
      const uploadResult = await uploadMedia(formData, "image");

      if (uploadResult.error || !uploadResult.url) {
        setResults((prev) =>
          prev.map((r, idx) =>
            idx === i
              ? { ...r, status: "error", message: uploadResult.error ?? "Falha no envio." }
              : r,
          ),
        );
        continue;
      }

      const attachResult = await attachDraftProductImage(teamSlug, uploadResult.url);

      setResults((prev) =>
        prev.map((r, idx) =>
          idx === i
            ? attachResult.matched
              ? { ...r, status: "matched", message: `Anexada a "${attachResult.productName}"` }
              : { ...r, status: "error", message: attachResult.error ?? "Não encontrado." }
            : r,
        ),
      );
    }

    setIsProcessing(false);
  }

  return (
    <div className="space-y-4">
      <div
        className={cn(
          "flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed p-10 text-center transition-colors",
          isDragging ? "border-primary bg-primary/5" : "border-border",
        )}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          if (e.dataTransfer.files.length > 0) {
            void processFiles(e.dataTransfer.files);
          }
        }}
      >
        <Upload className="size-8 text-muted-foreground" />
        <p className="text-sm">
          Arraste as fotos aqui — o nome do arquivo precisa ser o nome do time
          (ex.: <code className="rounded bg-muted px-1">real-madrid.jpg</code>,{" "}
          <code className="rounded bg-muted px-1">flamengo.png</code>).
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files) void processFiles(e.target.files);
            e.target.value = "";
          }}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isProcessing}
          onClick={() => inputRef.current?.click()}
        >
          Ou selecione os arquivos
        </Button>
      </div>

      {results.length > 0 && (
        <div className="max-h-96 space-y-1 overflow-y-auto rounded-md border border-border p-3">
          {results.map((r, index) => (
            <div key={`${r.fileName}-${index}`} className="flex items-center gap-2 text-sm">
              {r.status === "uploading" && (
                <Loader2 className="size-4 shrink-0 animate-spin text-muted-foreground" />
              )}
              {r.status === "matched" && (
                <CheckCircle2 className="size-4 shrink-0 text-emerald-500" />
              )}
              {r.status === "error" && (
                <XCircle className="size-4 shrink-0 text-destructive" />
              )}
              <span className="font-medium">{r.fileName}</span>
              <span className="text-muted-foreground">— {r.message}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
