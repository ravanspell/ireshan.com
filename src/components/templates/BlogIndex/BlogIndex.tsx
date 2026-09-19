/** Blog index shell. Takes data already loaded, so the route stays thin. */
import BlogPostList from '@organisms/BlogPostList/BlogPostList';
import Typography from '@atoms/Typography/Typography';
import type { Post } from '@models/post.model';

export interface BlogIndexProps {
  posts: Post[];
}

const BlogIndex = ({ posts }: BlogIndexProps) => {
  return (
    <main className="mx-auto mt-10 max-w-4xl px-4 pb-16">
      <Typography
        variant="h1"
        as="h1"
        id="blog-heading"
        className="mb-8 text-3xl font-bold"
        text="Blog"
      />
      <BlogPostList posts={posts} />
    </main>
  );
};

export default BlogIndex;
