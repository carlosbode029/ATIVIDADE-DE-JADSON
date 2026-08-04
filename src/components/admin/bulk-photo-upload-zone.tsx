"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, Trash2, Upload, XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { slugify } from "@/lib/slugify";
import { attachProductImageByTeamId } from "@/modules/catalog/actions/product.actions";
import { uploadMedia } from "@/modules/catalog/actions/media.actions";

type TeamOption = { id: string; name: string; slug: string };

type Status = "pending" | "uploading" | "done" | "error";

type PendingImage = {
  id: string;
  file: File;
  previewUrl: string;
  teamId: string;
  status: Status;
  message: string;
};

function stripExtension(fileName: string) {
  return fileName.replace(/\.[^./]+$/, "");
}

export function BulkPhotoUploadZone({ teams }: { teams: TeamOption[] }) {
  const [items, setItems] = useState<PendingImage[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isSending, setIsSending] = useState(false);

  function addFiles(fileList: FileList) {
    const files = Array.from(fileList).filter((f) => f.type.startsWith("image/"));
    const newItems: PendingImage[] = files.map((file) => {
      const guessedSlug = slugify(stripExtension(file.name));
      const match = teams.find((t) => t.slug === guessedSlug);
      return {
        id: `${file.name}-${file.size}-${Math.random().toString(36).slice(2)}`,
        file,
        previewUrl: URL.createObjectURL(file),
        teamId: match?.id ?? "",
        status: "pending",
        message: match ? `Identificado: ${match.name}` : "Selecione o time",
      };
    });
    setItems((prev) => [...prev, ...newItems]);
  }

  function updateTeam(id: string, teamId: string) {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, teamId, message: "" } : it)),
    );
  }

  function removeItem(id: string) {
    setItems((prev) => prev.filter((it) => it.id !== id));
  }

  async function sendAll() {
    setIsSending(true);

    for (const item of items) {
      if (!item.teamId || item.status === "done") continue;

      setItems((prev) =>
        prev.map((it) =>
          it.id === item.id ? { ...it, status: "uploading", message: "Enviando..." } : it,
        ),
      );

      const formData = new FormData();
      formData.set("file", item.file);
      const uploadResult = await uploadMedia(formData, "image");

      if (uploadResult.error || !uploadResult.url) {
        setItems((prev) =>
          prev.map((it) =>
            it.id === item.id
              ? { ...it, status: "error", message: uploadResult.error ?? "Falha no envio." }
              : it,
          ),
        );
        continue;
      }

      const attachResult = await attachProductImageByTeamId(item.teamId, uploadResult.url);

      setItems((prev) =>
        prev.map((it) =>
          it.id === item.id
            ? attachResult.matched
              ? { ...it, status: "done", message: `Anexada a "${attachResult.productName}"` }
              : { ...it, status: "error", message: attachResult.error ?? "Erro ao anexar." }
            : it,
        ),
      );
    }

    setIsSending(false);
  }

  const pendingWithoutTeam = items.filter((it) => !it.teamId && it.status === "pending").length;
  const readyToSend = items.some((it) => it.teamId && it.status !== "done");

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
          if (e.dataTransfer.files.length > 0) addFiles(e.dataTransfer.files);
        }}
      >
        <Upload className="size-8 text-muted-foreground" />
        <p className="text-sm">
          Arraste quantas fotos quiser (o nome do arquivo não importa — você
          escolhe o time de cada uma na lista abaixo).
        </p>
        <label>
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => {
              if (e.target.files) addFiles(e.target.files);
              e.target.value = "";
            }}
          />
          <Button type="button" variant="outline" size="sm" asChild>
            <span>Ou selecione os arquivos</span>
          </Button>
        </label>
      </div>

      {items.length > 0 && (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {items.length} foto(s){" "}
              {pendingWithoutTeam > 0 && `— ${pendingWithoutTeam} sem time selecionado`}
            </p>
            <Button
              type="button"
              variant="gold"
              size="sm"
              disabled={isSending || !readyToSend}
              onClick={sendAll}
            >
              {isSending && <Loader2 className="size-4 animate-spin" />}
              Enviar tudo
            </Button>
          </div>

          <div className="max-h-[32rem] space-y-2 overflow-y-auto rounded-md border border-border p-3">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 rounded-md border border-border p-2"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.previewUrl}
                  alt=""
                  className="size-14 shrink-0 rounded object-cover"
                />
                <div className="min-w-0 flex-1 space-y-1">
                  <p className="truncate text-xs text-muted-foreground">{item.file.name}</p>
                  <Select
                    value={item.teamId}
                    onValueChange={(value) => updateTeam(item.id, value)}
                    disabled={item.status === "uploading" || item.status === "done"}
                  >
                    <SelectTrigger size="sm" className="w-full max-w-xs">
                      <SelectValue placeholder="Selecione o time" />
                    </SelectTrigger>
                    <SelectContent>
                      {teams.map((team) => (
                        <SelectItem key={team.id} value={team.id}>
                          {team.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex w-40 shrink-0 items-center gap-1 text-xs">
                  {item.status === "uploading" && (
                    <Loader2 className="size-4 shrink-0 animate-spin text-muted-foreground" />
                  )}
                  {item.status === "done" && (
                    <CheckCircle2 className="size-4 shrink-0 text-emerald-500" />
                  )}
                  {item.status === "error" && (
                    <XCircle className="size-4 shrink-0 text-destructive" />
                  )}
                  <span className="truncate text-muted-foreground">{item.message}</span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={item.status === "uploading"}
                  onClick={() => removeItem(item.id)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
