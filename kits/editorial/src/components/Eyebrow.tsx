import * as React from 'react';

import { cn } from '@/lib/utils';

/**
 * A small uppercase kicker set above a heading — the editorial system's
 * label voice (crimson, wide-tracked, sans). Token-themed: it picks up the
 * system's `--font-sans`, `--primary`, and letter-spacing automatically.
 */
export interface EyebrowProps extends React.ComponentProps<'p'> {
  /** The label text. 1–3 words, Title Case (e.g. "The Method"). */
  children?: React.ReactNode;
}

export function Eyebrow({ className, children, ...props }: EyebrowProps) {
  return (
    <p
      className={cn(
        'font-sans text-xs font-semibold tracking-[0.24em] text-primary uppercase',
        className,
      )}
      {...props}
    >
      {children}
    </p>
  );
}

export const EyebrowShowcase: { props: EyebrowProps; label?: string }[] = [
  { props: { children: 'The Method' }, label: 'Default' },
];
