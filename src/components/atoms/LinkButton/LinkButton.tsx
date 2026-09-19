import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export type LinkButtonVariant = 'primary' | 'secondary';

export interface LinkButtonProps {
  href: string;
  label: string;
  icon?: LucideIcon;
  /** `primary` is the one main action on a view; everything else is `secondary`. */
  variant?: LinkButtonVariant;
  /** Spoken label, when the visible one is too terse out of context. */
  ariaLabel?: string;
  className?: string;
  testId?: string;
}

const VARIANT_CLASSES: Record<LinkButtonVariant, string> = {
  primary:
    'border-primary bg-primary text-primary-foreground hover:opacity-90 focus-visible:outline-ring',
  secondary:
    'border-border bg-secondary text-foreground hover:border-border-stronger hover:bg-accent hover:text-primary focus-visible:outline-ring',
};

/**
 * A navigation action that reads as a button. An anchor, not a `<button>`, so
 * it stays middle-clickable and prefetchable; `Button` takes an `onClick`.
 */
const LinkButton = (props: LinkButtonProps) => {
  const { href, label, icon: Icon, variant = 'secondary', ariaLabel, className, testId } = props;

  return (
    <Link
      href={href}
      aria-label={ariaLabel}
      data-testid={testId}
      className={cn(
        'inline-flex w-max items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs',
        'outline-0 transition-all duration-300 ease-out',
        'focus-visible:outline-4 focus-visible:outline-offset-1',
        VARIANT_CLASSES[variant],
        className,
      )}
    >
      {Icon && <Icon className="size-[1em]" aria-hidden="true" />}
      {label}
    </Link>
  );
};

export default LinkButton;
