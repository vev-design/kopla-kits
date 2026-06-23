import * as React from 'react';
import { cva } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const cardVariants = cva('flex flex-col rounded-xl', {
  variants: {
    /** Which surface role the card plays in the system. */
    variant: {
      soft: 'gap-4 bg-card border border-border p-7 transition-colors hover:border-primary/40',
      tinted: 'gap-4 bg-secondary/60 p-7',
      tier: 'h-full gap-6 border border-border bg-card p-8',
      'tier-highlighted':
        'h-full gap-6 border border-primary bg-card p-8 shadow-xl shadow-primary/10 ring-1 ring-primary',
    },
  },
  defaultVariants: { variant: 'soft' },
});

/**
 * A soft, generously rounded content surface — the Wellness system's card.
 * Token-themed on `--card`/`--secondary` with a `--border` edge and the large
 * `--radius`-derived corners that give the system its pill-soft feel. The
 * `soft` role is the offering tile; `tinted` is a calm sage-washed panel;
 * `tier` is the membership column and `tier-highlighted` adds the recommended
 * ring and shadow. The role is an explicit string union so the kit extractor
 * surfaces it as a variant axis.
 */
export interface CardProps extends React.ComponentProps<'div'> {
  /** Surface role: a soft tile, a tinted panel, a membership tier, or a highlighted tier. */
  variant?: 'soft' | 'tinted' | 'tier' | 'tier-highlighted';
  /** Card contents. */
  children?: React.ReactNode;
}

export function Card({ className, variant, children, ...props }: CardProps) {
  return (
    <div className={cn(cardVariants({ variant }), className)} {...props}>
      {children}
    </div>
  );
}

export const CardShowcase: { props: CardProps; label?: string }[] = [
  { props: { variant: 'soft' }, label: 'Soft' },
  { props: { variant: 'tinted' }, label: 'Tinted' },
  { props: { variant: 'tier' }, label: 'Tier' },
  { props: { variant: 'tier-highlighted' }, label: 'Tier (highlighted)' },
];
