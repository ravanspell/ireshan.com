"use server";

import { resolve } from "@/lib/di/container";
import { MediaController } from "@controllers/media.controller";

/**
 * Server Action: Create Upload URL
 *
 * Takes the file's type and size - not the file - and returns a signed URL the
 * browser uploads to directly. `MediaService` enforces authentication and the
 * type/size rules.
 */
export async function createUploadUrlAction(input: { contentType: string; size: number }) {
  const mediaController = resolve(MediaController);

  return mediaController.createUploadUrl(input);
}
