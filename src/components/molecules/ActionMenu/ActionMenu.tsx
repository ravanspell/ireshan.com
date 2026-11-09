'use client';

import { Fragment } from 'react';
import Link from 'next/link';
import { EllipsisVertical, type LucideIcon } from 'lucide-react';
import { Button } from '@/components/atoms/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/atoms/dropdown-menu';
import { cn } from '@/lib/utils';

interface ActionMenuItemBase {
  label: string;
  icon?: LucideIcon;
  /** `destructive`: red, with a separator before it. */
  variant?: 'default' | 'destructive';
  disabled?: boolean;
  testId?: string;
}

/** A link (`href`) or an action (`onSelect`), not both. */
export type ActionMenuItem = ActionMenuItemBase &
  ({ href: string; onSelect?: never } | { onSelect: () => void; href?: never });

export interface ActionMenuProps {
  /** Accessible name for the icon-only trigger. */
  label: string;
  items: ActionMenuItem[];
  align?: 'start' | 'center' | 'end';
  className?: string;
  testId?: string;
}

/**
 * Three-dots button that opens a menu of row actions (shadcn's dashboard-01
 * pattern).
 *
 * `modal={false}` lets an item open a dialog; a modal menu can leave
 * `pointer-events: none` on `<body>` once the dialog closes.
 */
const ActionMenu = (props: ActionMenuProps) => {
  const { label, items, align = 'end', className, testId } = props;

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={label}
          className={cn(
            'text-muted-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground',
            className,
          )}
          data-testid={testId}
        >
          <EllipsisVertical aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align={align} className="min-w-40">
        {items.map((item, index) => {
          const { label: itemLabel, icon: Icon, variant = 'default', disabled, testId } = item;
          const content = (
            <>
              {Icon && <Icon aria-hidden="true" />}
              {itemLabel}
            </>
          );
          // Only where a destructive item follows a safe one.
          const separated =
            variant === 'destructive' && index > 0 && items[index - 1].variant !== 'destructive';

          return (
            <Fragment key={itemLabel}>
              {separated && <DropdownMenuSeparator />}
              {item.href !== undefined ? (
                <DropdownMenuItem
                  asChild
                  variant={variant}
                  disabled={disabled}
                  data-testid={testId}
                >
                  <Link href={item.href}>{content}</Link>
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem
                  variant={variant}
                  disabled={disabled}
                  onSelect={item.onSelect}
                  data-testid={testId}
                >
                  {content}
                </DropdownMenuItem>
              )}
            </Fragment>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ActionMenu;
