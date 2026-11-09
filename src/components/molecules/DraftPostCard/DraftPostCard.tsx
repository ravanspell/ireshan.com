import { SquarePen, Trash2 } from 'lucide-react';
import Card from '@atoms/Card/Card';
import Typography from '@atoms/Typography/Typography';
import ActionMenu, { type ActionMenuItem } from '@molecules/ActionMenu/ActionMenu';
import TagListContainer from '@molecules/TagListContainer/TagLIstContainer';
import { ROUTES } from '@lib/constants/routes';
import { formatDateTime } from '@lib/date';
import type { Post } from '@modules/post/post.model';

export interface DraftPostCardProps {
  /** An unpublished post. Rendered from `excerpt` - the drafts query skips `content`. */
  post: Post;
  /** Opens the delete confirmation. Omit to hide "Delete draft". */
  onDelete?: (post: Post) => void;
}

/** One draft on the drafts list. The card isn't clickable; its actions are in the menu. */
const DraftPostCard = (props: DraftPostCardProps) => {
  const { post, onDelete } = props;
  const name = post.title || 'untitled draft';

  const actions: ActionMenuItem[] = [
    {
      label: 'Edit draft',
      icon: SquarePen,
      href: ROUTES.ADMIN.EDIT_POST(post.id),
      testId: `draft-edit-${post.id}`,
    },
    ...(onDelete
      ? [
          {
            label: 'Delete draft',
            icon: Trash2,
            variant: 'destructive' as const,
            onSelect: () => onDelete(post),
            testId: `draft-delete-${post.id}`,
          },
        ]
      : []),
  ];

  return (
    <Card id={`draft-post-card-${post.id}`} interactive={false}>
      <article className="flex flex-col gap-y-2">
        <div className="flex items-start justify-between gap-4">
          <Typography
            variant="h2"
            as="h2"
            className="min-w-0 text-lg font-semibold wrap-break-word"
            text={post.title || 'Untitled draft'}
          />

          <ActionMenu
            label={`Actions for ${name}`}
            items={actions}
            className="-mt-1 -mr-2 shrink-0"
            testId={`draft-actions-${post.id}`}
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
