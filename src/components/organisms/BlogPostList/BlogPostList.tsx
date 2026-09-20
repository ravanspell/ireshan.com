import BlogPostCard from '@molecules/BlogPostCard/BlogPostCard';
import Typography from '@atoms/Typography/Typography';
import type { Post } from '@models/post.model';

export interface BlogPostListProps {
  /** Published posts, already ordered by the repository. */
  posts: Post[];
  /** Passed through to each card; only signed-in authors get one. */
  onUnpublish?: (post: Post) => void;
}

/** The published posts, or the empty state. */
const BlogPostList = (props: BlogPostListProps) => {
  const { posts, onUnpublish } = props;

  if (posts.length === 0) {
    return (
      <Typography
        as="p"
        id="blog-empty-state"
        className="text-muted-foreground"
        text="No posts published yet."
      />
    );
  }

  return (
    // `divide-y` rather than a `Separator` between items: a `<ul>` may only
    // contain `<li>`, so a sibling rule element would be invalid markup.
    <ul
      id="blog-post-list"
      className="flex flex-col divide-y divide-border"
      aria-label="Blog posts"
    >
      {posts.map((post) => (
        <li key={post.id} className="py-10 first:pt-0 last:pb-0">
          <BlogPostCard post={post} onUnpublish={onUnpublish} />
        </li>
      ))}
    </ul>
  );
};

export default BlogPostList;
