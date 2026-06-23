import * as React from 'react';
import { cva } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const cardVariants = cva('', {
  variants: {
    /** Which surface role the card plays in the system. */
    variant: {
      surface:
        'flex flex-col gap-4 rounded-xl border border-border bg-card p-6',
      bordered:
        'flex flex-col gap-4 rounded-xl border border-primary/30 bg-card/60 p-6',
      plain: 'flex flex-col gap-4',
    },
  },
  defaultVariants: { variant: 'surface' },
});

/**
 * A content surface — the restaurant system's card. Token-themed on `--card`
 * with a `--border` edge and `--radius`-derived corners. `surface` is the
 * filled tile used for hours and info panels; `bordered` adds a gold-tinted
 * edge for highlighted detail; `plain` drops the chrome for transparent
 * groupings like a menu category. The role is an explicit string union so the
 * kit extractor surfaces it as a variant axis.
 */
export interface CardProps extends React.ComponentProps<'div'> {
  /** Surface role: a filled tile, a gold-bordered panel, or a chrome-free group. */
  variant?: 'surface' | 'bordered' | 'plain';
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
  { props: { variant: 'surface' }, label: 'Surface' },
  { props: { variant: 'bordered' }, label: 'Bordered' },
  { props: { variant: 'plain' }, label: 'Plain' },
];
