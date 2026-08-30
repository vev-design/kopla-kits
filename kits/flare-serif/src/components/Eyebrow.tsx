import * as React from 'react';
import { cva } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const eyebrowVariants = cva(
  'font-sans text-[0.6875rem] font-semibold uppercase [letter-spacing:var(--tracking-label)]',
  {
    variants: {
      tone: {
        accent: 'text-primary',
        ink: 'text-foreground',
        quiet: 'text-muted-foreground',
      },
    },
    defaultVariants: { tone: 'accent' },
  },
);

/**
 * The tracked caps-only section label — this system's smallest voice, and
 * the only place besides rules and marks where the hot accent is allowed to
 * appear. Set far wider than the display face (26% tracking against the
 * display's 3%) so it reads as an index label rather than a small heading.
 */
export interface EyebrowProps extends Omit<React.ComponentProps<'p'>, 'children'> {
  /** The label text. 1–3 words, any casing — it is uppercased by the component. */
  children?: React.ReactNode;
  /** Which of the three label colors to use. */
  tone?: 'accent' | 'ink' | 'quiet';
}

export function Eyebrow({ className, children, tone = 'accent', ...props }: EyebrowProps) {
  return (
    <p className={cn(eyebrowVariants({ tone }), className)} {...props}>
      {children}
    </p>
  );
}

export const EyebrowShowcase: { props: EyebrowProps; label?: string }[] = [
  { props: { tone: 'accent' }, label: 'Accent' },
  { props: { tone: 'ink' }, label: 'Ink' },
  { props: { tone: 'quiet' }, label: 'Quiet' },
];
