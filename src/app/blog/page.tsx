import Link from 'next/link';
import { resolve } from '@/lib/di/container';
import { PostController } from '@controllers/post.controller';
import { ROUTES } from '@lib/constants/routes';

/**
 * Regenerate at most once an hour. Writes call `revalidatePath` on this route,
 * so publishing shows up immediately - this is only the ceiling for changes
 * that happen outside the app.
 */
export const revalidate = 3600;

export const metadata = {
  title: 'Blog',
  description: 'Writing on software engineering.',
};

function formatDate(date: Date | null) {
  if (!date) return null;
  return new Intl.DateTimeFormat('en', { dateStyle: 'long' }).format(date);
}

export default async function BlogIndexPage() {
  const result = await resolve(PostController).getPublishedPosts();

  if (!result.success) {
    // Deliberately fatal. The only way this fails is infrastructure - the index
    // takes no user input - and a caught error here would be prerendered and
    // then cached as an empty blog for a full revalidate window. Throwing fails
    // the build instead, and at runtime ISR keeps serving the last good page.
    throw new Error(`Failed to load blog index: ${result.error ?? 'unknown error'}`);
  }

  const posts = result.data;

  return (
    <main className="mx-auto mt-10 max-w-2xl px-4">
      <h1 className="mb-8 text-3xl font-bold">Blog</h1>

      {posts.length === 0 ? (
        <p className="text-muted-foreground">No posts published yet.</p>
      ) : (
        <ul className="space-y-8">
          {posts.map((post) => (
            <li key={post.id}>
              <article>
                <Link href={ROUTES.BLOG.POST(post.slug)} className="group">
                  <h2 className="text-xl font-semibold group-hover:underline">{post.title}</h2>
                </Link>

                {post.publishedAt && (
                  <time
                    dateTime={post.publishedAt.toISOString()}
                    className="text-muted-foreground mt-1 block text-sm"
                  >
                    {formatDate(post.publishedAt)}
                  </time>
                )}

                {post.excerpt && <p className="text-muted-foreground mt-2">{post.excerpt}</p>}

                {post.tags.length > 0 && (
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                      <li
                        key={tag.id}
                        className="bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-xs"
                      >
                        {tag.name}
                      </li>
                    ))}
                  </ul>
                )}
              </article>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
