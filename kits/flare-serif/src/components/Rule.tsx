import * as React from 'react';
import { cva } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const ruleVariants = cva('w-full border-0', {
  variants: {
    weight: {
      /** Matches the thin stroke where a flare serif tapers into its stem. */
      hair: 'h-px bg-border',
      /** Matches the optical weight of the flare itself. */
      flare: 'h-0.5 bg-foreground',
      /** The heaviest stroke in the family — reserved for section breaks. */
      stem: 'h-1 bg-foreground',
      /** The one accent rule; use once per screen at most. */
      mark: 'h-0.5 bg-primary',
    },
  },
  defaultVariants: { weight: 'hair' },
});

/**
 * A horizontal rule whose thickness is matched to the optical weight of the
 * display serif's strokes, so a rule never reads heavier or lighter than the
 * type it sits under. Rules and small marks are the only places this system
 * spends its single accent color.
 */
export interface RuleProps extends React.ComponentProps<'hr'> {
  /** Which stroke of the letterform this rule should match optically. */
  weight?: 'hair' | 'flare' | 'stem' | 'mark';
}

export function Rule({ className, weight = 'hair', ...props }: RuleProps) {
  return <hr className={cn(ruleVariants({ weight }), className)} {...props} />;
}

export const RuleShowcase: { props: RuleProps; label?: string }[] = [
  { props: { weight: 'hair' }, label: 'Hair' },
  { props: { weight: 'flare' }, label: 'Flare' },
  { props: { weight: 'stem' }, label: 'Stem' },
  { props: { weight: 'mark' }, label: 'Mark' },
];
