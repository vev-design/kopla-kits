import * as React from 'react';
import { cva } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const figureMedia = cva('w-full overflow-hidden rounded-md bg-muted', {
  variants: {
    /** Aspect ratio of the media frame. */
    ratio: {
      wide: 'aspect-[16/9]',
      portrait: 'aspect-[3/4]',
      tall: 'aspect-[4/5]',
    },
  },
  defaultVariants: { ratio: 'wide' },
});

/**
 * A captioned media frame — the editorial system's image well. Wraps a photo
 * (or any media node) in a token-themed, ratio-controlled frame with an
 * optional caption set in the muted sans voice. Pass an `<img>` or a block as
 * children so the same frame serves photographs and charts alike.
 */
export interface FigureProps extends React.ComponentProps<'figure'> {
  /** Aspect ratio of the media frame. */
  ratio?: 'wide' | 'portrait' | 'tall';
  /** Caption shown under the media. 1 sentence, no trailing period. */
  caption?: string | null;
  /** The media to frame — typically an `<img>` or a `<MediaBlock>`. */
  children?: React.ReactNode;
}

export function Figure({ ratio, caption, children, className, ...props }: FigureProps) {
  return (
    <figure className={cn('w-full', className)} {...props}>
      <div className={figureMedia({ ratio })}>{children}</div>
      {caption ? (
        <figcaption className="mt-3 font-sans text-sm text-muted-foreground">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}

// Showcase entries are static data only (like a section's *Demo) — the media
// slot is a children prop, so the canvas previews the framed ratios + caption
// without an embedded image.
export const FigureShowcase: { props: FigureProps; label?: string }[] = [
  { props: { ratio: 'wide', caption: 'The newsroom floor at dusk' }, label: 'Wide' },
  { props: { ratio: 'portrait', caption: 'Notebooks from a single feature' }, label: 'Portrait' },
  { props: { ratio: 'tall', caption: 'A draft marked up the old way' }, label: 'Tall' },
];
