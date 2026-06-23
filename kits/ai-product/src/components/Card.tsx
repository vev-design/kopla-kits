import * as React from 'react';
import { cva } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const cardVariants = cva('', {
  variants: {
    /** Which surface role the card plays in the system. */
    variant: {
      feature:
        'flex flex-col gap-4 rounded-xl border border-border bg-card p-6 transition-colors hover:border-ring/40',
      tier: 'flex h-full flex-col gap-6 rounded-xl border border-border bg-card p-8',
      'tier-highlighted':
        'flex h-full flex-col gap-6 rounded-xl border border-ring/60 bg-card p-8 shadow-[0_0_50px_-12px_var(--ring)] ring-1 ring-ring/40',
    },
  },
  defaultVariants: { variant: 'feature' },
});

/**
 * A bordered content surface — the AI Product system's card. Token-themed on
 * the lifted near-black `--card` with a hairline `--border` edge and
 * `--radius`-derived corners. The `feature` role is the compact icon-led tile
 * that warms its border to the iris `--ring` on hover; `tier` is the taller
 * pricing column; `tier-highlighted` adds the recommended-plan iris ring and
 * glow. The role is an explicit string union so the kit extractor surfaces it
 * as a variant axis.
 */
export interface CardProps extends React.ComponentProps<'div'> {
  /** Surface role: a compact feature tile, a pricing tier, or a highlighted tier. */
  variant?: 'feature' | 'tier' | 'tier-highlighted';
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
  { props: { variant: 'feature' }, label: 'Feature' },
  { props: { variant: 'tier' }, label: 'Tier' },
  { props: { variant: 'tier-highlighted' }, label: 'Tier (highlighted)' },
];
