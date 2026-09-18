import type { Meta, StoryObj } from '@storybook/nextjs';

import AboutMeSection from './AboutMeSection';

const meta: Meta<typeof AboutMeSection> = {
  component: AboutMeSection,
};
export default meta;

type Story = StoryObj<typeof AboutMeSection>;

export const Primary: Story = {};
