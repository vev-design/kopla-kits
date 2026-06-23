import * as React from 'react';
import { cva } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full text-xs font-semibold tracking-wide',
  {
    variants: {
      /** Visual treatment of the pill. */
      variant: {
        soft: 'bg-accent px-3.5 py-1 text-accent-foreground',
        solid: 'bg-primary px-3.5 py-1 text-primary-foreground',
        outline: 'border border-border bg-card px-3.5 py-1 text-muted-foreground',
      },
    },
    defaultVariants: { variant: 'soft' },
  },
);

/**
 * A small rounded pill label — the Wellness system's badge voice. Used for
 * eyebrow chips above a headline, a class level ("All levels"), or a
 * "Most loved" tag on a membership tier. Fully rounded and soft to match the
 * studio's calm, organic feel. Token-themed: `soft` rests on the muted sage
 * `--accent`, `solid` fills with `--primary`, `outline` is a quiet bordered
 * chip. The visual axis is an explicit string union so the kit extractor
 * surfaces it as a variant.
 */
export interface BadgeProps extends React.ComponentProps<'span'> {
  /** Visual treatment of the pill. `soft` is the calm sage chip, `solid` fills, `outline` is bordered. */
  variant?: 'soft' | 'solid' | 'outline';
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
  { props: { variant: 'soft', children: 'New session' }, label: 'Soft' },
  { props: { variant: 'solid', children: 'Most loved' }, label: 'Solid' },
  { props: { variant: 'outline', children: 'All levels' }, label: 'Outline' },
];
