'use server';

import { resolve } from '@/lib/di/container';
import { PostController } from '@controllers/post.controller';

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

/**
 * Server Action: Unpublish Article
 *
 * Moves a published post back to draft. Called from the public blog index, so
 * it is reachable without a session: `PostService` rejects the write, as it
 * does for `saveArticleAction`. Hiding the button is tidiness, not a control.
 */
export async function unpublishPostAction(id: string) {
  const postController = resolve(PostController);

  return postController.unpublishPost(id);
}
