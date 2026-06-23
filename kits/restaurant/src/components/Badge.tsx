import * as React from 'react';
import { cva } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center text-[0.7rem] font-medium uppercase tracking-[0.22em]',
  {
    variants: {
      /** Visual treatment of the label. */
      variant: {
        gold: 'text-primary',
        outline:
          'rounded-full border border-primary/40 px-3.5 py-1 text-primary',
        solid:
          'rounded-full bg-primary px-3.5 py-1 text-primary-foreground',
      },
    },
    defaultVariants: { variant: 'gold' },
  },
);

/**
 * A small overline label — the restaurant system's eyebrow voice. Used for
 * section overlines ("The Menu"), the cuisine/location line over the hero,
 * and chips like "Reservations recommended". Token-themed: `gold` is bare
 * gold text, `outline` is a bordered gold chip, `solid` fills with gold. The
 * visual axis is an explicit string union so the kit extractor surfaces it.
 */
export interface BadgeProps extends React.ComponentProps<'span'> {
  /** Visual treatment. `gold` is bare text, `outline` is a bordered chip, `solid` is filled. */
  variant?: 'gold' | 'outline' | 'solid';
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
  { props: { variant: 'gold', children: 'The Menu' }, label: 'Gold' },
  { props: { variant: 'outline', children: 'Seasonal' }, label: 'Outline' },
  { props: { variant: 'solid', children: 'Reserve' }, label: 'Solid' },
];
