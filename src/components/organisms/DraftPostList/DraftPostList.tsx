import { FilePlus2 } from 'lucide-react';
import LinkButton from '@atoms/LinkButton/LinkButton';
import Typography from '@atoms/Typography/Typography';
import DraftPostCard from '@molecules/DraftPostCard/DraftPostCard';
import { ROUTES } from '@lib/constants/routes';
import type { Post } from '@models/post.model';

export interface DraftPostListProps {
  /** Unpublished posts, already ordered by the repository (last edited first). */
  drafts: Post[];
}

/** The unfinished posts, or the empty state. */
const DraftPostList = (props: DraftPostListProps) => {
  const { drafts } = props;

  if (drafts.length === 0) {
    return (
      <div
        id="admin-drafts-empty-state"
        className="flex flex-col items-start gap-4 rounded-lg border border-dashed border-border p-8"
      >
        <Typography
          variant="h3"
          as="h2"
          className="text-base font-semibold"
          text="No drafts right now"
        />
        <Typography
          as="p"
          className="text-muted-foreground text-sm"
          text="Everything you have written is published. Start something new and it will wait here until you publish it."
        />
        <LinkButton
          href={ROUTES.ADMIN.EDITOR}
          label="New post"
          icon={FilePlus2}
          variant="primary"
          testId="drafts-empty-new-post"
        />
      </div>
    );
  }

  return (
    <ul id="admin-draft-list" className="flex flex-col gap-4" aria-label="Draft posts">
      {drafts.map((draft) => (
        <li key={draft.id}>
          <DraftPostCard post={draft} />
        </li>
      ))}
    </ul>
  );
};

export default DraftPostList;
