import * as React from 'react';
import { cva } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full font-mono text-xs font-medium uppercase tracking-[0.18em]',
  {
    variants: {
      /** Visual treatment of the chip. */
      variant: {
        outline: 'border border-border bg-card px-3 py-1 text-muted-foreground',
        solid: 'bg-foreground px-3 py-1 text-background',
        accent: 'bg-accent px-3 py-1 text-accent-foreground',
      },
    },
    defaultVariants: { variant: 'outline' },
  },
);

/**
 * A small monospace pill — the Kinetic Type system's badge voice. Used for
 * eyebrow labels above headlines and short status tags. Token-themed:
 * `outline` is a muted hairline chip, `solid` inverts to ink, `accent` fills
 * with the lime accent for the one moment that should shout. The visual axis
 * is an explicit string union so the kit extractor surfaces it as a variant.
 */
export interface BadgeProps extends React.ComponentProps<'span'> {
  /** Visual treatment of the chip. `outline` is a muted hairline chip, `solid` inverts to ink, `accent` fills with the lime accent. */
  variant?: 'outline' | 'solid' | 'accent';
  /** Badge label / content. 1–4 words, no punctuation. */
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
  { props: { variant: 'outline', children: 'New drop' }, label: 'Outline' },
  { props: { variant: 'solid', children: 'Live now' }, label: 'Solid' },
  { props: { variant: 'accent', children: '2026 campaign' }, label: 'Accent' },
];
