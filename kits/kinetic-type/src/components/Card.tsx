import * as React from 'react';
import { cva } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const cardVariants = cva('', {
  variants: {
    /** Which surface role the card plays in the system. */
    variant: {
      statement: 'flex flex-col gap-5 border-t border-border pt-8',
      flat: 'flex flex-col gap-4 rounded-[var(--radius)] border border-border bg-card p-6',
    },
  },
  defaultVariants: { variant: 'statement' },
});

/**
 * A content surface — the Kinetic Type system's card. `statement` is a bare,
 * hairline-topped cell built for the numbered manifesto grid (no fill, no
 * border box, so the huge index numeral reads as type rather than a UI
 * chrome); `flat` is a conventional bordered, off-white-card surface for
 * anywhere a boxed treatment reads better. The role is an explicit string
 * union so the kit extractor surfaces it as a variant axis.
 */
export interface CardProps extends React.ComponentProps<'div'> {
  /** Surface role: a bare hairline-topped statement cell, or a bordered flat card. */
  variant?: 'statement' | 'flat';
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
  { props: { variant: 'statement' }, label: 'Statement' },
  { props: { variant: 'flat' }, label: 'Flat' },
];
