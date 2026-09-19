import Link from 'next/link';
import { SquarePen } from 'lucide-react';
import Card from '@atoms/Card/Card';
import Typography from '@atoms/Typography/Typography';
import TagListContainer from '@molecules/TagListContainer/TagLIstContainer';
import { ROUTES } from '@lib/constants/routes';
import { formatDateTime } from '@lib/date';
import type { Post } from '@models/post.model';

export interface DraftPostCardProps {
  /** An unpublished post. Rendered from `excerpt` - the drafts query skips `content`. */
  post: Post;
}

/**
 * One unfinished post on the drafts list. The whole card is a single link into
 * the editor - a title link plus an "edit" button would share one target.
 */
const DraftPostCard = (props: DraftPostCardProps) => {
  const { post } = props;

  return (
    <Card id={`draft-post-card-${post.id}`} className="group/draft">
      <article className="flex flex-col gap-y-2">
        <div className="flex items-start justify-between gap-4">
          <Typography
            variant="h2"
            as="h2"
            className="text-lg font-semibold transition-colors duration-300 group-hover/draft:text-primary"
          >
            <Link href={ROUTES.ADMIN.EDIT_POST(post.id)}>
              {post.title || 'Untitled draft'}
              {/* Stretches the link over the card without nesting interactive
                  elements inside it. */}
              <span className="absolute inset-0" />
            </Link>
          </Typography>

          <SquarePen
            className="text-muted-foreground size-4 shrink-0 transition-colors duration-300 group-hover/draft:text-primary"
            aria-hidden="true"
          />
        </div>

        <div className="text-muted-foreground flex flex-wrap items-center gap-x-2 text-xs">
          <Typography
            variant="caption"
            as="time"
            dateTime={post.updatedAt.toISOString()}
            // `updatedAt`, not `createdAt` - and how the list is ordered.
            text={`Edited ${formatDateTime(post.updatedAt)}`}
          />
          <span aria-hidden="true">·</span>
          <Typography variant="caption" as="code" className="font-mono" text={`/${post.slug}`} />
        </div>

        <Typography
          as="p"
          className={post.excerpt ? 'text-muted-foreground' : 'text-muted-foreground italic'}
          text={post.excerpt || 'No content yet.'}
        />

        {post.tags.length > 0 && (
          <TagListContainer
            areaLabel={`tags for ${post.title || post.slug}`}
            tagLabels={post.tags.map((tag) => tag.name)}
            className="mt-0"
          />
        )}
      </article>
    </Card>
  );
};

export default DraftPostCard;
