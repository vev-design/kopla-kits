import * as React from 'react';
import { cva } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const badgeVariants = cva('', {
  variants: {
    /** Visual treatment of the pill. */
    variant: {
      solid:
        'rounded-full bg-primary px-2.5 py-0.5 text-xs font-medium text-primary-foreground',
      outline:
        'inline-flex items-center rounded-full border border-border bg-background px-3 py-1 text-xs font-medium tracking-wide text-accent-foreground',
    },
  },
  defaultVariants: { variant: 'solid' },
});

/**
 * A small pill label — the SaaS system's badge voice. Used for status tags
 * ("Popular" on a pricing tier) and eyebrow chips above a hero headline.
 * Token-themed: the `solid` treatment fills with `--primary`, the `outline`
 * treatment is a bordered chip on `--background`. The visual axis is an
 * explicit string union so the kit extractor surfaces it as a variant.
 */
export interface BadgeProps extends React.ComponentProps<'span'> {
  /** Visual treatment of the pill. `solid` is filled, `outline` is a bordered chip. */
  variant?: 'solid' | 'outline';
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
  { props: { variant: 'solid', children: 'Popular' }, label: 'Solid' },
  { props: { variant: 'outline', children: 'New in 2026' }, label: 'Outline' },
];
