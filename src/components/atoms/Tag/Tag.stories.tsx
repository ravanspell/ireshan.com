import type { Meta, StoryObj } from '@storybook/nextjs';
import Tag from './Tag';

const meta: Meta<typeof Tag> = {
  component: Tag,
};
export default meta;

type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    label: 'My Tag',
    id: 'my-tag',
  },
};
