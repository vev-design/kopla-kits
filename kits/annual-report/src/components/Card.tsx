import * as React from 'react';
import { cva } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const cardVariants = cva('', {
  variants: {
    /** Which surface role the card plays in the report. */
    variant: {
      panel:
        'flex flex-col gap-4 rounded-lg border border-border bg-card p-6 md:p-8',
      bordered:
        'flex flex-col gap-4 border-t-2 border-primary bg-transparent pt-6',
      filled:
        'flex flex-col gap-4 rounded-lg bg-secondary p-6 text-secondary-foreground md:p-8',
    },
  },
  defaultVariants: { variant: 'panel' },
});

/**
 * A content surface — the report's card. Token-themed on `--card` / `--secondary`
 * with `--border` edges and `--radius` corners. `panel` is the standard bordered
 * tile; `bordered` is a borderless column under a heavy navy top rule (for
 * segment and milestone entries); `filled` is a soft neutral block for callouts.
 * The role is an explicit string union so the kit extractor surfaces it as a
 * variant axis.
 */
export interface CardProps extends React.ComponentProps<'div'> {
  /** Surface role: a bordered panel, a top-ruled column, or a soft filled block. */
  variant?: 'panel' | 'bordered' | 'filled';
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
  { props: { variant: 'panel' }, label: 'Panel' },
  { props: { variant: 'bordered' }, label: 'Bordered' },
  { props: { variant: 'filled' }, label: 'Filled' },
];
