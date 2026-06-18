import * as React from 'react';

import { cn } from '@/lib/utils';

/**
 * A labelled metadata pair — a small uppercase term over a value — used in
 * the project meta row (Year, Role). Renders a `<dt>`/`<dd>` couple, so place
 * it inside a `<dl>`. Token-themed: the term is `text-muted-foreground`, the
 * value `font-medium`.
 */
export interface StatProps extends React.ComponentProps<'div'> {
  /** The metadata label. 1 word, e.g. "Year". */
  label: string;
  /** The value. ~1–3 words, e.g. "2025" or "Lead designer". */
  value: string;
}

export function Stat({ label, value, className, ...props }: StatProps) {
  return (
    <div className={cn('flex flex-col gap-0.5', className)} {...props}>
      <dt className="text-xs uppercase tracking-wider text-muted-foreground">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}

export const StatShowcase: { props: StatProps; label?: string }[] = [
  { props: { label: 'Year', value: '2025' }, label: 'Year' },
  { props: { label: 'Role', value: 'Lead designer' }, label: 'Role' },
];
