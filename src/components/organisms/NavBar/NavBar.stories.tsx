import type { Meta, StoryObj } from '@storybook/nextjs';

import NavBar from './NavBar';

const meta: Meta<typeof NavBar> = {
  component: NavBar,
};
export default meta;

type Story = StoryObj<typeof NavBar>;

export const Primary: Story = {};
