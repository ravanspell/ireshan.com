'use client';

import type { ComponentProps, MouseEvent } from 'react';
import {
  AlertDialog as AlertDialogRoot,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/atoms/alert-dialog';
import Typography from '@atoms/Typography/Typography';

export interface AlertDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  /** Replaces `confirmLabel` while `isPending`. */
  pendingLabel?: string;
  cancelLabel?: string;
  confirmVariant?: ComponentProps<typeof AlertDialogAction>['variant'];
  /** Locks both buttons. */
  isPending?: boolean;
  /** Shown in place of closing, so a failed write doesn't vanish. */
  error?: string | null;
  onConfirm: () => void;
  onOpenChange: (open: boolean) => void;
  testId?: string;
}

/**
 * Confirm-or-cancel dialog over the `alert-dialog` atoms.
 *
 * Presentational: the caller owns `open`, the copy and the write, which is why
 * a failure can stay on screen instead of dismissing.
 */
const AlertDialog = (props: AlertDialogProps) => {
  const {
    open,
    title,
    description,
    confirmLabel = 'Confirm',
    pendingLabel = 'Working...',
    cancelLabel = 'Cancel',
    confirmVariant = 'default',
    isPending = false,
    error = null,
    onConfirm,
    onOpenChange,
    testId,
  } = props;

  const confirm = (event: MouseEvent<HTMLButtonElement>) => {
    // `AlertDialogAction` dismisses on click by default; the caller closes it.
    event.preventDefault();
    onConfirm();
  };

  return (
    <AlertDialogRoot open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent data-testid={testId}>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>

        {error && (
          <Typography
            variant="caption"
            as="p"
            role="alert"
            className="text-destructive text-sm"
            text={error}
          />
        )}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>{cancelLabel}</AlertDialogCancel>
          <AlertDialogAction
            variant={confirmVariant}
            onClick={confirm}
            disabled={isPending}
            aria-busy={isPending}
          >
            {isPending ? pendingLabel : confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialogRoot>
  );
};

export default AlertDialog;
