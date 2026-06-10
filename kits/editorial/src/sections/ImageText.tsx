import { Reveal } from '@/motion';
import { cn } from '@/lib/utils';
import type { SectionBaseProps } from '@/types';

/**
 * A body beat that pairs one photograph with a block of prose. Use these
 * down the article and flip the `variant` between rows so the image
 * alternates sides and the read never feels mechanical. The text column
 * holds a small kicker, a serif subhead, and a paragraph or two; the
 * image column holds a single supporting photo with an optional caption.
 */
export interface ImageTextProps extends SectionBaseProps {
  /** Small kicker above the subhead. 1–3 words, Title Case. */
  kicker?: string | null;
  /** Section subhead. 1 line, 3–8 words, no trailing period. */
  heading: string;
  /** Body copy for this beat. 2–4 sentences, 50–110 words. */
  body: string;
  /**
   * Supporting photograph URL.
   * @kind image
   */
  image: string;
  /** Caption under the image. 1 sentence, 5–16 words, no trailing period. */
  caption?: string | null;
  /** Which side the image sits on. `image-left` puts the photo first; `image-right` puts the text first. */
  variant?: 'image-left' | 'image-right';
}

export function ImageText({
  id,
  kicker,
  heading,
  body,
  image,
  caption,
  variant = 'image-left',
}: ImageTextProps) {
  const imageFirst = variant === 'image-left';
  return (
    <section id={id ?? undefined} className="w-full bg-background py-14 md:py-20">
      <Reveal className="mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-10 px-6 md:grid-cols-2 md:gap-16">
        <figure className={cn('w-full', imageFirst ? 'md:order-1' : 'md:order-2')}>
          <div className="aspect-[4/5] w-full overflow-hidden rounded-md bg-muted">
            <img
              src={image}
              alt={caption ?? heading}
              className="h-full w-full object-cover"
            />
          </div>
          {caption ? (
            <figcaption className="mt-3 font-sans text-sm text-muted-foreground">
              {caption}
            </figcaption>
          ) : null}
        </figure>
        <div className={cn(imageFirst ? 'md:order-2' : 'md:order-1')}>
          {kicker ? (
            <p className="font-sans text-xs font-semibold tracking-[0.24em] text-primary uppercase">
              {kicker}
            </p>
          ) : null}
          <h2 className="mt-4 font-serif text-3xl leading-tight font-bold tracking-[-0.01em] text-balance text-foreground md:text-4xl">
            {heading}
          </h2>
          <p className="mt-5 font-sans text-lg leading-relaxed text-muted-foreground text-pretty">
            {body}
          </p>
        </div>
      </Reveal>
    </section>
  );
}

export const ImageTextDemo: ImageTextProps[] = [
  {
    kicker: 'The Method',
    heading: 'Weeks, not minutes',
    body: 'Editors describe a workflow that looks almost antique: a story is assigned, then reported for as long as it takes, then read aloud in a room before it ships. Nothing is published to hit a number. The result is fewer pieces, but each one is meant to be the only thing you read that morning.',
    image:
      'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1200&q=80',
    caption: 'A draft marked up the old way, in pencil',
    variant: 'image-left',
  },
  {
    kicker: 'The Reader',
    heading: 'An audience that stayed',
    body: 'The bet was that a smaller, paying readership would outlast a larger borrowed one. So far the numbers are quiet but durable: renewal rates that look more like a magazine than a feed, and a comment culture that reads like correspondence. The readers, it turns out, were never the problem.',
    image:
      'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=1200&q=80',
    caption: 'A reader with the print edition, unhurried',
    variant: 'image-right',
  },
];
