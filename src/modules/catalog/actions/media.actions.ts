"use server";

import { cloudinary } from "@/lib/cloudinary";
import { requireAdminUser } from "@/modules/auth/services/require-admin";

type UploadResult = { url?: string; error?: string };

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const MAX_VIDEO_BYTES = 100 * 1024 * 1024;

function uploadBuffer(
  buffer: Buffer,
  resourceType: "image" | "video",
): Promise<string> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { resource_type: resourceType, folder: "bk-imports" },
      (error, result) => {
        if (error || !result) {
          reject(error ?? new Error("Falha no upload."));
          return;
        }
        resolve(result.secure_url);
      },
    );
    uploadStream.end(buffer);
  });
}

/**
 * Recebe um arquivo via FormData (campo "file") e envia ao Cloudinary.
 * Usado pelos formulários de categoria e produto (fotos/vídeos ilimitados).
 */
export async function uploadMedia(
  formData: FormData,
  resourceType: "image" | "video" = "image",
): Promise<UploadResult> {
  await requireAdminUser();

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return { error: "Nenhum arquivo enviado." };
  }

  const maxBytes = resourceType === "video" ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES;
  if (file.size > maxBytes) {
    return { error: "Arquivo muito grande." };
  }

  const expectedPrefix = resourceType === "video" ? "video/" : "image/";
  if (!file.type.startsWith(expectedPrefix)) {
    return { error: `Envie um arquivo de ${resourceType === "video" ? "vídeo" : "imagem"} válido.` };
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const url = await uploadBuffer(buffer, resourceType);
    return { url };
  } catch {
    return { error: "Falha ao enviar o arquivo para o Cloudinary." };
  }
}
