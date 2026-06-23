import * as React from 'react';
import { cva } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const statVariants = cva('flex flex-col gap-1', {
  variants: {
    /** Horizontal alignment of the figure and its labels. */
    align: {
      left: 'items-start text-left',
      center: 'items-center text-center',
    },
    /** Type scale of the figure. */
    size: {
      md: '[--stat-size:1.875rem]',
      lg: '[--stat-size:3rem]',
    },
  },
  defaultVariants: { align: 'left', size: 'lg' },
});

/**
 * A single figure-and-label trust beat — the Finance system's signature
 * data primitive. The figure renders in JetBrains Mono (`font-mono`) with
 * tabular numerals so columns of metrics line up cleanly and read as data.
 * Token-themed: the figure uses `--foreground`, the label `--muted-foreground`,
 * and an optional caption sits in the emerald `--primary`. `align` and `size`
 * are explicit string unions so the kit extractor surfaces them as variant axes.
 */
export interface StatProps extends React.ComponentProps<'div'> {
  /** The figure. Number + optional unit, max 7 characters (e.g. "$4.2B", "99.99%", "12M+"). */
  value: string;
  /** What the figure measures. 1–4 words, sentence case (e.g. "Assets under management"). */
  label: string;
  /** Optional accent caption under the label. 1–4 words (e.g. "year over year"). */
  caption?: string | null;
  /** Horizontal alignment of the figure and its labels. */
  align?: 'left' | 'center';
  /** Type scale of the figure. `lg` for hero metric rows, `md` for inline stats. */
  size?: 'md' | 'lg';
}

export function Stat({
  className,
  value,
  label,
  caption,
  align,
  size,
  ...props
}: StatProps) {
  return (
    <div className={cn(statVariants({ align, size }), className)} {...props}>
      <span className="font-mono font-semibold tracking-tight tabular-nums text-foreground text-[length:var(--stat-size)] leading-none">
        {value}
      </span>
      <span className="text-sm font-medium text-muted-foreground">{label}</span>
      {caption ? (
        <span className="text-xs font-medium tracking-wide text-primary">
          {caption}
        </span>
      ) : null}
    </div>
  );
}

export const StatShowcase: { props: StatProps; label?: string }[] = [
  {
    props: { value: '$4.2B', label: 'Assets under management', caption: 'across 40 markets', size: 'lg', align: 'left' },
    label: 'Large',
  },
  {
    props: { value: '99.99%', label: 'Platform uptime', size: 'md', align: 'center' },
    label: 'Medium, centered',
  },
];
