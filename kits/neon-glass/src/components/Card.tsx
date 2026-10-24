import * as React from 'react';
import { cva } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const cardVariants = cva('', {
  variants: {
    /** Which surface role the card plays in the system. */
    variant: {
      glass:
        'flex flex-col gap-4 rounded-xl border border-border bg-card p-6 backdrop-blur-xl transition-colors hover:border-white/25',
      tile:
        'flex flex-col items-center gap-3 rounded-xl border border-border bg-card p-5 text-center backdrop-blur-xl',
      highlight:
        'flex h-full flex-col gap-6 rounded-xl border border-ring/50 bg-card p-8 backdrop-blur-xl shadow-[0_0_60px_-16px_var(--ring)] ring-1 ring-ring/40',
    },
  },
  defaultVariants: { variant: 'glass' },
});

/**
 * The Neon Glass system's frosted surface — a translucent panel over the
 * ambient gradient, with a hairline white border and heavy backdrop blur so
 * whatever glows behind it stays visible through the glass. `glass` is the
 * general-purpose panel (feature cells, testimonial, footer blocks); `tile`
 * is the compact centered cell used for stat callouts; `highlight` adds the
 * hot-pink ring and glow for a recommended pricing tier or featured cell.
 * The role is an explicit string union so the kit extractor surfaces it as a
 * variant axis.
 */
export interface CardProps extends React.ComponentProps<'div'> {
  /** Surface role: a general glass panel, a compact centered tile, or a ring-lit highlight. */
  variant?: 'glass' | 'tile' | 'highlight';
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
  { props: { variant: 'glass' }, label: 'Glass' },
  { props: { variant: 'tile' }, label: 'Tile' },
  { props: { variant: 'highlight' }, label: 'Highlight' },
];
