import { SquarePen } from 'lucide-react';
import Card from '@atoms/Card/Card';
import LinkButton from '@atoms/LinkButton/LinkButton';
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
 * One unfinished post on the drafts list. The card is inert - the only way into
 * the editor is the explicit "Edit" button, so nothing navigates by accident.
 */
const DraftPostCard = (props: DraftPostCardProps) => {
  const { post } = props;

  return (
    <Card id={`draft-post-card-${post.id}`} interactive={false}>
      <article className="flex flex-col gap-y-2">
        <div className="flex items-start justify-between gap-4">
          <Typography
            variant="h2"
            as="h2"
            className="text-lg font-semibold"
            text={post.title || 'Untitled draft'}
          />

          <LinkButton
            href={ROUTES.ADMIN.EDIT_POST(post.id)}
            label="Edit"
            icon={SquarePen}
            ariaLabel={`Edit ${post.title || 'untitled draft'}`}
            className="shrink-0"
            testId={`draft-edit-${post.id}`}
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
