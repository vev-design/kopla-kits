import * as React from 'react';
import { cva } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center font-mono text-[0.7rem] font-medium uppercase tracking-[0.18em]',
  {
    variants: {
      /** Visual treatment of the label. */
      variant: {
        solid: 'rounded-sm bg-primary px-2.5 py-1 text-primary-foreground',
        outline:
          'rounded-sm border border-border bg-background px-2.5 py-1 text-muted-foreground',
        rule: 'gap-3 border-t border-primary pt-2 text-primary',
      },
    },
    defaultVariants: { variant: 'rule' },
  },
);

/**
 * A small typographic label — the report's kicker voice. Mono, uppercase, and
 * wide-tracked for a serious documentary tone. `rule` is the signature: a
 * label sitting under a hairline rule above a heading. `solid` fills with the
 * navy `--primary`, `outline` is a bordered chip. The visual axis is an
 * explicit string union so the kit extractor surfaces it as a variant.
 */
export interface BadgeProps extends React.ComponentProps<'span'> {
  /** Visual treatment. `rule` is a labelled hairline, `solid` is filled, `outline` is a bordered chip. */
  variant?: 'solid' | 'outline' | 'rule';
  /** Label text. 1–4 words, no trailing punctuation (e.g. "Fiscal Year 2025"). */
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
  { props: { variant: 'rule', children: 'Fiscal Year 2025' }, label: 'Rule' },
  { props: { variant: 'solid', children: 'Audited' }, label: 'Solid' },
  { props: { variant: 'outline', children: 'Segment' }, label: 'Outline' },
];
