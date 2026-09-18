import type { Meta, StoryObj } from '@storybook/nextjs';

import Button from './Button';
import { CircleArrowDown } from 'lucide-react';

const meta: Meta<typeof Button> = {
  component: Button,
};
export default meta;

type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    icon: CircleArrowDown,
    label: 'My button',
    onClick: () => {},
  },
};
