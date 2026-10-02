'use client';

import { useRef, useState } from 'react';
import { TableOfContents as TableOfContentsIcon } from 'lucide-react';
import { Button } from '@/components/atoms/button';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/atoms/sheet';
import { cn } from '@/lib/utils';
import TableOfContents from '@molecules/TableOfContents/TableOfContents';
import type { TocEntry } from '@lib/editor-content';

export interface TableOfContentsSheetProps {
  /** From `toTocEntries`; expected non-empty. */
  entries: TocEntry[];
  className?: string;
}

/**
 * The table of contents for narrow screens: a floating button that opens it in
 * a side sheet, as there's no room for a column beside the article.
 */
const TableOfContentsSheet = ({ entries, className }: TableOfContentsSheetProps) => {
  const [open, setOpen] = useState(false);
  /** Heading picked in the sheet, scrolled to once the sheet has closed. */
  const target = useRef<string | null>(null);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="secondary"
          size="icon-lg"
          className={cn(
            // Clear of the iPhone home indicator, which overlays the bottom edge.
            'fixed right-4 bottom-[max(1.5rem,env(safe-area-inset-bottom))] z-40 rounded-full shadow-lg',
            className,
          )}
        >
          <TableOfContentsIcon aria-hidden />
          <span className="sr-only">Table of contents</span>
        </Button>
      </SheetTrigger>

      <SheetContent
        side="right"
        aria-describedby={undefined}
        className="overflow-y-auto px-4 pt-12 pb-6"
        // The dialog locks page scroll while open, and on close returns focus
        // to the trigger - which would scroll back up to it. So the jump waits
        // for the close, and replaces the focus return.
        onCloseAutoFocus={(event) => {
          const id = target.current;
          if (!id) return;
          event.preventDefault();
          target.current = null;
          history.pushState(null, '', `#${id}`);
          requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView());
        }}
      >
        <SheetTitle className="sr-only">Table of contents</SheetTitle>
        <TableOfContents
          entries={entries}
          onNavigate={(id) => {
            target.current = id;
            setOpen(false);
          }}
        />
      </SheetContent>
    </Sheet>
  );
};

export default TableOfContentsSheet;
