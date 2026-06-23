import * as React from 'react';
import { cva } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const badgeVariants = cva('inline-flex items-center', {
  variants: {
    /** Visual treatment of the pill. */
    variant: {
      solid:
        'rounded-full bg-primary px-2.5 py-0.5 text-xs font-medium text-primary-foreground',
      outline:
        'rounded-full border border-border bg-background px-3 py-1 text-xs font-medium tracking-wide text-accent-foreground',
      soft:
        'rounded-full bg-accent px-3 py-1 text-xs font-medium tracking-wide text-accent-foreground',
    },
  },
  defaultVariants: { variant: 'soft' },
});

/**
 * A small pill label — the Finance system's badge voice. Used for hero
 * eyebrows, "Recommended" tags on a pricing tier, and compliance chips in the
 * security section. Token-themed: `solid` fills with `--primary`, `outline` is
 * a bordered chip, `soft` is a quiet tinted chip on `--accent`. The visual axis
 * is an explicit string union so the kit extractor surfaces it as a variant.
 */
export interface BadgeProps extends React.ComponentProps<'span'> {
  /** Visual treatment of the pill. `solid` filled, `outline` bordered, `soft` tinted. */
  variant?: 'solid' | 'outline' | 'soft';
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
  { props: { variant: 'solid', children: 'Recommended' }, label: 'Solid' },
  { props: { variant: 'outline', children: 'New' }, label: 'Outline' },
  { props: { variant: 'soft', children: 'SIPC insured' }, label: 'Soft' },
];
