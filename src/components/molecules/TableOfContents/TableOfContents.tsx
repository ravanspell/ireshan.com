'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import type { TocEntry } from '@lib/editor-content';

export interface TableOfContentsProps {
  /** From `toTocEntries`; expected non-empty. */
  entries: TocEntry[];
  /**
   * Takes over link clicks from the browser's hash jump - for a container
   * that must close before the page can scroll (the mobile sheet).
   */
  onNavigate?: (id: string) => void;
  className?: string;
}

/**
 * A heading becomes current once its top passes this line. Link jumps land
 * headings at the viewport top, so keep it small: any larger and the heading
 * below the target crosses it too and takes the highlight.
 */
const ACTIVE_OFFSET_PX = 8;

/** Scroll-idle time after which a link jump is taken to have finished. */
const JUMP_SETTLE_MS = 150;

/** Heading navigation for a blog post, highlighting the section being read. */
const TableOfContents = ({ entries, onNavigate, className }: TableOfContentsProps) => {
  const [activeId, setActiveId] = useState(entries[0]?.id);
  /**
   * True during a link jump, so scroll tracking can't override the clicked
   * entry - e.g. near the page end, where the target can't reach the top.
   */
  const jumping = useRef(false);
  const settleTimer = useRef(0);

  /**
   * (Re)schedules the end of a jump. Also called on click, as a jump to the
   * heading already in view never scrolls.
   */
  const settleJump = () => {
    window.clearTimeout(settleTimer.current);
    settleTimer.current = window.setTimeout(() => (jumping.current = false), JUMP_SETTLE_MS);
  };

  // Scroll position rather than an IntersectionObserver: heading ids only
  // exist once Editor.js renders client-side, so there's nothing to observe.
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      let current = entries[0].id;
      for (const entry of entries) {
        const el = document.getElementById(entry.id);
        if (el && el.getBoundingClientRect().top <= ACTIVE_OFFSET_PX) current = entry.id;
      }
      setActiveId(current);
    };
    const onScroll = () => {
      // Mid-jump: wait for scrolling to go quiet.
      if (jumping.current) return settleJump();
      if (!frame) frame = requestAnimationFrame(update);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    // Also on mount - the sheet mounts a fresh copy mid-page on every open.
    frame = requestAnimationFrame(update);
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(frame);
      window.clearTimeout(settleTimer.current);
    };
  }, [entries]);

  return (
    <nav aria-label="Table of contents" className={className}>
      <ul className="flex flex-col border-l border-border text-sm">
        {entries.map((entry) => (
          <li key={entry.id}>
            <a
              href={`#${entry.id}`}
              onClick={(event) => {
                if (onNavigate) {
                  event.preventDefault();
                  onNavigate(entry.id);
                  return;
                }
                jumping.current = true;
                settleJump();
                setActiveId(entry.id);
              }}
              aria-current={activeId === entry.id ? 'location' : undefined}
              className={cn(
                '-ml-px block border-l py-1.5 pr-2 transition-colors',
                entry.depth === 0 ? 'pl-4' : 'pl-8',
                activeId === entry.id
                  ? 'border-primary font-medium text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground',
              )}
            >
              {entry.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default TableOfContents;
