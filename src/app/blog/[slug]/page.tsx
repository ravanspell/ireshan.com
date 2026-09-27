import { cache } from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { resolve } from '@/lib/di/container';
import { PostController } from '@controllers/post.controller';
import { formatDate } from '@lib/date';
import CMSViewer from '@molecules/CMSViewer/CMSViewer';
import Tag from '@/components/atoms/Tag/Tag';
import ProfileImage from '@/components/molecules/ProfileImage/ProfileImage';
import TableOfContents from '@molecules/TableOfContents/TableOfContents';
import { extractHeadings, toTocEntries } from '@lib/editor-content';
import { cn } from '@/lib/utils';

/**
 * Rendered on demand and then cached, rather than prerendered at build time -
 * `generateStaticParams` would make every build require a reachable database.
 * Publishing calls `revalidatePath` on this route, so edits appear at once.
 */
export const revalidate = 3600;

type PageProps = { params: Promise<{ slug: string }> };

/**
 * Layout when the post has a table of contents (sticky, level with the title):
 * - xl+: equal gutters keep the article centred; the TOC fills the right one.
 * - md-xl: two columns, as the gutters are too narrow for it.
 * - phones: stacked, TOC first.
 */
const WITH_TOC = {
  page: [
    'md:grid md:grid-cols-[minmax(0,1fr)_13rem] md:gap-2.5',
    'xl:grid-cols-[minmax(14rem,1fr)_minmax(0,56rem)_minmax(14rem,1fr)] xl:gap-3',
  ],
  article: 'xl:col-start-2',
  aside: [
    'order-first mb-8',
    'md:order-none md:mb-0 md:mt-6 md:self-start',
    'md:sticky md:top-12 md:max-h-[calc(100vh-6rem)] md:overflow-y-auto',
    'xl:col-start-3 xl:row-start-1 xl:max-w-64',
  ],
};

/**
 * `generateMetadata` and the page both need the same post, and Next calls them
 * as two separate functions with no way to pass data between them. Next dedupes
 * `fetch()` within a render but not Prisma, so without this the route costs two
 * identical queries. `cache()` memoises for one render pass only - it is not a
 * cross-request cache, so a revalidation still sees fresh data.
 */
const getPost = cache((slug: string) => resolve(PostController).getPublishedPostBySlug(slug));

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
  const headings = post.content ? extractHeadings(post.content) : [];
  const tocEntries = toTocEntries(headings);
  const hasToc = tocEntries.length > 0;

  return (
    <div className={cn('flex flex-col px-4 py-12', hasToc && WITH_TOC.page)}>
      <article className={cn('min-w-0', hasToc ? WITH_TOC.article : 'mx-auto w-full max-w-4xl')}>
        <h1 className="text-5xl font-bold mb-8 mt-6">{post.title}</h1>
        <div className="flex gap-3 items-center mb-6">
          <div>
            <ProfileImage id="blog-writer" src={post.author?.avatarUrl ?? '/images/dp.jpeg'} />
          </div>
          <div>
            {post.author?.name && <p className="text-sm font-semibold">{post.author.name}</p>}
          </div>
          <div>
            {post.publishedAt && (
              <time
                dateTime={post.publishedAt.toISOString()}
                className="text-muted-foreground block text-sm"
              >
                {formatDate(post.publishedAt)}
              </time>
            )}
          </div>
        </div>

        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {post.tags.map((tag) => (
              <Tag key={tag.id} label={tag.name} />
            ))}
          </div>
        )}

        <div className="mt-10">
          {post.content ? (
            <CMSViewer data={post.content} headingIds={headings.map((h) => h.id)} />
          ) : (
            <p className="text-muted-foreground">This post has no content yet.</p>
          )}
        </div>
      </article>

      {hasToc && (
        <aside className={cn(WITH_TOC.aside)}>
          <TableOfContents entries={tocEntries} />
        </aside>
      )}
    </div>
  );
}
