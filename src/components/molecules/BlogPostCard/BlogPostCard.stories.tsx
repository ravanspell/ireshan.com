import type { Meta, StoryObj } from '@storybook/nextjs';

import BlogPostCard from './BlogPostCard';
import type { Post } from '@models/post.model';

const basePost: Post = {
  id: '6d1f3c2a-6e1b-4f8a-9d55-0c2b7a1e4f90',
  title: 'Authorization belongs in the service layer',
  slug: 'authorization-belongs-in-the-service-layer',
  excerpt:
    'Server Actions are public HTTP endpoints, so a pathname-based middleware check never sees them. Here is where the boundary actually goes.',
  published: true,
  publishedAt: new Date('2026-08-14T09:00:00Z'),
  authorId: 'author-1',
  createdAt: new Date('2026-08-10T09:00:00Z'),
  updatedAt: new Date('2026-08-14T09:00:00Z'),
  tags: [
    { id: 'tag-1', name: 'Next.js', slug: 'nextjs', createdAt: new Date() },
    { id: 'tag-2', name: 'Architecture', slug: 'architecture', createdAt: new Date() },
  ],
};

const meta: Meta<typeof BlogPostCard> = {
  component: BlogPostCard,
};
export default meta;

type Story = StoryObj<typeof BlogPostCard>;

export const Primary: Story = {
  args: { post: basePost },
};

export const WithoutTags: Story = {
  args: { post: { ...basePost, tags: [] } },
};

export const WithoutExcerpt: Story = {
  args: { post: { ...basePost, excerpt: null } },
};
