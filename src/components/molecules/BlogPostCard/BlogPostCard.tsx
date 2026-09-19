import Link from 'next/link';
import Typography from '@atoms/Typography/Typography';
import TagListContainer from '@molecules/TagListContainer/TagLIstContainer';
import PostEditLink from '@molecules/PostEditLink/PostEditLink';
import { ROUTES } from '@lib/constants/routes';
import type { Post } from '@models/post.model';

export interface BlogPostCardProps {
  /** Rendered from `excerpt`, never `content` - the index query skips it. */
  post: Post;
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('en', { dateStyle: 'long' }).format(date);
}

/** One post on the blog index, with an edit shortcut for signed-in authors. */
const BlogPostCard = (props: BlogPostCardProps) => {
  const { post } = props;

  return (
    // No panel chrome - `relative` is only here to anchor the link overlay below.
    <article className="group relative flex flex-col gap-y-1" id={`blog-post-card-${post.slug}`}>
      {post.tags.length > 0 && (
        <TagListContainer
          areaLabel={`tags for ${post.title}`}
          tagLabels={post.tags.map((tag) => tag.name)}
          // Leading above the title instead of below the excerpt.
          className="mt-0 mb-1"
        />
      )}

      <div className="flex items-start justify-between gap-4">
        <Typography
          variant="h2"
          as="h2"
          className="text-2xl font-semibold transition-colors duration-300 group-hover:text-primary"
        >
          <Link href={ROUTES.BLOG.POST(post.slug)}>
            {post.title}
            {/* Stretches the link over the card without nesting interactive
                elements inside it. */}
            <span className="absolute inset-0" />
          </Link>
        </Typography>

        <PostEditLink postId={post.id} postTitle={post.title} className="shrink-0" />
      </div>

      {post.publishedAt && (
        <Typography
          variant="caption"
          as="time"
          dateTime={post.publishedAt.toISOString()}
          className="text-muted-foreground block text-sm"
          text={formatDate(post.publishedAt)}
        />
      )}

      {post.excerpt && (
        <Typography as="p" className="text-muted-foreground mt-2" text={post.excerpt} />
      )}
    </article>
  );
};

export default BlogPostCard;
