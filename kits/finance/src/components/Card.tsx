import * as React from 'react';
import { cva } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const cardVariants = cva('', {
  variants: {
    /** Which surface role the card plays in the system. */
    variant: {
      feature:
        'flex flex-col gap-4 rounded-lg border border-border bg-card p-6 transition-colors hover:border-primary/40',
      panel:
        'flex flex-col gap-4 rounded-lg border border-border bg-secondary/50 p-6',
      tier: 'flex h-full flex-col gap-6 rounded-lg border border-border bg-card p-8',
      'tier-highlighted':
        'flex h-full flex-col gap-6 rounded-lg border border-primary bg-card p-8 shadow-xl shadow-primary/10 ring-1 ring-primary',
    },
  },
  defaultVariants: { variant: 'feature' },
});

/**
 * A bordered content surface — the Finance system's card. Token-themed on
 * `--card` with a `--border` edge and the small `--radius` corners. `feature`
 * is the compact icon-led tile (capabilities, security); `panel` is a quiet
 * tinted surface for supporting content; `tier` is the pricing column and
 * `tier-highlighted` adds the recommended-plan ring and shadow. The role is an
 * explicit string union so the kit extractor surfaces it as a variant axis.
 */
export interface CardProps extends React.ComponentProps<'div'> {
  /** Surface role: a feature tile, a quiet panel, a pricing tier, or a highlighted tier. */
  variant?: 'feature' | 'panel' | 'tier' | 'tier-highlighted';
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
  { props: { variant: 'panel' }, label: 'Panel' },
  { props: { variant: 'tier' }, label: 'Tier' },
  { props: { variant: 'tier-highlighted' }, label: 'Tier (highlighted)' },
];
