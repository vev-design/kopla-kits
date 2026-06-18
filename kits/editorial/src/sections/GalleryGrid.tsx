import { Reveal, Stagger } from '@/motion';
import { cn } from '@/lib/utils';
import { Eyebrow, Figure } from '@/components';
import type { SectionBaseProps } from '@/types';

/**
 * A multi-image spread that opens the page back up after the type-led
 * body — the visual exhale before the close. Renders a two- or
 * three-column grid of captioned photographs under an optional section
 * heading. Each image reveals in sequence as the grid enters.
 */
export interface GalleryGridProps extends SectionBaseProps {
  /** Optional kicker above the heading. 1–3 words, Title Case. */
  kicker?: string | null;
  /** Optional section heading above the grid. 2–6 words, no trailing period. */
  heading?: string | null;
  /** Image tiles. 3–6 items. */
  items: {
    /**
     * Photograph URL for this tile.
     * @kind image
     */
    image: string;
    /** Caption under the tile. 1 sentence, 4–14 words, no trailing period. */
    caption?: string | null;
  }[];
  /** Column count on wide screens. `two` is calmer; `three` is denser. */
  columns?: 'two' | 'three';
}

export function GalleryGrid({
  id,
  kicker,
  heading,
  items,
  columns = 'three',
}: GalleryGridProps) {
  return (
    <section id={id ?? undefined} className="w-full bg-background py-16 md:py-24">
      <div className="mx-auto w-full max-w-6xl px-6">
        {kicker || heading ? (
          <Reveal className="mb-10 max-w-2xl">
            {kicker ? <Eyebrow>{kicker}</Eyebrow> : null}
            {heading ? (
              <h2 className="mt-3 font-serif text-3xl leading-tight font-bold tracking-[-0.01em] text-foreground md:text-4xl">
                {heading}
              </h2>
            ) : null}
          </Reveal>
        ) : null}
        <Stagger
          className={cn(
            'grid grid-cols-1 gap-6 sm:grid-cols-2',
            columns === 'three' ? 'lg:grid-cols-3' : 'lg:grid-cols-2',
          )}
        >
          {items.map((item, i) => (
            <Figure key={i} ratio="portrait" caption={item.caption}>
              <img
                src={item.image}
                alt={item.caption ?? ''}
                className="h-full w-full object-cover"
              />
            </Figure>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

export const GalleryGridDemo: GalleryGridProps = {
  kicker: 'Field Notes',
  heading: 'The places the story was made',
  items: [
    {
      image:
        'https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?auto=format&fit=crop&w=900&q=80',
      caption: 'The morning meeting, before the assignments',
    },
    {
      image:
        'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=900&q=80',
      caption: 'Notebooks from a single feature, stacked',
    },
    {
      image:
        'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=900&q=80',
      caption: 'The desk where the long pieces are read aloud',
    },
    {
      image:
        'https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=900&q=80',
      caption: 'Galleys, marked and re-marked',
    },
    {
      image:
        'https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=900&q=80',
      caption: 'The archive, kept on paper on purpose',
    },
    {
      image:
        'https://images.unsplash.com/photo-1532153975070-2e9ab71f1b14?auto=format&fit=crop&w=900&q=80',
      caption: 'The first edition off the press',
    },
  ],
  columns: 'three',
};
