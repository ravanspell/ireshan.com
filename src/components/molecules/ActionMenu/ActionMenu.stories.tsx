import type { Meta, StoryObj } from '@storybook/nextjs';
import { Copy, SquarePen, Trash2 } from 'lucide-react';

import ActionMenu from './ActionMenu';

const meta: Meta<typeof ActionMenu> = {
  component: ActionMenu,
  args: { label: 'Actions for "Untitled draft"' },
};
export default meta;

type Story = StoryObj<typeof ActionMenu>;

/** What a draft card shows. */
export const DraftActions: Story = {
  args: {
    items: [
      { label: 'Edit draft', icon: SquarePen, href: '/admin/editor?id=draft-1' },
      { label: 'Delete draft', icon: Trash2, variant: 'destructive', onSelect: () => {} },
    ],
  },
};

/** Disabled items are greyed out and can't be selected. */
export const WithDisabledItem: Story = {
  args: {
    items: [
      { label: 'Edit draft', icon: SquarePen, href: '/admin/editor?id=draft-1' },
      { label: 'Duplicate', icon: Copy, onSelect: () => {}, disabled: true },
      { label: 'Delete draft', icon: Trash2, variant: 'destructive', onSelect: () => {} },
    ],
  },
};
