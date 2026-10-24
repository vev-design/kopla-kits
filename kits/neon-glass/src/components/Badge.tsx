import * as React from 'react';
import { cva } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const badgeVariants = cva('inline-flex items-center gap-1.5 font-mono text-xs tracking-wide', {
  variants: {
    /** Visual treatment of the pill. */
    variant: {
      solid: 'rounded-full bg-primary px-3 py-1 font-medium text-primary-foreground',
      glass:
        'rounded-full border border-border bg-card/60 px-3 py-1 text-muted-foreground backdrop-blur-md',
      outline: 'rounded-full border border-border/70 px-3 py-1 text-muted-foreground',
    },
  },
  defaultVariants: { variant: 'glass' },
});

/**
 * A small pill label — the Neon Glass system's badge voice. Used for eyebrow
 * chips above headlines, status tags, and micro-labels on glass cards.
 * `solid` fills with the hot-pink `--primary` for the loudest emphasis,
 * `glass` is a frosted translucent chip (the default, matching the system's
 * panels), and `outline` is a quieter hairline chip for dense rows. The
 * visual axis is an explicit string union so the kit extractor surfaces it
 * as a variant.
 */
export interface BadgeProps extends React.ComponentProps<'span'> {
  /** Visual treatment of the pill. `solid` is filled hot-pink, `glass` is a frosted chip, `outline` is a quiet hairline chip. */
  variant?: 'solid' | 'glass' | 'outline';
  /** Badge label / content. 1–3 words. */
  children?: React.ReactNode;
}

export function Badge({ className, variant, children, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props}>
      {children}
    </span>
  );
}

export const BadgeShowcase: { props: BadgeProps; label?: string }[] = [
  { props: { variant: 'solid', children: 'Live now' }, label: 'Solid' },
  { props: { variant: 'glass', children: 'Scroll to explore' }, label: 'Glass' },
  { props: { variant: 'outline', children: 'v2.0' }, label: 'Outline' },
];
