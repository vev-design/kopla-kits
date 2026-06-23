import * as React from 'react';
import { cva } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const figureVariants = cva(
  'block font-serif font-semibold leading-none tracking-tight tabular-nums',
  {
    variants: {
      /** Size of the headline figure. */
      size: {
        md: 'text-4xl md:text-5xl',
        lg: 'text-5xl md:text-6xl',
        xl: 'text-6xl md:text-7xl lg:text-8xl',
      },
      /** Color treatment of the figure. */
      tone: {
        ink: 'text-foreground',
        navy: 'text-primary',
      },
    },
    defaultVariants: { size: 'lg', tone: 'navy' },
  },
);

/**
 * The report's signature primitive: an oversized serif figure with a label and
 * an optional change indicator. Tabular figures keep columns of numbers aligned.
 * Token-themed — the figure rides `--primary` (navy) or `--foreground` (ink),
 * the label uses the muted mono voice. Both axes are explicit string unions so
 * the kit extractor surfaces them as variants. The numeric value is passed as
 * text so sections can animate a count-up around it.
 */
export interface StatProps extends React.ComponentProps<'div'> {
  /** Headline figure with optional prefix/suffix. Max 7 characters (e.g. "$4.2B", "+18%", "1,240"). */
  value: string;
  /** What the figure measures. 1–5 words, sentence case (e.g. "Total revenue"). */
  label: string;
  /** Optional year-over-year change line. Max 16 characters (e.g. "+12% YoY"). */
  delta?: string | null;
  /** Size of the headline figure. */
  size?: 'md' | 'lg' | 'xl';
  /** Color treatment of the figure. */
  tone?: 'ink' | 'navy';
}

export function Stat({
  className,
  value,
  label,
  delta,
  size,
  tone,
  ...props
}: StatProps) {
  return (
    <div className={cn('flex flex-col gap-3', className)} {...props}>
      <span className={cn(figureVariants({ size, tone }))}>{value}</span>
      <span className="font-mono text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </span>
      {delta ? (
        <span className="font-mono text-xs font-medium tracking-wide text-primary">
          {delta}
        </span>
      ) : null}
    </div>
  );
}

export const StatShowcase: { props: StatProps; label?: string }[] = [
  {
    props: { value: '$4.2B', label: 'Total revenue', delta: '+12% YoY', size: 'lg', tone: 'navy' },
    label: 'Navy (lg)',
  },
  {
    props: { value: '+18%', label: 'Operating margin', size: 'xl', tone: 'ink' },
    label: 'Ink (xl)',
  },
  {
    props: { value: '1,240', label: 'Employees worldwide', size: 'md', tone: 'navy' },
    label: 'Navy (md)',
  },
];
