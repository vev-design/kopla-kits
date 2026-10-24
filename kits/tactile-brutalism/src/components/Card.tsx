import * as React from 'react';
import { cva } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const cardVariants = cva('flex flex-col rounded-none', {
  variants: {
    /** Which surface role the card plays in the system. */
    variant: {
      panel: 'gap-4 border border-border bg-card p-7 transition-colors hover:border-primary',
      inverted: 'gap-4 border border-primary bg-primary p-7 text-primary-foreground',
      ghost: 'gap-4 border-t border-border bg-transparent pt-7',
    },
  },
  defaultVariants: { variant: 'panel' },
});

/**
 * The system's flat, hard-edged content surface: zero corner radius, a full
 * 1px border instead of a shadow. `panel` is the default bordered tile used
 * across the grid; `inverted` fills solid with the acid-lime primary for the
 * one cell that should read loudest; `ghost` drops the box entirely in favor
 * of a single top rule, for quote-like content that shouldn't look boxed in.
 * The role is an explicit string union so the kit extractor surfaces it as a
 * variant axis.
 */
export interface CardProps extends React.ComponentProps<'div'> {
  /** Surface role: a bordered panel, an inverted acid-lime fill, or a top-ruled ghost surface. */
  variant?: 'panel' | 'inverted' | 'ghost';
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
  { props: { variant: 'inverted' }, label: 'Inverted' },
  { props: { variant: 'ghost' }, label: 'Ghost' },
];
