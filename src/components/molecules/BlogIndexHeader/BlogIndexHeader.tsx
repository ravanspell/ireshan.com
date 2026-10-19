import { ArrowLeft, LayoutDashboard } from 'lucide-react';
import LinkButton from '@atoms/LinkButton/LinkButton';
import Typography from '@atoms/Typography/Typography';
import { ROUTES } from '@lib/constants/routes';

export interface BlogIndexHeaderProps {
  /** Whether to offer the admin link. The caller owns the session read. */
  showAdminLink?: boolean;
}

/**
 * Blog index heading with its navigation: back to the portfolio, and - for a
 * signed-in author - into the admin panel. Presentational; the link only hides
 * the way in, `/admin/**` is still guarded by middleware.
 */
const BlogIndexHeader = ({ showAdminLink = false }: BlogIndexHeaderProps) => (
  <header className="mb-8 flex flex-col gap-4">
    <nav aria-label="Blog navigation" className="flex items-center justify-between gap-4">
      <LinkButton
        href={ROUTES.HOME}
        label=""
        icon={ArrowLeft}
        ariaLabel="Back to portfolio"
        testId="blog-home-link"
      />
      {/* `/admin` has no page yet, so drafts is the panel's landing view. */}
      {showAdminLink && (
        <LinkButton
          href={ROUTES.ADMIN.DRAFTS}
          label="Admin panel"
          icon={LayoutDashboard}
          testId="blog-admin-link"
        />
      )}
    </nav>
    <Typography variant="h1" as="h1" id="blog-heading" className="text-3xl font-bold" text="Blog" />
  </header>
);

export default BlogIndexHeader;
