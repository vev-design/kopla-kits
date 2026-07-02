import * as React from 'react';
import { cva } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const dividerVariants = cva('flex items-center gap-3 text-primary', {
  variants: {
    /** How the rule spreads and anchors. */
    align: {
      center: 'mx-auto w-full max-w-xs justify-center',
      full: 'w-full justify-center',
      start: 'w-full max-w-[8rem] justify-start',
    },
  },
  defaultVariants: { align: 'center' },
});

/**
 * The system's signature ornament rule — a thin gold hairline with a small
 * diamond flourish (an inline SVG, token-colored via `currentColor`). Used
 * beneath every section heading and as a quiet section break. `center` is a
 * short centered rule, `full` spans its container, `start` anchors the diamond
 * to the left for left-aligned headings. The width axis is an explicit string
 * union so the kit extractor surfaces it.
 */
export interface DividerProps extends Omit<React.ComponentProps<'div'>, 'children'> {
  /** Spread of the rule: centered short rule, full-width line, or left-anchored. */
  align?: 'center' | 'full' | 'start';
}

export function Divider({ className, align, ...props }: DividerProps) {
  return (
    <div
      role="separator"
      className={cn(dividerVariants({ align }), className)}
      {...props}
    >
      {align !== 'start' ? (
        <span className="h-px flex-1 bg-primary/40" aria-hidden />
      ) : null}
      <svg
        viewBox="0 0 28 8"
        className="h-2 w-7 shrink-0"
        fill="currentColor"
        aria-hidden
      >
        <circle cx="3" cy="4" r="1" opacity="0.55" />
        <path d="M14 0.5 17.5 4 14 7.5 10.5 4Z" />
        <circle cx="25" cy="4" r="1" opacity="0.55" />
      </svg>
      <span className="h-px flex-1 bg-primary/40" aria-hidden />
    </div>
  );
}

export const DividerShowcase: { props: DividerProps; label?: string }[] = [
  { props: { align: 'center' }, label: 'Center' },
  { props: { align: 'full' }, label: 'Full' },
  { props: { align: 'start' }, label: 'Start' },
];
