import * as React from 'react';
import { cva } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium tracking-wide',
  {
    variants: {
      /** Visual treatment of the pill. */
      variant: {
        solid: 'bg-primary text-primary-foreground',
        glass:
          'border border-border bg-card text-foreground backdrop-blur-xl shadow-[inset_0_1px_0_0_color-mix(in_oklch,var(--foreground)_28%,transparent)]',
      },
    },
    defaultVariants: { variant: 'glass' },
  },
);

/**
 * A small pill label — the Liquid Glass system's badge voice. `glass` is a
 * translucent, blurred chip used for eyebrows above headings and status
 * tags; `solid` fills with the primary accent for the one tag that needs to
 * lead the eye (e.g. "Popular" on a pricing tier). The visual axis is an
 * explicit string union so the kit extractor surfaces it as a variant.
 */
export interface BadgeProps extends React.ComponentProps<'span'> {
  /** Visual treatment of the pill. `glass` is a translucent blurred chip, `solid` fills with the primary accent. */
  variant?: 'solid' | 'glass';
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
  { props: { variant: 'glass', children: 'New in 2026' }, label: 'Glass' },
  { props: { variant: 'solid', children: 'Popular' }, label: 'Solid' },
];
