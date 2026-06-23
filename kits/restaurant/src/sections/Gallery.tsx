import { Badge } from '@/components/Badge';
import { Reveal, Stagger } from '@/motion';
import { cn } from '@/lib/utils';
import type { SectionBaseProps } from '@/types';

/**
 * A responsive image grid of dishes and the dining room — a visual interlude
 * that lets the food and atmosphere speak. Use `variant` to choose a tidy
 * even grid or a taller mosaic. Place after the story to break the reading
 * rhythm with imagery.
 */
export interface GalleryProps extends SectionBaseProps {
  /** Small overline above the heading. 1–3 words, title case (e.g. "Gallery"). */
  overline?: string | null;
  /** Section heading. 1 sentence, 2–6 words, no trailing period. */
  heading: string;
  /** Gallery images. 4–8 items. */
  images: {
    /**
     * Image URL — a dish, plating, or interior shot.
     * @kind image
     */
    src: string;
    /** Short caption / alt text. 2–6 words, no trailing period. */
    caption?: string | null;
  }[];
  /** Grid style: an even three-column grid or a taller mosaic. */
  variant?: 'grid' | 'mosaic';
}

export function Gallery({
  id,
  overline,
  heading,
  images,
  variant = 'grid',
}: GalleryProps) {
  return (
    <section id={id ?? undefined} className="w-full bg-background">
      <div className="mx-auto w-full max-w-6xl px-6 py-24 md:py-32">
        <Reveal className="mb-14 flex flex-col items-center gap-4 text-center">
          {overline ? <Badge variant="gold">{overline}</Badge> : null}
          <h2 className="font-serif text-4xl font-medium tracking-tight text-balance md:text-5xl">
            {heading}
          </h2>
        </Reveal>
        <Stagger
          className={cn(
            'grid gap-4',
            variant === 'mosaic'
              ? 'grid-cols-2 md:grid-cols-4 md:[grid-auto-rows:14rem]'
              : 'grid-cols-2 md:grid-cols-3',
          )}
        >
          {images.map((image, i) => (
            <figure
              key={image.src}
              className={cn(
                'group relative overflow-hidden rounded-xl border border-border',
                variant === 'mosaic' && i % 5 === 0 && 'md:col-span-2 md:row-span-2',
              )}
            >
              <img
                src={image.src}
                alt={image.caption ?? ''}
                className={cn(
                  'size-full object-cover transition-transform duration-700 group-hover:scale-105',
                  variant === 'grid' && 'aspect-square',
                )}
              />
              {image.caption ? (
                <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background/90 to-transparent p-4 text-xs font-medium uppercase tracking-[0.18em] text-foreground opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  {image.caption}
                </figcaption>
              ) : null}
            </figure>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

export const GalleryDemo: GalleryProps = {
  overline: 'Gallery',
  heading: 'From the Pass',
  images: [
    {
      src: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1000&q=80',
      caption: 'Seared duck',
    },
    {
      src: 'https://images.unsplash.com/photo-1424847651672-bf20a4b0982b?auto=format&fit=crop&w=1000&q=80',
      caption: 'The dining room',
    },
    {
      src: 'https://images.unsplash.com/photo-1432139555190-58524dae6a55?auto=format&fit=crop&w=1000&q=80',
      caption: 'Plated dessert',
    },
    {
      src: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1000&q=80',
      caption: 'Candle-lit tables',
    },
    {
      src: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=1000&q=80',
      caption: 'Fresh catch',
    },
    {
      src: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1000&q=80',
      caption: 'The cellar',
    },
  ],
  variant: 'mosaic',
};
