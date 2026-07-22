import * as React from 'react';
import { cva } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-baseline gap-3 font-mono text-[0.7rem] font-medium uppercase tracking-[0.18em]',
  {
    variants: {
      /** Visual treatment of the label. */
      variant: {
        solid: 'rounded-sm bg-primary px-2.5 py-1 text-primary-foreground',
        outline:
          'rounded-sm border border-border bg-background px-2.5 py-1 text-muted-foreground',
        rule: 'border-t border-primary pt-2 text-primary',
      },
    },
    defaultVariants: { variant: 'rule' },
  },
);

/**
 * A small typographic label — the report's kicker voice. Mono, uppercase, and
 * wide-tracked for a serious documentary tone. `rule` is the signature: a
 * label sitting under a hairline rule above a heading. An optional `index`
 * turns it into the report's table-of-contents motif — "02 — Financial
 * Highlights" with the numeral in tabular figures. `solid` fills with the navy
 * `--primary`, `outline` is a bordered chip. The visual axis is an explicit
 * string union so the kit extractor surfaces it as a variant.
 */
export interface BadgeProps extends React.ComponentProps<'span'> {
  /** Visual treatment. `rule` is a labelled hairline, `solid` is filled, `outline` is a bordered chip. */
  variant?: 'solid' | 'outline' | 'rule';
  /** Optional TOC-style index numeral set before the label in tabular figures. 2 digits (e.g. "02"). */
  index?: string | null;
  /** Label text. 1–4 words, no trailing punctuation (e.g. "Fiscal Year 2025"). */
  children?: React.ReactNode;
}

export function Badge({ className, variant, index, children, ...props }: BadgeProps) {
  return (
    <span
      data-kopla-component="Badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    >
      {index ? <span className="tabular-nums">{index}</span> : null}
      {index && children ? (
        <span aria-hidden className="opacity-40">
          —
        </span>
      ) : null}
      {children}
    </span>
  );
}

export const BadgeShowcase: { props: BadgeProps; label?: string }[] = [
  { props: { variant: 'rule', children: 'Fiscal Year 2025' }, label: 'Rule' },
  {
    props: { variant: 'rule', index: '02', children: 'Financial Highlights' },
    label: 'Numbered rule',
  },
  { props: { variant: 'solid', children: 'Audited' }, label: 'Solid' },
  { props: { variant: 'outline', children: 'Segment' }, label: 'Outline' },
];
