import { redirect } from 'next/navigation';
import AdminDraftsTemplate from '@templates/AdminDrafts/AdminDraftsTemplate';
import { resolve } from '@/lib/di/container';
import { PostController } from '@controllers/post.controller';
import { ROUTES } from '@lib/constants/routes';

export const metadata = {
  title: 'Drafts',
};

/**
 * Drafts page. Dynamic, because `getDraftPosts` reads the session - and a
 * cached list would hide a draft saved a moment ago. Gated by middleware, and
 * by the service again.
 */
export default async function AdminDraftsPage() {
  const result = await resolve(PostController).getDraftPosts();

  if (!result.success) {
    // The session lapsed after middleware let the request through: log in
    // again rather than reporting it as a failure of the list.
    if (result.code === 'UNAUTHORIZED') {
      redirect(ROUTES.LOGIN);
    }

    return <AdminDraftsTemplate drafts={[]} error={result.error ?? 'Failed to load drafts.'} />;
  }

  return <AdminDraftsTemplate drafts={result.data} />;
}
