import * as React from 'react';

import { cn } from '@/lib/utils';

/**
 * The small uppercase label that sits above a slide's heading — the deck
 * system's kicker voice (wide-tracked, semibold, primary-colored). Token-themed:
 * it picks up the system's `--primary` and `--font-sans` automatically. The
 * spacing below it varies per slide, so callers pass the margin via `className`.
 */
export interface EyebrowProps extends React.ComponentProps<'p'> {
  /** The label text. 1–3 words, no punctuation (e.g. "Traction"). */
  children?: React.ReactNode;
}

export function Eyebrow({ className, children, ...props }: EyebrowProps) {
  return (
    <p
      className={cn(
        'text-xs font-semibold tracking-[0.28em] text-primary uppercase',
        className,
      )}
      {...props}
    >
      {children}
    </p>
  );
}

export const EyebrowShowcase: { props: EyebrowProps; label?: string }[] = [
  { props: { children: 'Traction' }, label: 'Default' },
];
