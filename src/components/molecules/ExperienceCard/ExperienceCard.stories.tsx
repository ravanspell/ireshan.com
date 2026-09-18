import type { Meta, StoryObj } from '@storybook/nextjs';

import ArticleCard from './ExperienceCard';

const meta: Meta<typeof ArticleCard> = {
  component: ArticleCard,
};
export default meta;

type Story = StoryObj<typeof ArticleCard>;

export const Primary: Story = {
  args: {
    date: '24 Jan 2023',
  },
};
