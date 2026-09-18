import { cache } from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { resolve } from '@/lib/di/container';
import { PostController } from '@controllers/post.controller';
import CMSViewer from '@molecules/CMSViewer/CMSViewer';
import Tag from '@/components/atoms/Tag/Tag';
import ProfileImage from '@/components/molecules/ProfileImage/ProfileImage';

/**
 * Rendered on demand and then cached, rather than prerendered at build time -
 * `generateStaticParams` would make every build require a reachable database.
 * Publishing calls `revalidatePath` on this route, so edits appear at once.
 */
export const revalidate = 3600;

type PageProps = { params: Promise<{ slug: string }> };

/**
 * `generateMetadata` and the page both need the same post, and Next calls them
 * as two separate functions with no way to pass data between them. Next dedupes
 * `fetch()` within a render but not Prisma, so without this the route costs two
 * identical queries. `cache()` memoises for one render pass only - it is not a
 * cross-request cache, so a revalidation still sees fresh data.
 */
const getPost = cache((slug: string) =>
  resolve(PostController).getPublishedPostBySlug(slug),
);

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const result = await getPost(slug);

  if (!result.success) return { title: 'Post not found' };

  return {
    title: result.data.title,
    description: result.data.excerpt ?? undefined,
  };
}

export default async function PostPage({ params }: PageProps) {
  const { slug } = await params;
  const result = await getPost(slug);

  // A draft or a missing slug are the same thing to the public: a 404.
  if (!result.success || !result.data) {
    notFound();
  }

  const post = result.data;

  return (
    <article className="mx-auto max-w-[680] px-4 py-12">
      <h1 className="text-5xl font-bold mb-8 mt-6">{post.title}</h1>
      <div className='flex gap-3 items-center mb-6' >
        <div>
          <ProfileImage
            id="blog-writer"
            src={post.author?.avatarUrl ?? '/images/dp.jpeg'}
          />
        </div>
        <div>
          {post.author?.name && (
            <p className="text-sm font-semibold">{post.author.name}</p>
          )}
        </div>
        <div>
          {post.publishedAt && (
            <time
              dateTime={post.publishedAt.toISOString()}
              className="text-muted-foreground block text-sm"
            >
              {new Intl.DateTimeFormat('en', { dateStyle: 'long' }).format(post.publishedAt)}
            </time>
          )}
        </div>
      </div>

      {post.tags.length > 0 && (
        <div className='flex flex-wrap gap-1.5'>
          {post.tags.map((tag) => (
            <Tag
              key={tag.id}
              label={tag.name}
            />
          ))}
        </div>
      )}

      <div className="mt-10">
        {post.content ? (
          <CMSViewer data={post.content} />
        ) : (
          <p className="text-muted-foreground">This post has no content yet.</p>
        )}
      </div>
    </article>
  );
}
