import * as React from 'react';
import { cva } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center font-mono text-xs uppercase tracking-[0.18em]',
  {
    variants: {
      /** Visual treatment of the label. */
      variant: {
        outline:
          'rounded-sm border border-foreground bg-transparent px-2.5 py-1 text-foreground',
        solid:
          'rounded-sm bg-foreground px-2.5 py-1 text-background',
        accent:
          'rounded-sm bg-primary px-2.5 py-1 text-primary-foreground',
      },
    },
    defaultVariants: { variant: 'outline' },
  },
);

/**
 * A monospace label chip — the Agency system's eyebrow voice. Used for index
 * numbers, category tags, and section labels. Token-themed: `outline` is a
 * hairline-bordered chip, `solid` fills with the near-black `--foreground`, and
 * `accent` fills with the electric `--primary`. The visual axis is an explicit
 * string union so the kit extractor surfaces it as a variant.
 */
export interface BadgeProps extends React.ComponentProps<'span'> {
  /** Visual treatment. `outline` is a hairline chip, `solid` is filled ink, `accent` is filled cobalt. */
  variant?: 'outline' | 'solid' | 'accent';
  /** Badge label / content. 1–3 words or a short index, uppercase reads best. */
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
  { props: { variant: 'outline', children: 'Studio' }, label: 'Outline' },
  { props: { variant: 'solid', children: 'New' }, label: 'Solid' },
  { props: { variant: 'accent', children: 'Featured' }, label: 'Accent' },
];
