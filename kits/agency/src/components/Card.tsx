import * as React from 'react';
import { cva } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const cardVariants = cva('', {
  variants: {
    /** Which surface role the card plays in the system. */
    variant: {
      bordered:
        'flex flex-col gap-4 rounded-sm border border-border bg-card p-6 transition-colors hover:border-foreground',
      filled:
        'flex flex-col gap-4 rounded-sm bg-foreground p-6 text-background',
      flush:
        'flex flex-col gap-4 border-t border-border bg-transparent pt-6',
    },
  },
  defaultVariants: { variant: 'bordered' },
});

/**
 * A content surface — the Agency system's card. Editorial and near-square:
 * small `--radius` corners, hairline `--border` edges, no soft shadows.
 * `bordered` is the default outlined tile, `filled` inverts to near-black ink
 * for emphasis, and `flush` is a borderless column separated only by a top
 * hairline rule (the grid-list look). The role is an explicit string union so
 * the kit extractor surfaces it as a variant axis.
 */
export interface CardProps extends React.ComponentProps<'div'> {
  /** Surface role: an outlined tile, an inverted filled block, or a flush grid column. */
  variant?: 'bordered' | 'filled' | 'flush';
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
  { props: { variant: 'bordered' }, label: 'Bordered' },
  { props: { variant: 'filled' }, label: 'Filled' },
  { props: { variant: 'flush' }, label: 'Flush' },
];
