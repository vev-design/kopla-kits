import * as React from 'react';
import { cva } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-none border px-2.5 py-1 font-mono text-xs tracking-[0.12em] uppercase',
  {
    variants: {
      /** Visual treatment of the tag. */
      variant: {
        solid: 'border-primary bg-primary text-primary-foreground',
        outline: 'border-border bg-transparent text-muted-foreground',
        accent: 'border-accent bg-transparent text-accent',
      },
    },
    defaultVariants: { variant: 'outline' },
  },
);

/**
 * A hard-edged mono tag — the system's stamp-like label. Square corners, a
 * full border, and uppercase tracked mono type. Used for eyebrow chips,
 * category stamps in the marquee, and status labels. `solid` is the acid-lime
 * fill reserved for the single most important tag on a page; `outline` is the
 * quiet default; `accent` uses the secondary magenta for a second point of
 * emphasis. The visual axis is an explicit string union so the kit extractor
 * surfaces it as a variant.
 */
export interface BadgeProps extends React.ComponentProps<'span'> {
  /** Visual treatment: `solid` acid-lime fill, `outline` quiet border, `accent` magenta border. */
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
  { props: { variant: 'solid', children: 'New' }, label: 'Solid' },
  { props: { variant: 'outline', children: 'Archive' }, label: 'Outline' },
  { props: { variant: 'accent', children: 'Limited' }, label: 'Accent' },
];
