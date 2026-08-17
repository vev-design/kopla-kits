import * as React from 'react';
import { cva } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const tileVariants = cva(
  'flex aspect-square w-full items-center justify-center overflow-hidden rounded-sm leading-none select-none',
  {
    variants: {
      face: {
        /** The inscriptional display face — Roman square-capital proportions. */
        display: 'font-display',
        /** The expressive sans, with spurs and wedge terminals. */
        wedge: 'font-wedge',
      },
      tone: {
        paper: 'bg-card text-foreground border border-border',
        ink: 'bg-foreground text-background',
        mark: 'bg-primary text-primary-foreground',
      },
    },
    defaultVariants: { face: 'display', tone: 'paper' },
  },
);

/**
 * A single letterform shown large on its own tile — the unit a specimen page
 * is built from. Used for character sets, anatomy callouts, and stylistic-set
 * comparisons, where the glyph itself is the content rather than an ornament.
 */
export interface GlyphTileProps extends Omit<React.ComponentProps<'div'>, 'children'> {
  /** The character to display. Exactly 1 character. */
  glyph?: string;
  /** Which of the system's two type voices to draw it in. */
  face?: 'display' | 'wedge';
  /** Tile treatment — paper, inverted ink, or the accent mark. */
  tone?: 'paper' | 'ink' | 'mark';
  /** Font weight, 200–900. Only the wedge face is fully variable. */
  weight?: number;
  /** Turn on the locked stylistic-set alternate for this glyph. */
  alternate?: boolean;
}

export function GlyphTile({
  className,
  glyph = 'A',
  face = 'display',
  tone = 'paper',
  weight = 400,
  alternate = false,
  style,
  ...props
}: GlyphTileProps) {
  return (
    <div
      className={cn(tileVariants({ face, tone }), alternate && 'alt-set', className)}
      style={{ fontWeight: weight, fontSize: 'clamp(3rem, 9vw, 7rem)', ...style }}
      {...props}
    >
      {glyph}
    </div>
  );
}

export const GlyphTileShowcase: { props: GlyphTileProps; label?: string }[] = [
  { props: { glyph: 'R', face: 'display', tone: 'paper' }, label: 'Display / paper' },
  { props: { glyph: 'R', face: 'display', tone: 'ink' }, label: 'Display / ink' },
  { props: { glyph: 'g', face: 'wedge', tone: 'mark', weight: 700 }, label: 'Wedge / mark' },
  { props: { glyph: 'a', face: 'wedge', tone: 'paper', alternate: true }, label: 'Alternate' },
];
