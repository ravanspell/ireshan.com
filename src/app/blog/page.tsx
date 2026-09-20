import { resolve } from '@/lib/di/container';
import { PostController } from '@controllers/post.controller';
import BlogIndex from '@templates/BlogIndex/BlogIndex';

/**
 * Regenerate at most once an hour. Writes call `revalidatePath` here, so
 * publishing shows up immediately - this is only the ceiling for outside changes.
 *
 * Nothing in this tree reads the session on the server: that is what keeps the
 * route static, and why `BlogIndex` resolves it in the browser.
 */
export const revalidate = 3600;

export const metadata = {
  title: 'Blog',
  description: 'Writing on software engineering.',
};

export default async function BlogIndexPage() {
  const result = await resolve(PostController).getPublishedPosts();

  if (!result.success) {
    // Deliberately fatal: the index takes no user input, so the only failure
    // is infrastructure, and a caught error would be cached as an empty blog
    // for a full revalidate window. Throwing fails the build instead, and at
    // runtime ISR keeps serving the last good page.
    throw new Error(`Failed to load blog index: ${result.error ?? 'unknown error'}`);
  }

  return <BlogIndex posts={result.data} />;
}
