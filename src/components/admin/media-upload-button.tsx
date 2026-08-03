"use client";

import { useRef, useState } from "react";
import { Loader2, Upload } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { uploadMedia } from "@/modules/catalog/actions/media.actions";

export function MediaUploadButton({
  resourceType = "image",
  label = "Enviar imagem",
  onUploaded,
}: {
  resourceType?: "image" | "video";
  label?: string;
  onUploaded: (url: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  async function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.set("file", file);

    const result = await uploadMedia(formData, resourceType);
    setIsUploading(false);

    if (result.error || !result.url) {
      toast.error(result.error ?? "Falha ao enviar o arquivo.");
      return;
    }

    onUploaded(result.url);
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept={resourceType === "video" ? "video/*" : "image/*"}
        className="hidden"
        onChange={handleChange}
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={isUploading}
        onClick={() => inputRef.current?.click()}
      >
        {isUploading ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Upload className="size-4" />
        )}
        {label}
      </Button>
    </>
  );
}
