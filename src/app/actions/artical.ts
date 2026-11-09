'use server';

import { postController } from '@lib/composition';

/**
 * Server Action: Save Article
 *
 * Creates the post on first save and updates it on every save after, so the
 * editor can keep calling one action.
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
  return postController.upsertPost(input);
}

/**
 * Server Action: Unpublish Article - Moves a published post back to draft.
 */
export async function unpublishPostAction(id: string) {
  return postController.unpublishPost(id);
}

/**
 * Server Action: Delete Draft - Permanently deletes an unpublished post
 */
export async function deleteDraftAction(id: string) {
  return postController.deleteDraft(id);
}
