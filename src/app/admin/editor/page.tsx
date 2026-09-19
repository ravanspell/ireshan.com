import { notFound } from 'next/navigation';
import BlogEditorTemplate from '@templates/BlogEditor/BlogEditorTemplate';
import { resolve } from '@/lib/di/container';
import { PostController } from '@controllers/post.controller';
import { TagController } from '@controllers/tag.controller';

/**
 * Every existing tag, for the editor's autocomplete. A failure here is not
 * worth losing the editor over - the field still accepts free text, so an
 * empty suggestion list only costs the author a shortcut.
 */
async function getTagSuggestions(): Promise<string[]> {
  const result = await resolve(TagController).getAllTags();

  return result.success ? result.data.map((tag) => tag.name) : [];
}

/**
 * Editor page.
 *
 * A Server Component so an existing post can be loaded before render - the only
 * client-side piece is the editor itself. `?id=` switches it from "new post" to
 * editing an existing one; without it, a blank draft.
 */
export default async function EditorPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id } = await searchParams;

  if (!id) {
    return <BlogEditorTemplate tagSuggestions={await getTagSuggestions()} />;
  }

  // Drafts included - this read requires a session, which middleware has
  // already enforced for /admin, and PostService re-checks regardless.
  const [result, tagSuggestions] = await Promise.all([
    resolve(PostController).getPostById(id),
    getTagSuggestions(),
  ]);

  if (!result.success || !result.data) {
    notFound();
  }

  const post = result.data;

  return (
    <BlogEditorTemplate
      articleId={post.id}
      initialTitle={post.title}
      initialSlug={post.slug}
      initialPublished={post.published}
      initialTags={post.tags.map((tag) => tag.name)}
      tagSuggestions={tagSuggestions}
      initialData={post.content}
    />
  );
}
