import { Badge } from '@/components/Badge';
import { Divider } from '@/components/Divider';
import { Reveal } from '@/motion';
import { cn } from '@/lib/utils';
import type { SectionBaseProps } from '@/types';

/**
 * A chef / philosophy beat — a single image paired with a column of prose
 * about the kitchen, the sourcing, or the room. Use `variant` to flip the
 * image to either side. Place after the menu to give the food a story.
 */
export interface StoryProps extends SectionBaseProps {
  /** Small overline above the heading. 1–3 words, title case (e.g. "Our Story"). */
  overline?: string | null;
  /** Section heading. 1 sentence, 3–8 words, no trailing period. */
  heading: string;
  /** Body paragraphs. 1–3 items, each 1–3 sentences, 25–60 words. */
  paragraphs: string[];
  /** Optional attribution line (chef name + role). 2–6 words, title case. */
  attribution?: string | null;
  /**
   * Portrait or kitchen image beside the text. Portrait aspect reads best.
   * @kind image
   */
  image: string;
  /** Which side the image sits on (desktop). */
  variant?: 'image-left' | 'image-right';
}

export function Story({
  id,
  overline,
  heading,
  paragraphs,
  attribution,
  image,
  variant = 'image-left',
}: StoryProps) {
  return (
    <section id={id ?? undefined} className="w-full bg-card/40">
      <div className="mx-auto grid w-full max-w-6xl items-center gap-12 px-6 py-24 md:grid-cols-2 md:gap-16 md:py-32">
        <Reveal
          className={cn(
            'overflow-hidden rounded-xl border border-border',
            variant === 'image-right' ? 'md:order-2' : 'md:order-1',
          )}
        >
          <img
            src={image}
            alt=""
            className="aspect-[4/5] w-full object-cover"
          />
        </Reveal>
        <Reveal
          className={cn(
            'flex flex-col gap-6',
            variant === 'image-right' ? 'md:order-1' : 'md:order-2',
          )}
        >
          {overline ? <Badge variant="gold">{overline}</Badge> : null}
          <h2 className="font-serif text-4xl font-medium tracking-tight text-balance md:text-5xl">
            {heading}
          </h2>
          <Divider align="full" className="max-w-[8rem] justify-start" />
          <div className="flex flex-col gap-4">
            {paragraphs.map((paragraph, i) => (
              <p key={i} className="text-base text-muted-foreground text-pretty md:text-lg">
                {paragraph}
              </p>
            ))}
          </div>
          {attribution ? (
            <p className="font-serif text-lg italic text-primary">{attribution}</p>
          ) : null}
        </Reveal>
      </div>
    </section>
  );
}

export const StoryDemo: StoryProps = {
  overline: 'Our Story',
  heading: 'Cooked with patience, served with care',
  paragraphs: [
    'We opened Maison Laurent to cook the food we missed — unhurried, seasonal, and rooted in the farms and waters around us. Every plate begins with what the morning market offers.',
    'The room seats just forty. We like it that way: close enough to greet every table, small enough that nothing leaves the pass without a second look.',
  ],
  attribution: 'Chef Élise Laurent',
  image:
    'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=1200&q=80',
  variant: 'image-left',
};
