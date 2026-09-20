'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import BlogPostList from '@organisms/BlogPostList/BlogPostList';
import AlertDialog from '@molecules/AlertDialog/AlertDialog';
import Typography from '@atoms/Typography/Typography';
import useIsAuthenticated from '@hooks/useIsAuthenticated';
import { unpublishPostAction } from '@/app/actions/artical';
import type { Post } from '@models/post.model';

export interface BlogIndexProps {
  posts: Post[];
}

/**
 * Blog index shell. Takes data already loaded, so the route stays thin.
 *
 * Owns the unpublish write and the session read: the page it serves is a
 * Server Component, so neither can live any higher, and everything below stays
 * presentational.
 */
const BlogIndex = ({ posts }: BlogIndexProps) => {
  const isAuthenticated = useIsAuthenticated();
  const router = useRouter();
  const [pendingPost, setPendingPost] = useState<Post | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUnpublishing, startUnpublish] = useTransition();

  const closeDialog = (open: boolean) => {
    // A dismissal mid-write would leave the result nowhere to land.
    if (open || isUnpublishing) return;
    setPendingPost(null);
    setError(null);
  };

  const confirmUnpublish = () => {
    if (!pendingPost) return;
    setError(null);

    startUnpublish(async () => {
      const result = await unpublishPostAction(pendingPost.id);

      if (!result.success) {
        setError(result.error ?? 'Failed to unpublish this post.');
        return;
      }

      setPendingPost(null);
      // The action revalidated `/blog`; this pulls the rebuilt payload.
      router.refresh();
    });
  };

  return (
    <main className="mx-auto mt-10 max-w-4xl px-4 pb-16">
      <Typography
        variant="h1"
        as="h1"
        id="blog-heading"
        className="mb-8 text-3xl font-bold"
        text="Blog"
      />
      {/* No handler for anonymous visitors, so the cards render no controls. */}
      <BlogPostList posts={posts} onUnpublish={isAuthenticated ? setPendingPost : undefined} />

      <AlertDialog
        open={pendingPost !== null}
        title="Move this post to drafts?"
        description={`"${pendingPost?.title ?? ''}" comes off the blog and its public URL starts returning 404. Nothing is deleted - the post waits in drafts, where it can be edited and published again, keeping its original date.`}
        confirmLabel="Unpublish"
        pendingLabel="Unpublishing..."
        confirmVariant="destructive"
        isPending={isUnpublishing}
        error={error}
        onConfirm={confirmUnpublish}
        onOpenChange={closeDialog}
        testId="unpublish-post-dialog"
      />
    </main>
  );
};

export default BlogIndex;
