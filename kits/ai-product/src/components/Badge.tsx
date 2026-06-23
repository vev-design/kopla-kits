import * as React from 'react';
import { cva } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const badgeVariants = cva('inline-flex items-center gap-1.5', {
  variants: {
    /** Visual treatment of the pill. */
    variant: {
      solid:
        'rounded-full bg-primary px-2.5 py-0.5 text-xs font-medium text-primary-foreground',
      outline:
        'rounded-full border border-border bg-secondary/40 px-3 py-1 font-mono text-xs font-medium tracking-wide text-muted-foreground',
      accent:
        'rounded-full border border-ring/30 bg-accent/40 px-3 py-1 font-mono text-xs font-medium tracking-wide text-accent-foreground',
    },
  },
  defaultVariants: { variant: 'outline' },
});

/**
 * A small pill label — the AI Product system's badge voice. Used for the
 * monospace eyebrow chips above headings, status tags ("Popular" on a pricing
 * tier), and small feature flags. Token-themed: `solid` fills with the white
 * `--primary`, `outline` is a muted monospace chip, and `accent` carries the
 * iris `--accent` tint for emphasis. The visual axis is an explicit string
 * union so the kit extractor surfaces it as a variant.
 */
export interface BadgeProps extends React.ComponentProps<'span'> {
  /** Visual treatment of the pill. `solid` is filled white, `outline` is a muted chip, `accent` is the iris-tinted chip. */
  variant?: 'solid' | 'outline' | 'accent';
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
  { props: { variant: 'outline', children: 'v2.0 — out now' }, label: 'Outline' },
  { props: { variant: 'accent', children: 'New model' }, label: 'Accent' },
];
