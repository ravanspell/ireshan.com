import type { Meta, StoryObj } from '@storybook/nextjs';

import CertificationCard from './CertificationCard';

const meta: Meta<typeof CertificationCard> = {
  component: CertificationCard,
};
export default meta;

type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    id: 'certification-1',
    name: 'My certification name',
    shortDescription: '',
    certificationBadge: 'image.jpg',
  },
};
