"use server";

import { resolve } from "@/lib/di/container";
import { PostController } from "@controllers/post.controller";

/**
 * Server Action: Save Article
 *
 * Creates the post on first save and updates it on every save after, so the
 * editor can keep calling one action.
 *
 * Authentication is not checked here: `PostService` enforces it at the write
 * itself, so every path into the mutation is covered rather than just this one.
 * Input is validated by `upsertPostSchema` inside the controller.
 */
export async function saveArticleAction(input: {
  id?: string;
  title: string;
  slug: string;
  content: unknown;
  published?: boolean;
  /** Names, not ids - missing tags are created as part of the save. */
  tagNames?: string[];
}) {
  const postController = resolve(PostController);

  return postController.upsertPost(input);
}
