import Link from 'next/link';
import { EyeOff } from 'lucide-react';
import Button from '@atoms/Button/Button';
import Typography from '@atoms/Typography/Typography';
import TagListContainer from '@molecules/TagListContainer/TagLIstContainer';
import { ROUTES } from '@lib/constants/routes';
import { formatDate } from '@lib/date';
import type { Post } from '@models/post.model';

export interface BlogPostCardProps {
  /** Rendered from `excerpt`, never `content` - the index query skips it. */
  post: Post;
  /**
   * Opens the template's confirmation dialog. Supplied only for signed-in
   * authors, so its presence is what renders the control - the card itself
   * never reads the session.
   */
  onUnpublish?: (post: Post) => void;
}

/**
 * One post on the blog index. Authors get "Unpublish" and nothing else -
 * editing happens on the draft, so a live post is taken down first.
 */
const BlogPostCard = (props: BlogPostCardProps) => {
  const { post, onUnpublish } = props;

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

        {onUnpublish && (
          <div className="relative z-10 shrink-0">
            <Button
              label="Unpublish"
              icon={EyeOff}
              onClick={() => onUnpublish(post)}
              buttonAttributes={{ 'aria-label': `Move ${post.title} to drafts` }}
              testId={`unpublish-post-${post.id}`}
            />
          </div>
        )}
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
