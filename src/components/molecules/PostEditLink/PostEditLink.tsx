'use client';

import Link from 'next/link';
import { SquarePen } from 'lucide-react';
import { ROUTES } from '@lib/constants/routes';
import useIsAuthenticated from '@hooks/useIsAuthenticated';

export interface PostEditLinkProps {
  postId: string;
  /** Disambiguates the action for screen readers. */
  postTitle: string;
  className?: string;
}

/**
 * "Edit" affordance on a public post, for signed-in authors only. Renders
 * nothing while the check is in flight, so the page never flashes a control it
 * is about to remove.
 *
 * Cheap to repeat down a list - N of these share one `getUser()`.
 *
 * Cosmetic: `/admin/editor` is middleware-gated and `PostService` re-checks the
 * session on save.
 */
const PostEditLink = (props: PostEditLinkProps) => {
  const { postId, postTitle, className = '' } = props;
  const isAuthenticated = useIsAuthenticated();

  if (!isAuthenticated) return null;

  return (
    <Link
      href={ROUTES.ADMIN.EDIT_POST(postId)}
      // `relative z-10` lifts it above the card's link overlay, which would
      // otherwise swallow the click.
      className={`${className}
        relative
        z-10
        inline-flex
        w-max
        items-center
        gap-1.5
        rounded-md
        border
        border-border
        bg-secondary
        px-2.5
        py-1
        text-xs
        text-foreground
        outline-0
        transition-colors
        duration-300
        hover:border-border-stronger
        hover:bg-accent
        hover:text-primary
        focus-visible:outline-4
        focus-visible:outline-offset-1
        focus-visible:outline-ring`}
      aria-label={`Edit ${postTitle}`}
      data-testid={`edit-post-${postId}`}
    >
      <SquarePen className="size-[1em]" aria-hidden="true" />
      Edit
    </Link>
  );
};

export default PostEditLink;
