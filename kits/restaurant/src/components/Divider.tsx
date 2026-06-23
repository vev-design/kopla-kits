import * as React from 'react';
import { cva } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const dividerVariants = cva('flex items-center justify-center gap-3 text-primary', {
  variants: {
    /** How wide the rule spreads. */
    align: {
      center: 'mx-auto w-full max-w-xs',
      full: 'w-full',
    },
  },
  defaultVariants: { align: 'center' },
});

/**
 * A small decorative ornament — the restaurant system's section break. A thin
 * gold rule with a centered diamond, used between menu categories and to set
 * off overlines from headlines. Token-themed in `--primary` gold. The width
 * axis is an explicit string union so the kit extractor surfaces it.
 */
export interface DividerProps extends Omit<React.ComponentProps<'div'>, 'children'> {
  /** Spread of the rule: a centered short rule or a full-width line. */
  align?: 'center' | 'full';
}

export function Divider({ className, align, ...props }: DividerProps) {
  return (
    <div
      role="separator"
      className={cn(dividerVariants({ align }), className)}
      {...props}
    >
      <span className="h-px flex-1 bg-primary/40" aria-hidden />
      <span className="size-1.5 rotate-45 bg-primary" aria-hidden />
      <span className="h-px flex-1 bg-primary/40" aria-hidden />
    </div>
  );
}

export const DividerShowcase: { props: DividerProps; label?: string }[] = [
  { props: { align: 'center' }, label: 'Center' },
  { props: { align: 'full' }, label: 'Full' },
];
