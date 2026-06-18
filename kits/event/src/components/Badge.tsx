import * as React from 'react';
import { cva } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const badgeVariants = cva('rounded-full', {
  variants: {
    /** Color treatment — `soft` is a tinted chip, `solid` is filled primary. */
    tone: {
      soft: 'bg-primary/10 text-primary',
      solid: 'bg-primary text-primary-foreground',
    },
    /**
     * Density + type voice. `tag` is the quiet inline track/session chip;
     * `kicker` is the wide-tracked uppercase eyebrow; `flag` is the tiny
     * all-caps callout (e.g. a "Popular" marker).
     */
    size: {
      tag: 'px-2.5 py-0.5 text-xs font-medium',
      kicker: 'px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]',
      flag: 'px-2 py-0.5 text-[0.625rem] font-semibold uppercase tracking-wide',
    },
  },
  defaultVariants: { tone: 'soft', size: 'tag' },
});

/**
 * A small pill label — the event system's chip voice. Used for session/track
 * tags, the hero kicker, and the "Popular" ticket flag. The color (`tone`) and
 * density/type (`size`) axes are explicit string unions so the catalog surfaces
 * them as variant axes; styling is token-themed (`bg-primary`, `rounded-full`).
 */
export interface BadgeProps extends React.ComponentProps<'span'> {
  /** Color treatment — `soft` is a tinted chip, `solid` is filled primary. */
  tone?: 'soft' | 'solid';
  /** Density + type voice for the chip. */
  size?: 'tag' | 'kicker' | 'flag';
  /** Label text. 1–2 words. */
  children?: React.ReactNode;
}

export function Badge({ tone, size, className, children, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ tone, size }), className)} {...props}>
      {children}
    </span>
  );
}

export const BadgeShowcase: { props: BadgeProps; label?: string }[] = [
  { props: { tone: 'soft', size: 'tag', children: 'Keynote' }, label: 'Track tag' },
  { props: { tone: 'soft', size: 'kicker', children: 'Conference 2026' }, label: 'Kicker' },
  { props: { tone: 'solid', size: 'flag', children: 'Popular' }, label: 'Popular flag' },
];
